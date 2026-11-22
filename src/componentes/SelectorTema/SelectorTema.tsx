import { modos, temas } from "../../constantes/temas.ts";
import { useTema } from "../../hooks/useTema.ts";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./SelectorTema.module.css";

export default function SelectorTema() {
  const { preferencia, cambiar, estado } = useTema();
  return (
    <Superficie como="section" className={estilos.seccion} aria-labelledby="titulo-temas">
      <h2 id="titulo-temas" className={estilos.titulo}>
        Temas
      </h2>
      <p className={estilos.ayuda}>
        Elige los colores de Brote. Tu elección se guarda en este dispositivo.
      </p>
      <fieldset className={estilos.grupo}>
        <legend>Paleta de colores</legend>
        <div className={estilos.opciones}>
          {temas.map((tema) => (
            <label key={tema.id} className={estilos.opcion}>
              <input
                type="radio"
                name="paleta"
                value={tema.id}
                checked={preferencia.tema === tema.id}
                onChange={() => cambiar({ ...preferencia, tema: tema.id })}
              />
              <span>
                <strong>{tema.nombre}</strong>
                <span className={estilos.descripcion}>{tema.descripcion}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={estilos.grupo}>
        <legend>Modo</legend>
        <div className={estilos.modos}>
          {modos.map((modo) => (
            <label key={modo.id} className={estilos.opcion}>
              <input
                type="radio"
                name="modo"
                value={modo.id}
                checked={preferencia.modo === modo.id}
                onChange={() => cambiar({ ...preferencia, modo: modo.id })}
              />
              {modo.nombre}
            </label>
          ))}
        </div>
      </fieldset>
      <p role="status" className={estilos.ayuda}>
        {estado === "error"
          ? "El tema se aplicó, pero no se pudo guardar. Solo durará esta sesión."
          : estado === "guardado"
            ? "Preferencia guardada."
            : "Puedes cambiar el tema cuando quieras."}
      </p>
    </Superficie>
  );
}
