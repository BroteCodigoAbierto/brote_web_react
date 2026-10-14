import { usePeticion } from "../../hooks/usePeticion.ts";
import { traerSalud } from "../../servicios/salud.ts";
import estilos from "./Inicio.module.css";

// Página provisional: el catálogo llega con F02. Mientras, muestra si la API
// responde, para comprobar que web y backend están conectados.
export default function Inicio() {
  const { datos, cargando, error } = usePeticion(traerSalud);

  return (
    <section>
      <h1>Brote</h1>
      <p className={estilos.descripcion}>Cursos interactivos creados por la comunidad.</p>

      {cargando && <p className={estilos.estado}>Conectando con la API...</p>}
      {error !== null && (
        <p className={`${estilos.estado} ${estilos.error}`}>
          No se pudo conectar con la API. ¿Está corriendo brote_backend_express?
        </p>
      )}
      {datos && <p className={`${estilos.estado} ${estilos.exito}`}>API conectada.</p>}
    </section>
  );
}
