import { CircleAlert, FileAudio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAudios } from "../../contextos/ContextoAudios.ts";
import { errorAudio, valorAudioVacio, type ValorAudio } from "../../editor/audios.ts";
import type { Audio } from "../../tipos/contrato.ts";
import { formatearDuracion } from "../../utilidades/audios.ts";
import { formatearPeso } from "../../utilidades/imagenes.ts";
import Boton from "../Boton/Boton.tsx";
import BotonEscuchar from "../BotonEscuchar/BotonEscuchar.tsx";
import base from "../CampoImagen/CampoImagen.module.css";
import estilos from "./CampoAudio.module.css";

type PropsCampoAudio = {
  id: string;
  etiqueta: string;
  ayuda?: string;
  valor: ValorAudio;
  alCambiar: (valor: ValorAudio) => void;
  // empieza la subida y devuelve su id, que el campo guarda en su valor
  alElegirArchivo: (archivo: File) => string;
  // el de la actividad al intentar guardar
  error?: string;
  // la validación no se ve hasta el primer intento de guardar
  mostrarErrores?: boolean;
  deshabilitado?: boolean;
};

// Oír ahí mismo el audio subido. Lo trae con la sesión, una vez, y lo suelta al desmontarse.
function useOirAudio(audio: Audio | null) {
  const almacen = useAudios();
  const [estado, setEstado] = useState<"lista" | "cargando" | "sonando">("lista");
  const elemento = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      elemento.current?.pause();
      elemento.current = null;
      setEstado("lista");
    };
  }, [audio]);

  async function alternar() {
    if (!audio) return;
    if (estado === "sonando") {
      elemento.current?.pause();
      setEstado("lista");
      return;
    }
    setEstado("cargando");
    try {
      const url = await almacen.traer(audio);
      elemento.current ??= new Audio(url);
      const reproductor = elemento.current;
      reproductor.onended = () => setEstado("lista");
      reproductor.currentTime = 0;
      await reproductor.play();
      setEstado("sonando");
    } catch {
      if (audio) almacen.olvidar(audio.id);
      elemento.current = null;
      setEstado("lista");
    }
  }

  return { estado, alternar };
}

// El audio de la frase de escuchar y repetir (docs/diseno.md, "Editor (solo web)"; spec F14,
// "Subir un audio"), como CampoImagen. El selector acepta audio/*, para que un OGG o un FLAC
// se puedan elegir y muestren su error.
export default function CampoAudio({
  id,
  etiqueta,
  ayuda,
  valor,
  alCambiar,
  alElegirArchivo,
  error,
  mostrarErrores = true,
  deshabilitado = false,
}: PropsCampoAudio) {
  const selector = useRef<HTMLInputElement>(null);
  const idEtiqueta = `${id}-etiqueta`;
  const idMensaje = `${id}-mensaje`;
  const idAyuda = `${id}-ayuda`;
  const { audio, subida } = valor;
  const oir = useOirAudio(audio);
  const mensaje = valor.error ?? errorAudio(valor) ?? (mostrarErrores ? error : undefined);

  function elegir(archivo: File | undefined) {
    if (!archivo) return;
    const idSubida = alElegirArchivo(archivo);
    alCambiar({ ...valor, subida: idSubida, error: null });
  }

  const describe = [mensaje ? idMensaje : "", ayuda ? idAyuda : ""].filter(Boolean).join(" ");
  const atributosError = {
    "aria-invalid": mensaje ? true : undefined,
    "aria-describedby": describe || undefined,
  };

  return (
    <div className={base.campo} role="group" aria-labelledby={idEtiqueta}>
      <span id={idEtiqueta} className={base.etiqueta}>
        {etiqueta}
      </span>
      {audio ? (
        <div className={estilos.conAudio}>
          <BotonEscuchar
            tamano="chico"
            etiqueta="Escuchar"
            sonando={oir.estado === "sonando"}
            cargando={oir.estado === "cargando"}
            alPulsar={() => void oir.alternar()}
          />
          <p className={base.medidas}>
            {formatearDuracion(audio.duracion)} · {formatearPeso(audio.peso)}
          </p>
          <div className={base.acciones}>
            <button
              type="button"
              className={base.accion}
              disabled={deshabilitado || subida !== null}
              onClick={() => selector.current?.click()}
              {...atributosError}
            >
              Cambiar
            </button>
            <button
              type="button"
              className={base.accion}
              disabled={deshabilitado}
              onClick={() => alCambiar(valorAudioVacio())}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className={base.vacio}>
          <span {...atributosError} tabIndex={-1} className={base.ancla}>
            <Boton
              variante="secundario"
              tamano="chico"
              icono={FileAudio}
              deshabilitado={deshabilitado || subida !== null}
              alPulsar={() => selector.current?.click()}
            >
              Elegir audio
            </Boton>
          </span>
          <p className={base.nota}>MP3, M4A o WAV de hasta 30 segundos y 5 MB.</p>
        </div>
      )}
      {subida !== null && (
        <p className={base.subiendo} role="status">
          <span className={base.anillo} aria-hidden="true" />
          Subiendo audio…
        </p>
      )}
      {ayuda && (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
      {mensaje && (
        <p id={idMensaje} className={base.error}>
          <CircleAlert className={base.iconoError} aria-hidden="true" />
          {mensaje}
        </p>
      )}
      <input
        ref={selector}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav"
        hidden
        onChange={(evento) => {
          elegir(evento.target.files?.[0]);
          evento.target.value = "";
        }}
      />
    </div>
  );
}
