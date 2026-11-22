// Decisión 0018: al aprobar o no aprobar un curso, su revisión vuelve a "Mi panel" con
// este estado, y "Cursos en revisión" dice qué pasó.
export type AvisoModeracion = { texto: string; tono: "exito" | "error" };

export function estadoConAviso(aviso: AvisoModeracion) {
  return { avisoModeracion: aviso };
}

export function leerAvisoModeracion(estado: unknown): AvisoModeracion | null {
  if (typeof estado !== "object" || estado === null || !("avisoModeracion" in estado)) {
    return null;
  }
  return estado.avisoModeracion as AvisoModeracion;
}
