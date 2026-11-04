// Presentación y datos locales del editor (spec F05). Solo existe en la web.

let siguienteId = 0;

// Para las filas de un borrador: nunca viaja, solo distingue filas entre sí.
export function idLocal(): string {
  siguienteId += 1;
  return `${Date.now().toString(36)}-${siguienteId}`;
}

export function textoCantidadActividades(cantidad: number): string {
  if (cantidad === 0) return "Sin actividades";
  if (cantidad === 1) return "1 actividad";
  return `${cantidad} actividades`;
}

export function textoIncompletas(cantidad: number): string {
  if (cantidad === 1) return "hay 1 actividad incompleta.";
  return `hay ${cantidad} actividades incompletas.`;
}
