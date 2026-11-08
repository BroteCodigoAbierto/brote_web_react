import CampoAudio from "../../componentes/CampoAudio/CampoAudio.tsx";
import CampoCasilla from "../../componentes/CampoCasilla/CampoCasilla.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import { useIdioma } from "../../contextos/ContextoIdioma.ts";
import { useSubidas } from "../../contextos/ContextoSubidas.ts";
import { LIMITES_ACTIVIDADES, NOMBRE_IDIOMA } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorEscucharRepetir } from "./editorEscucharRepetir.ts";

// Formulario de escuchar y repetir (spec F14, "Crear la actividad"). La frase es de una línea:
// el campo no deja escribir saltos y, al pegar, los quita.
export default function FormularioEscucharRepetir({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorEscucharRepetir>) {
  const { subirAudio } = useSubidas();
  const idioma = NOMBRE_IDIOMA[useIdioma()].toLowerCase();

  return (
    <div className={estilos.formulario}>
      <CampoTexto
        id={`${idBase}-frase`}
        etiqueta="Frase"
        valor={borrador.frase}
        alCambiar={(frase) => alCambiar({ ...borrador, frase: frase.replace(/[\r\n]+/g, " ") })}
        error={errores.frase}
        ayuda="Lo que el alumno escucha y repite."
        maxLongitud={LIMITES_ACTIVIDADES.fraseMax}
        deshabilitado={deshabilitado}
      />
      <CampoCasilla
        id={`${idBase}-mostrar-texto`}
        etiqueta="Mostrar el texto desde el inicio"
        ayuda="Si la desmarcas, el alumno ve el texto al comprobar."
        valor={borrador.mostrarTexto}
        alCambiar={(mostrarTexto) => alCambiar({ ...borrador, mostrarTexto })}
        deshabilitado={deshabilitado}
      />
      <CampoAudio
        id={`${idBase}-audio`}
        etiqueta="Audio de la frase"
        ayuda={`Sin audio, la frase se lee con la voz del dispositivo, en ${idioma}, el idioma del curso.`}
        valor={borrador.audio}
        alCambiar={(audio) => alCambiar({ ...borrador, audio })}
        alElegirArchivo={subirAudio}
        error={errores.audio}
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
