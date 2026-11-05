import { BookOpen, CircleAlert, GripVertical, Plus } from "lucide-react";
import { useId, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { Link } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import BotonesOrden from "../../componentes/BotonesOrden/BotonesOrden.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useArrastrar } from "../../hooks/useArrastrar.ts";
import {
  borrarLeccion,
  crearLeccion,
  esConflicto,
  esSesionPerdida,
  leerErrorDeAccion,
  ordenarLecciones,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import {
  LIMITES_CURSO,
  LIMITES_LECCION,
  MENSAJES_EDITOR,
  type LeccionEnMapa,
} from "../../tipos/contrato.ts";
import { textoCantidadActividades } from "../../utilidades/editor.ts";
import { validarTituloLeccion } from "../../validacion/curso.ts";
import estilos from "./MapaCurso.module.css";

type PropsListaLecciones = {
  idCurso: string;
  lecciones: LeccionEnMapa[];
  alCambiarLecciones: Dispatch<SetStateAction<LeccionEnMapa[]>>;
  // las que impidieron enviar el curso a revisión, por estar vacías (F06)
  marcadas: ReadonlySet<string>;
  // lo escrito en "Nueva lección" cuando expiró la sesión
  tituloInicial: string;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarCapturado: (titulo: string) => void;
  alSesionPerdida: () => void;
};

function renumerar(lecciones: LeccionEnMapa[]): LeccionEnMapa[] {
  return lecciones.map((leccion, i) => ({ ...leccion, posicion: i + 1 }));
}

// Las lecciones del curso (spec F05, "Armar las lecciones del curso"). Cada acción
// se guarda al momento, y la lista cambia sin esperar la respuesta al reordenar. La
// lista la guarda el mapa, porque enviar a revisión también la actualiza.
export default function ListaLecciones({
  idCurso,
  lecciones,
  alCambiarLecciones,
  marcadas,
  tituloInicial,
  ocupado,
  alCambiarOcupado,
  alCambiarCapturado,
  alSesionPerdida,
}: PropsListaLecciones) {
  const idTitulo = useId();
  const [agregando, setAgregando] = useState(tituloInicial !== "");
  const [titulo, setTitulo] = useState(tituloInicial);
  const [errorTitulo, setErrorTitulo] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const [porEliminar, setPorEliminar] = useState<LeccionEnMapa | null>(null);
  const [eliminando, setEliminando] = useState(false);
  // el estado tarda un render en verse; con la ref un doble Enter no pasa
  const accionEnCurso = useRef(false);
  const lleno = lecciones.length >= LIMITES_CURSO.leccionesMax;

  const arrastre = useArrastrar<string>({
    alSoltar(id, destino) {
      const desde = lecciones.findIndex((leccion) => leccion.id === id);
      mover(desde, destino > desde ? destino - 1 : destino);
    },
  });

  // Deja todo como "ocupado" mientras dura la acción. Si falla, `alFallar` recibe
  // el error, salvo que se haya perdido la sesión: entonces solo se guarda la copia.
  async function ejecutar(accion: () => Promise<void>, alFallar: (error: unknown) => void) {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    alCambiarOcupado(true);
    setAviso(null);
    try {
      await accion();
    } catch (error) {
      if (esSesionPerdida(error)) alSesionPerdida();
      else alFallar(error);
    } finally {
      accionEnCurso.current = false;
      alCambiarOcupado(false);
    }
  }

  function mover(desde: number, hasta: number) {
    if (desde === hasta || accionEnCurso.current) return;
    const anteriores = lecciones;
    const nuevas = [...lecciones];
    const [movida] = nuevas.splice(desde, 1);
    if (!movida) return;
    nuevas.splice(hasta, 0, movida);
    alCambiarLecciones(renumerar(nuevas));
    ejecutar(
      async () => {
        await ordenarLecciones(
          idCurso,
          nuevas.map(({ id }) => id),
        );
        setAnuncio(`Movida a la posición ${hasta + 1}`);
      },
      (error) => {
        alCambiarLecciones(anteriores);
        setAviso(leerErrorDeAccion(error, "No se pudo guardar el nuevo orden."));
        // otra pestaña cambió la lista: la que hay aquí está vieja. No se recarga la
        // pantalla, para no perder lo escrito en el formulario del curso
        if (esConflicto(error)) {
          traerCursoEnEditor(idCurso)
            .then(({ curso }) => alCambiarLecciones(curso.lecciones))
            .catch(() => {});
        }
      },
    );
  }

  function cambiarTitulo(valor: string) {
    setTitulo(valor);
    setErrorTitulo(undefined);
    alCambiarCapturado(valor);
  }

  function agregar(evento: FormEvent) {
    evento.preventDefault();
    const error = validarTituloLeccion(titulo);
    setErrorTitulo(error);
    if (error) return;
    setEnviando(true);
    ejecutar(
      async () => {
        const { leccion } = await crearLeccion(idCurso, { titulo });
        alCambiarLecciones((actuales) => [...actuales, leccion]);
        cambiarTitulo("");
        setAgregando(false);
      },
      (fallo) => setAviso(leerErrorDeAccion(fallo, "No se pudo agregar la lección.")),
    ).finally(() => setEnviando(false));
  }

  function eliminar() {
    if (!porEliminar) return;
    const { id } = porEliminar;
    setEliminando(true);
    ejecutar(
      async () => {
        await borrarLeccion(idCurso, id);
        alCambiarLecciones((actuales) =>
          renumerar(actuales.filter((leccion) => leccion.id !== id)),
        );
      },
      (error) => setAviso(leerErrorDeAccion(error, "No se pudo eliminar la lección.")),
    ).finally(() => {
      setEliminando(false);
      setPorEliminar(null);
    });
  }

  return (
    <section className={estilos.lecciones} aria-labelledby="titulo-lecciones">
      <h2 id="titulo-lecciones" className={estilos.seccion}>
        Lecciones
      </h2>
      {lecciones.length === 0 ? (
        <EstadoVacio
          icono={BookOpen}
          titulo="Este curso todavía no tiene lecciones."
          texto="Agrega la primera para empezar."
        />
      ) : (
        <Superficie como="ol" className={estilos.lista} {...arrastre.propsZona(lecciones.length)}>
          {lecciones.map((leccion, indice) => (
            <li
              key={leccion.id}
              className={[
                estilos.leccion,
                arrastre.destino === indice ? estilos.destinoArriba : "",
                arrastre.destino === indice + 1 && indice === lecciones.length - 1
                  ? estilos.destinoAbajo
                  : "",
              ].join(" ")}
              {...(ocupado ? {} : arrastre.propsOrigen(leccion.id))}
              {...arrastre.propsDestino(indice)}
            >
              <GripVertical className={estilos.asa} aria-hidden="true" />
              <Link to={`/editor/${idCurso}/lecciones/${leccion.id}`} className={estilos.enlace}>
                <span className={estilos.tituloLeccion}>
                  {leccion.posicion}. {leccion.titulo}
                </span>
                <span className={estilos.cantidad}>
                  {marcadas.has(leccion.id) ? (
                    <Insignia tono="acento" icono={CircleAlert}>
                      {textoCantidadActividades(leccion.cantidadActividades)}
                    </Insignia>
                  ) : (
                    textoCantidadActividades(leccion.cantidadActividades)
                  )}
                </span>
              </Link>
              <BotonesOrden
                etiqueta={`lección ${leccion.posicion}`}
                esPrimero={indice === 0}
                esUltimo={indice === lecciones.length - 1}
                deshabilitado={ocupado}
                alSubir={() => mover(indice, indice - 1)}
                alBajar={() => mover(indice, indice + 1)}
              />
              <Boton
                variante="fantasma"
                tamano="chico"
                deshabilitado={ocupado}
                alPulsar={() => setPorEliminar(leccion)}
              >
                Eliminar
              </Boton>
            </li>
          ))}
        </Superficie>
      )}
      {aviso && <Aviso texto={aviso} />}
      {agregando ? (
        <form className={estilos.nuevaLeccion} noValidate onSubmit={agregar}>
          <div className={estilos.campoNueva}>
            <CampoTexto
              id={idTitulo}
              etiqueta="Título de la lección"
              valor={titulo}
              alCambiar={cambiarTitulo}
              error={errorTitulo}
              maxLongitud={LIMITES_LECCION.tituloMax}
              autoFocus
            />
          </div>
          <Boton
            tipo="submit"
            variante="secundario"
            enviando={enviando}
            textoEnviando="Agregar"
            deshabilitado={ocupado}
          >
            Agregar
          </Boton>
        </form>
      ) : (
        <div className={estilos.agregar}>
          <Boton
            variante="secundario"
            icono={Plus}
            deshabilitado={lleno || ocupado}
            alPulsar={() => setAgregando(true)}
          >
            Nueva lección
          </Boton>
          {lleno && <p className={estilos.nota}>{MENSAJES_EDITOR.maxLecciones}</p>}
        </div>
      )}
      <p className="oculto" role="status">
        {anuncio}
      </p>
      <Dialogo
        abierto={porEliminar !== null}
        titulo="¿Eliminar esta lección?"
        texto="Se borrará con todas sus actividades. No se puede deshacer."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        enviando={eliminando}
        alConfirmar={eliminar}
        alCancelar={() => setPorEliminar(null)}
      />
    </section>
  );
}
