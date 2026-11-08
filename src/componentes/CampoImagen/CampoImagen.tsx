import { CircleAlert, ImagePlus } from "lucide-react";
import { useRef } from "react";
import { errorImagen, valorVacio, type ValorImagen } from "../../editor/imagenes.ts";
import { LIMITES_IMAGENES } from "../../tipos/contrato.ts";
import { formatearPeso } from "../../utilidades/imagenes.ts";
import Boton from "../Boton/Boton.tsx";
import CampoTexto from "../CampoTexto/CampoTexto.tsx";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import estilos from "./CampoImagen.module.css";

type PropsCampoImagen = {
  id: string;
  etiqueta: string;
  valor: ValorImagen;
  alCambiar: (valor: ValorImagen) => void;
  // empieza la subida y devuelve su id, que el campo guarda en su valor
  alElegirArchivo: (archivo: File) => string;
  // el de la actividad al intentar guardar ("Elige una imagen.", "Esta imagen está repetida.")
  error?: string;
  // la portada: sin GIF ni texto alternativo
  soloFotos?: boolean;
  conTextoAlternativo?: boolean;
  // la validación no se ve hasta el primer intento de guardar
  mostrarErrores?: boolean;
  deshabilitado?: boolean;
};

// El campo de una imagen en el editor (docs/diseno.md, "Editor (solo web)"; spec F13, "Subir
// una imagen"). Acepta image/* en el selector, para que un SVG, un HEIC o un GIF de portada
// se puedan elegir y muestren su error.
export default function CampoImagen({
  id,
  etiqueta,
  valor,
  alCambiar,
  alElegirArchivo,
  error,
  soloFotos = false,
  conTextoAlternativo = !soloFotos,
  mostrarErrores = true,
  deshabilitado = false,
}: PropsCampoImagen) {
  const selector = useRef<HTMLInputElement>(null);
  const idEtiqueta = `${id}-etiqueta`;
  const idMensaje = `${id}-mensaje`;
  const { imagen, subida } = valor;
  const mensaje =
    valor.error ??
    (valor.perdida ? errorImagen(valor) : undefined) ??
    (mostrarErrores ? error : undefined);
  const nota = soloFotos
    ? "JPEG, PNG o WebP de hasta 10 MB."
    : "JPEG, PNG o WebP de hasta 10 MB, o GIF de hasta 5 MB.";

  function elegir(archivo: File | undefined) {
    if (!archivo) return;
    const idSubida = alElegirArchivo(archivo);
    alCambiar({ ...valor, subida: idSubida, error: null });
  }

  const atributosError = {
    "aria-invalid": mensaje ? true : undefined,
    "aria-describedby": mensaje ? idMensaje : undefined,
  };

  return (
    <div className={estilos.campo} role="group" aria-labelledby={idEtiqueta}>
      <span id={idEtiqueta} className={estilos.etiqueta}>
        {etiqueta}
      </span>
      {imagen ? (
        <div className={estilos.conImagen}>
          <span className={estilos.vista}>
            <ImagenCurso imagen={imagen} llenar quieta />
          </span>
          <div className={estilos.datos}>
            <p className={estilos.medidas}>
              {imagen.ancho} × {imagen.alto} px · {formatearPeso(imagen.peso)}
            </p>
            <div className={estilos.acciones}>
              <button
                type="button"
                className={estilos.accion}
                disabled={deshabilitado || subida !== null}
                onClick={() => selector.current?.click()}
                {...atributosError}
              >
                Cambiar
              </button>
              <button
                type="button"
                className={estilos.accion}
                disabled={deshabilitado}
                onClick={() =>
                  alCambiar({ ...valorVacio(), textoAlternativo: valor.textoAlternativo })
                }
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={estilos.vacio}>
          <span {...atributosError} tabIndex={-1} className={estilos.ancla}>
            <Boton
              variante="secundario"
              tamano="chico"
              icono={ImagePlus}
              deshabilitado={deshabilitado || subida !== null}
              alPulsar={() => selector.current?.click()}
            >
              Elegir imagen
            </Boton>
          </span>
          <p className={estilos.nota}>{nota}</p>
        </div>
      )}
      {subida !== null && (
        <p className={estilos.subiendo} role="status">
          <span className={estilos.anillo} aria-hidden="true" />
          Subiendo imagen…
        </p>
      )}
      {conTextoAlternativo && imagen && (
        <CampoTexto
          id={`${id}-alternativo`}
          etiqueta="Texto alternativo"
          valor={valor.textoAlternativo}
          alCambiar={(textoAlternativo) => alCambiar({ ...valor, textoAlternativo })}
          ayuda="Describe la imagen para quien no la puede ver. Lo leen los lectores de pantalla y se muestra si la imagen no carga."
          maxLongitud={LIMITES_IMAGENES.textoAlternativoMax}
          deshabilitado={deshabilitado}
        />
      )}
      {mensaje && (
        <p id={idMensaje} className={estilos.error}>
          <CircleAlert className={estilos.iconoError} aria-hidden="true" />
          {mensaje}
        </p>
      )}
      <input
        ref={selector}
        type="file"
        accept="image/*"
        hidden
        onChange={(evento) => {
          elegir(evento.target.files?.[0]);
          evento.target.value = "";
        }}
      />
    </div>
  );
}
