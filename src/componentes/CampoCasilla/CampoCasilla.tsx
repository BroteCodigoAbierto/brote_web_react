import estilos from "./CampoCasilla.module.css";

type PropsCampoCasilla = {
  id: string;
  etiqueta: string;
  ayuda?: string;
  valor: boolean;
  alCambiar: (valor: boolean) => void;
  deshabilitado?: boolean;
};

// Una casilla nativa con su etiqueta a la derecha y la ayuda debajo (docs/diseno.md, "Editor
// (solo web)"; spec F14: "Mostrar el texto desde el inicio").
export default function CampoCasilla({
  id,
  etiqueta,
  ayuda,
  valor,
  alCambiar,
  deshabilitado = false,
}: PropsCampoCasilla) {
  const idAyuda = `${id}-ayuda`;
  return (
    <div className={estilos.campo}>
      <label className={estilos.fila} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className={estilos.casilla}
          checked={valor}
          onChange={(evento) => alCambiar(evento.target.checked)}
          disabled={deshabilitado}
          aria-describedby={ayuda ? idAyuda : undefined}
        />
        <span className={estilos.etiqueta}>{etiqueta}</span>
      </label>
      {ayuda && (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      )}
    </div>
  );
}
