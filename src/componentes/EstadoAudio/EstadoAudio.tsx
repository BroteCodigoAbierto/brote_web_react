import { VolumeX } from "lucide-react";
import { MENSAJES_AUDIOS } from "../../tipos/contrato.ts";
import estilos from "./EstadoAudio.module.css";

// El audio de la frase que no cargó (docs/diseno.md, sección 4; spec F14, "Cargar el audio al
// cursar"), como una imagen rota de F13. Se anuncia.
export default function EstadoAudio() {
  return (
    <p className={estilos.estado} role="status">
      <VolumeX className={estilos.icono} aria-hidden="true" />
      {MENSAJES_AUDIOS.sinCargar}
    </p>
  );
}
