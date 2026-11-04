import type { TipoActividad } from "../tipos/contrato.ts";
import { editorCompletarEspacios } from "./CompletarEspacios/editorCompletarEspacios.ts";
import { editorOpcionMultiple } from "./OpcionMultiple/editorOpcionMultiple.ts";
import { editorPreguntaAbierta } from "./PreguntaAbierta/editorPreguntaAbierta.ts";
import { editorTarjeta } from "./TarjetaMemoria/editorTarjeta.ts";
import { editorTeoria } from "./Teoria/editorTeoria.ts";
import type { EditorActividad } from "./tipos.ts";

// Quien usa el registro no conoce la forma de cada borrador: solo lo pasa de un
// lado a otro. TypeScript comprueba aquí que el editor es de ese tipo.
function registrar<T extends TipoActividad, B>(
  editor: EditorActividad<T, B>,
): EditorActividad<T, unknown> {
  return editor as unknown as EditorActividad<T, unknown>;
}

// Registro tipo → editor, como registro.ts (constitución, principio IV). El tipo
// obliga a tener una entrada por cada tipo del contrato: si falta, no compila.
export const registroEditor: { [T in TipoActividad]: EditorActividad<T, unknown> } = {
  teoria: registrar(editorTeoria),
  tarjeta: registrar(editorTarjeta),
  opcionMultiple: registrar(editorOpcionMultiple),
  completarEspacios: registrar(editorCompletarEspacios),
  preguntaAbierta: registrar(editorPreguntaAbierta),
};
