import { ArrowLeft, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { aActividad, bloquesIncompletos, type ItemArrastre } from "../../editor/estadoLeccion.ts";
import Inspector from "../../editor/Inspector/Inspector.tsx";
import PaletaActividades from "../../editor/PaletaActividades/PaletaActividades.tsx";
import ProbarLeccion from "../../editor/ProbarLeccion/ProbarLeccion.tsx";
import Secuencia from "../../editor/Secuencia/Secuencia.tsx";
import { useArrastrar } from "../../hooks/useArrastrar.ts";
import { useEditorLeccion } from "../../hooks/useEditorLeccion.ts";
import PesoArchivos from "../../componentes/PesoArchivos/PesoArchivos.tsx";
import { ContextoSubidas } from "../../contextos/ContextoSubidas.ts";
import { useSalirSinGuardar } from "../../hooks/useSalirSinGuardar.ts";
import {
  type LeccionEnEditor,
  LIMITES_IMAGENES,
  LIMITES_LECCION,
  MENSAJES_EDITOR,
  MENSAJES_IMAGENES,
} from "../../tipos/contrato.ts";
import estilos from "./LienzoLeccion.module.css";

type PropsEditorLeccion = {
  idCurso: string;
  leccion: LeccionEnEditor;
};

function enPrueba(estado: unknown): boolean {
  return typeof estado === "object" && estado !== null && "probando" in estado;
}

// La barra superior, la paleta, la secuencia y el inspector (spec F05, "Armar una
// lección"), y la prueba de la lección, que se dibuja aquí mismo para conservar lo
// que hay en pantalla (brote_specs, research de F05, punto 12).
export default function EditorLeccion({ idCurso, leccion }: PropsEditorLeccion) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const idTitulo = useId();
  const editor = useEditorLeccion(idCurso, leccion);
  const { estado, guardando, focoAlError, focoAlFormulario } = editor;
  const { titulo, bloques, idSeleccionado, hayCambios, mostrarErrores } = estado;
  const { propsDialogo } = useSalirSinGuardar(hayCambios);
  const inspector = useRef<HTMLDivElement>(null);
  const [pruebaAbierta, setPruebaAbierta] = useState(false);
  const probando = enPrueba(ubicacion.state);

  // la única instancia: el arrastre empieza en la paleta o en la secuencia
  const arrastre = useArrastrar<ItemArrastre>({
    alSoltar(item, destino) {
      if (item.origen === "paleta") {
        editor.agregar(item.tipo, destino);
        return;
      }
      const desde = bloques.findIndex(({ id }) => id === item.id);
      const hasta = destino > desde ? destino - 1 : destino;
      if (desde !== hasta) editor.editar({ tipo: "mover", desde, hasta });
    },
  });

  // Al recargar en modo de prueba el navegador conserva `state`, pero lo que estaba
  // en memoria se perdió: se vuelve al lienzo.
  const { pathname } = ubicacion;
  useEffect(() => {
    if (probando && !pruebaAbierta) navegar(pathname, { replace: true, state: null });
  }, [probando, pruebaAbierta, navegar, pathname]);

  useEffect(() => {
    if (focoAlError === 0) return;
    const campo =
      inspector.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      document.getElementById(idTitulo);
    campo?.focus();
  }, [focoAlError, idTitulo]);

  useEffect(() => {
    if (focoAlFormulario === 0) return;
    inspector.current?.querySelector<HTMLElement>("input, textarea")?.focus();
  }, [focoAlFormulario]);

  function probar() {
    if (!editor.comprobar("No se puede probar")) return;
    setPruebaAbierta(true);
    navegar(pathname, { state: { probando: true } });
  }

  const completa = titulo.trim() !== "" && bloquesIncompletos(bloques).length === 0;
  if (probando && pruebaAbierta && completa) {
    return (
      <ProbarLeccion
        titulo={titulo.trim()}
        actividades={bloques.map(aActividad)}
        alSalir={() => navegar(-1)}
      />
    );
  }

  const seleccionado = bloques.find(({ id }) => id === idSeleccionado) ?? null;

  return (
    <div className={estilos.pantalla}>
      <Superficie className={estilos.barra} elevada>
        <div className={estilos.volverBarra}>
          <Boton
            variante="enlace"
            tamano="chico"
            icono={ArrowLeft}
            alPulsar={() => navegar(`/editor/${idCurso}`)}
          >
            Volver al curso
          </Boton>
        </div>
        <div className={estilos.titulo}>
          <CampoTexto
            id={idTitulo}
            etiqueta="Título de la lección"
            valor={titulo}
            alCambiar={(nuevo) => editor.editar({ tipo: "cambiarTitulo", titulo: nuevo })}
            error={
              mostrarErrores && titulo.trim() === "" ? MENSAJES_EDITOR.campoObligatorio : undefined
            }
            maxLongitud={LIMITES_LECCION.tituloMax}
            deshabilitado={guardando}
          />
        </div>
        <div className={estilos.acciones}>
          {/* F13: cuánto pesan las imágenes, y esperar a que terminen de subir */}
          {editor.conImagenes && (
            <PesoArchivos
              peso={editor.pesoImagenes}
              maximo={LIMITES_IMAGENES.pesoLeccionMax}
              texto="Imágenes de esta lección"
            />
          )}
          {editor.subiendo && (
            <p className={estilos.estadoGuardado}>{MENSAJES_IMAGENES.esperarSubidas}</p>
          )}
          <p className={estilos.estadoGuardado} role="status">
            {hayCambios && "Cambios sin guardar"}
            {editor.guardada && "Lección guardada"}
          </p>
          <Boton
            variante="secundario"
            icono={Play}
            deshabilitado={bloques.length === 0 || guardando || editor.subiendo}
            alPulsar={probar}
          >
            Probar lección
          </Boton>
          <Boton
            enviando={guardando}
            textoEnviando="Guardar lección"
            deshabilitado={!hayCambios || editor.subiendo}
            alPulsar={() => editor.guardar()}
          >
            Guardar lección
          </Boton>
        </div>
      </Superficie>
      {editor.aviso && (
        <div className={estilos.aviso}>
          <Aviso texto={editor.aviso} />
        </div>
      )}
      <div className={estilos.zonas}>
        <PaletaActividades
          cantidadActividades={bloques.length}
          alAgregar={editor.agregar}
          arrastre={arrastre}
          deshabilitada={guardando}
        />
        <Secuencia
          bloques={bloques}
          idSeleccionado={idSeleccionado}
          arrastre={arrastre}
          alSeleccionar={editor.seleccionar}
          alMover={(desde, hasta) => editor.editar({ tipo: "mover", desde, hasta })}
          alEliminar={(id) => editor.editar({ tipo: "quitar", id })}
          deshabilitada={guardando}
        />
        <div ref={inspector} className={estilos.inspector}>
          <ContextoSubidas value={{ subir: editor.subir }}>
            <Inspector
              bloque={seleccionado}
              mostrarErrores={mostrarErrores}
              alCambiar={(id, borrador) => editor.editar({ tipo: "cambiarBorrador", id, borrador })}
              deshabilitado={guardando}
            />
          </ContextoSubidas>
        </div>
      </div>
      <Dialogo {...propsDialogo} />
      <Dialogo
        abierto={editor.versionMasNueva}
        titulo="Esta lección cambió en otro lugar"
        texto="Se guardó una versión más nueva en otra pestaña o dispositivo. Si guardas, la reemplazarás."
        textoConfirmar="Reemplazar"
        textoCancelar="Cancelar"
        alConfirmar={() => editor.guardar(true)}
        alCancelar={editor.cancelarReemplazo}
      />
    </div>
  );
}
