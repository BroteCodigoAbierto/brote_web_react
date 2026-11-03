// El detalle del curso abre sus lecciones con este estado. Al salir, la lección
// vuelve atrás en el historial solo si lo trae; si no (dirección abierta
// directo, o después de pasar por "Entrar"), lo anterior en el historial puede
// ser otra página o nada, y se va al detalle del curso.
export const ESTADO_DESDE_CURSO = { desdeCurso: true } as const;

export function vieneDelCurso(estado: unknown): boolean {
  return typeof estado === "object" && estado !== null && "desdeCurso" in estado;
}
