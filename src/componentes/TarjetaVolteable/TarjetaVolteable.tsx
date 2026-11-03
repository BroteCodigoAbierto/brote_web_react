import estilos from "./TarjetaVolteable.module.css";

type PropsTarjetaVolteable = {
  frente: string;
  reverso: string;
  volteada: boolean;
  alVoltear: () => void;
};

// Tarjeta de memoria (docs/diseno.md, sección 6): gira sobre el eje vertical.
// Es un botón, así que Enter y la barra espaciadora la voltean sin código extra.
export default function TarjetaVolteable({
  frente,
  reverso,
  volteada,
  alVoltear,
}: PropsTarjetaVolteable) {
  const etiqueta = volteada ? `Tarjeta, reverso: ${reverso}` : `Tarjeta, frente: ${frente}`;

  return (
    <button
      type="button"
      className={`${estilos.tarjeta} ${volteada ? estilos.volteada : ""}`}
      aria-label={etiqueta}
      onClick={alVoltear}
    >
      <span className={estilos.interior}>
        <span className={`${estilos.cara} ${estilos.frente}`} aria-hidden="true">
          {frente}
        </span>
        <span className={`${estilos.cara} ${estilos.reverso}`} aria-hidden="true">
          {reverso}
        </span>
      </span>
      <span className="oculto" aria-live="polite">
        {volteada ? reverso : ""}
      </span>
    </button>
  );
}
