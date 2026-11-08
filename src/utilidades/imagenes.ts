import { URL_API } from "../config.ts";
import {
  LIMITES_IMAGENES,
  MENSAJES_IMAGENES,
  RUTA_IMAGENES,
  TIPO_MIME_IMAGEN,
  type Actividad,
  type ContenidoElemento,
  type FormatoImagen,
  type Imagen,
  type ImagenActividad,
} from "../tipos/contrato.ts";

// Las imágenes de los cursos (spec F13). Se piden con la cookie de la sesión: un <img> a la
// API la manda sola, porque la web y la API son del mismo sitio (brote_specs, research de
// F13, punto 5).

const KB = 1024;
const MB = 1024 * 1024;

export function urlImagen(id: string): string {
  return `${URL_API}${RUTA_IMAGENES}/${id}`;
}

export function esGif(imagen: Imagen): boolean {
  return imagen.formato === "gif";
}

// Un elemento de relacionar es un texto o una imagen.
export function esImagen(contenido: ContenidoElemento): contenido is ImagenActividad {
  return typeof contenido !== "string";
}

// Todas las imágenes de una actividad, en el orden en que aparecen.
export function imagenesDe(actividad: Actividad): ImagenActividad[] {
  switch (actividad.tipo) {
    case "teoria":
      return actividad.imagenes ?? [];
    case "opcionMultiple":
      return [
        ...(actividad.imagen ? [actividad.imagen] : []),
        ...actividad.opciones.flatMap((opcion) => ("imagen" in opcion ? [opcion.imagen] : [])),
      ];
    case "emparejar":
      return actividad.parejas.flatMap(({ izquierda, derecha }) =>
        [izquierda, derecha].filter(esImagen),
      );
    case "clasificar":
      return actividad.elementos.flatMap((elemento) =>
        "imagen" in elemento ? [elemento.imagen] : [],
      );
    case "ordenar":
      return actividad.elementos.filter(esImagen);
    default:
      return [];
  }
}

// La suma de sus pesos, contando una vez cada imagen aunque se use en varios lugares.
export function pesoSinRepetir(imagenes: Imagen[]): number {
  const porId = new Map(imagenes.map((imagen) => [imagen.id, imagen.peso]));
  return [...porId.values()].reduce((total, peso) => total + peso, 0);
}

// "412 KB" o "2.3 MB", con KB de 1024 bytes (spec F13, "Subir una imagen").
export function formatearPeso(bytes: number): string {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

// "12.4": megas con un decimal, redondeados hacia arriba para que nunca diga que cabe algo
// que no cabe (spec F13, "Cuánto pesan las imágenes").
export function formatearMegas(bytes: number): string {
  return (Math.ceil((bytes / MB) * 10) / 10).toFixed(1);
}

// --- Preparar una imagen antes de subirla (spec F13; research de F13, punto 4) -----------

const POR_EXTENSION: Record<string, FormatoImagen> = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  gif: "gif",
};

// Por su tipo o, si el navegador no lo sabe, por su extensión. Un SVG, un HEIC o un PDF no
// son ninguno de los cuatro.
function formatoDe(archivo: File): FormatoImagen | null {
  const porTipo = Object.entries(TIPO_MIME_IMAGEN).find(([, tipo]) => tipo === archivo.type);
  if (porTipo) return porTipo[0] as FormatoImagen;
  if (archivo.type !== "") return null;
  return POR_EXTENSION[archivo.name.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}

async function abrir(archivo: Blob, opciones?: ImageBitmapOptions): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(archivo, opciones);
  } catch {
    throw new Error(MENSAJES_IMAGENES.imagenIlegible);
  }
}

function tieneTransparencia(
  contexto: OffscreenCanvasRenderingContext2D,
  ancho: number,
  alto: number,
) {
  const { data } = contexto.getImageData(0, 0, ancho, alto);
  for (let i = 3; i < data.length; i += 4) if (data[i]! < 255) return true;
  return false;
}

// Lo que se sube: un GIF tal cual, para que se mueva; lo demás, vuelto a codificar con su
// lado más largo de hasta 1600 px, sin recortar, derecho según su EXIF y sin sus datos
// ocultos (la ubicación, la cámara). Lanza Error con el mensaje del campo.
export async function prepararImagen(
  archivo: File,
  { soloFotos = false }: { soloFotos?: boolean } = {},
): Promise<Blob> {
  const formato = formatoDe(archivo);
  if (!formato) throw new Error(MENSAJES_IMAGENES.formatoInvalido);
  if (formato === "gif") {
    if (soloFotos) throw new Error(MENSAJES_IMAGENES.portadaGif);
    if (archivo.size > LIMITES_IMAGENES.pesoGifMax) throw new Error(MENSAJES_IMAGENES.gifPesado);
    (await abrir(archivo)).close();
    return new Blob([archivo], { type: TIPO_MIME_IMAGEN.gif });
  }
  if (archivo.size > LIMITES_IMAGENES.pesoMax) throw new Error(MENSAJES_IMAGENES.imagenPesada);
  const mapa = await abrir(archivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LIMITES_IMAGENES.ladoMax / Math.max(mapa.width, mapa.height));
  const ancho = Math.max(1, Math.round(mapa.width * escala));
  const alto = Math.max(1, Math.round(mapa.height * escala));
  const lienzo = new OffscreenCanvas(ancho, alto);
  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error(MENSAJES_IMAGENES.imagenIlegible);
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(mapa, 0, 0, ancho, alto);
  mapa.close();
  // WebP conserva la transparencia; sin WebP (Safari), JPEG si es opaca o PNG si no
  const webp = await lienzo.convertToBlob({ type: "image/webp", quality: 0.85 });
  if (webp.type === "image/webp") return webp;
  return tieneTransparencia(contexto, ancho, alto)
    ? lienzo.convertToBlob({ type: "image/png" })
    : lienzo.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}
