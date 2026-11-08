import { ETIQUETA_VOZ, type IdiomaCurso } from "../tipos/contrato.ts";

// La voz sintetizada del navegador (spec F14; brote_specs, research de F14, punto 9), con la
// Web Speech API: https://developer.mozilla.org/docs/Web/API/SpeechSynthesis

// Chrome carga las voces después de abrir la página: se esperan hasta 1.5 s.
const ESPERA_VOCES_MS = 1500;
// Sin `onstart` en 3 s, la voz no logró sonar (necesita internet y no lo hay, o falló).
const ESPERA_INICIO_MS = 3000;

function esperarVoces(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolver) => {
    const listo = () => {
      clearTimeout(espera);
      speechSynthesis.removeEventListener("voiceschanged", listo);
      resolver(speechSynthesis.getVoices());
    };
    const espera = setTimeout(listo, ESPERA_VOCES_MS);
    speechSynthesis.addEventListener("voiceschanged", listo);
  });
}

// "es_MX" y "es-mx" son "es-MX".
function etiquetaDe(voz: SpeechSynthesisVoice): string {
  return voz.lang.replace(/_/g, "-").toLowerCase();
}

// Solo en desarrollo: VITE_SIN_VOCES=ko (o "ko,ja") esconde las voces de esos idiomas, para
// validar "sin voz en el idioma" en una computadora que sí las tiene (research de F14,
// punto 17). En una compilación de producción no existe.
function escondidasEnDesarrollo(): string[] {
  if (!import.meta.env.DEV) return [];
  return (import.meta.env.VITE_SIN_VOCES ?? "").split(",").map((idioma) => idioma.trim());
}

// Las voces del dispositivo que hablan ese idioma, en cualquier variante. Sin la Web Speech
// API, ninguna.
export async function vocesDelIdioma(idioma: IdiomaCurso): Promise<SpeechSynthesisVoice[]> {
  if (typeof speechSynthesis === "undefined") return [];
  if (escondidasEnDesarrollo().includes(idioma)) return [];
  let voces = speechSynthesis.getVoices();
  if (voces.length === 0) voces = await esperarVoces();
  return voces.filter((voz) => {
    const etiqueta = etiquetaDe(voz);
    return etiqueta === idioma || etiqueta.startsWith(`${idioma}-`);
  });
}

// La de la variante que se prefiere (ETIQUETA_VOZ) y, mejor, del dispositivo: funciona sin
// conexión, y Chrome corta las remotas a los 15 s, que una frase de 200 caracteres "Más
// lento" casi alcanza. Si no, cualquiera del idioma.
export function elegirVoz(
  voces: SpeechSynthesisVoice[],
  idioma: IdiomaCurso,
): SpeechSynthesisVoice | null {
  const preferida = ETIQUETA_VOZ[idioma].toLowerCase();
  const deLaVariante = (voz: SpeechSynthesisVoice) => etiquetaDe(voz) === preferida;
  return (
    voces.find((voz) => voz.localService && deLaVariante(voz)) ??
    voces.find((voz) => voz.localService) ??
    voces.find(deLaVariante) ??
    voces[0] ??
    null
  );
}

export type EventosVoz = {
  alEmpezar: () => void;
  alTerminar: () => void;
  alFallar: () => void;
};

// Lee la frase y devuelve cómo detenerla. Más lento no la vuelve más grave: la voz sintetizada
// cambia de velocidad sin cambiar de tono. Lo que pasa después de detenerla ya no avisa.
export function decir(
  frase: string,
  voz: SpeechSynthesisVoice | null,
  idioma: IdiomaCurso,
  velocidad: number,
  { alEmpezar, alTerminar, alFallar }: EventosVoz,
): () => void {
  speechSynthesis.cancel();
  let detenida = false;
  const enunciado = new SpeechSynthesisUtterance(frase);
  enunciado.lang = ETIQUETA_VOZ[idioma];
  enunciado.voice = voz;
  enunciado.rate = velocidad;
  const fallar = () => {
    if (detenida) return;
    detenida = true;
    clearTimeout(espera);
    speechSynthesis.cancel();
    alFallar();
  };
  const espera = setTimeout(fallar, ESPERA_INICIO_MS);
  enunciado.onstart = () => {
    clearTimeout(espera);
    if (!detenida) alEmpezar();
  };
  enunciado.onend = () => {
    clearTimeout(espera);
    if (detenida) return;
    detenida = true;
    alTerminar();
  };
  enunciado.onerror = (evento) => {
    // "interrupted" y "canceled" son nuestros: otra frase o "Detener"
    if (evento.error !== "interrupted" && evento.error !== "canceled") fallar();
  };
  speechSynthesis.speak(enunciado);
  return () => {
    detenida = true;
    clearTimeout(espera);
    speechSynthesis.cancel();
  };
}
