import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import Buscador from "../../componentes/Buscador/Buscador.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import { useCatalogo } from "../../hooks/useCatalogo.ts";
import estilos from "./Catalogo.module.css";

// Se busca cuando se deja de escribir, no con cada letra.
const ESPERA_BUSQUEDA_MS = 300;

// ?q= no llena el historial ni sube la página al cambiar (research de F02, punto 8).
const OPCIONES_DIRECCION = { replace: true, preventScrollReset: true };

// Catálogo de cursos publicados (spec F02). La búsqueda vive en ?q=; los
// cursos cargados, en el CatalogoContext.
export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams();
  const q = parametros.get("q") ?? "";
  const {
    consulta,
    cursos,
    siguiente,
    fase,
    buscando,
    cargandoMas,
    errorMas,
    mensajeError,
    buscar,
    cargarMas,
    reintentar,
  } = useCatalogo();

  const [texto, setTexto] = useState(q);
  // lo último que este buscador puso en ?q=, y el ?q= del render anterior
  const [enviado, setEnviado] = useState(q);
  const [qAnterior, setQAnterior] = useState(q);

  // ?q= cambió por fuera del buscador (p. ej. con el enlace "Brote" del
  // encabezado): el buscador se pone al día
  if (q !== qAnterior) {
    setQAnterior(q);
    if (q !== enviado) {
      setTexto(q);
      setEnviado(q);
    }
  }

  useEffect(() => {
    if (texto === q) return;
    const temporizador = setTimeout(() => {
      setEnviado(texto);
      setParametros(texto ? { q: texto } : {}, OPCIONES_DIRECCION);
    }, ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(temporizador);
  }, [texto, q, setParametros]);

  useEffect(() => {
    buscar(q.trim());
  }, [q, buscar]);

  function borrarBusqueda() {
    setTexto("");
    setEnviado("");
    setParametros({}, OPCIONES_DIRECCION);
  }

  const catalogoVacio = fase === "listo" && consulta === "" && cursos.length === 0;
  // en la primera carga el buscador no aparece (podría no haber cursos), salvo
  // que la dirección ya traiga una búsqueda
  const conBuscador = fase === "cargando" ? consulta !== null || texto !== "" : !catalogoVacio;

  return (
    <section className={estilos.catalogo}>
      <h1 className={estilos.oculto}>Cursos</h1>
      {conBuscador && <Buscador valor={texto} alCambiar={setTexto} buscando={buscando} />}

      {fase === "cargando" && <IndicadorCarga />}

      {fase === "error" && mensajeError && (
        <ErrorCarga mensaje={mensajeError} alReintentar={reintentar} />
      )}

      {catalogoVacio && <p className={estilos.aviso}>Todavía no hay cursos publicados.</p>}

      {fase === "listo" && consulta !== "" && cursos.length === 0 && (
        <div className={`${estilos.sinResultados} ${buscando ? estilos.atenuado : ""}`}>
          <p className={estilos.aviso}>No hay cursos que coincidan con «{consulta}».</p>
          <Boton variante="secundario" alPulsar={borrarBusqueda}>
            Borrar búsqueda
          </Boton>
        </div>
      )}

      {fase === "listo" && cursos.length > 0 && (
        <>
          <ul className={`${estilos.cuadricula} ${buscando ? estilos.atenuado : ""}`}>
            {cursos.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso curso={curso} />
              </li>
            ))}
          </ul>
          {errorMas && mensajeError ? (
            <ErrorCarga mensaje={mensajeError} alReintentar={reintentar} />
          ) : (
            siguiente && (
              <div className={estilos.verMas}>
                <Boton
                  variante="secundario"
                  enviando={cargandoMas}
                  textoEnviando="Cargando..."
                  alPulsar={cargarMas}
                >
                  Ver más
                </Boton>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}
