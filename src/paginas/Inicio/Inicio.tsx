import { useSesion } from "../../hooks/useSesion.ts";
import estilos from "./Inicio.module.css";

// Página provisional: el catálogo llega con F02. Mientras, saluda con el nombre
// del usuario, que es lo único que existe tras crear la cuenta o entrar (F01).
export default function Inicio() {
  const { usuario } = useSesion();

  return (
    <section>
      <h1>Hola, {usuario?.nombre}</h1>
      <p className={estilos.descripcion}>Pronto vas a encontrar aquí los cursos de la comunidad.</p>
    </section>
  );
}
