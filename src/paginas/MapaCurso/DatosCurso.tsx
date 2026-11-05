import { useEffect, useState } from "react";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import InsigniaEstadoCurso from "../../componentes/InsigniaEstadoCurso/InsigniaEstadoCurso.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { actualizarCurso, esSesionPerdida, leerErrorDeFormulario } from "../../servicios/editor.ts";
import { LIMITES_CURSO, type CursoEnEditor } from "../../tipos/contrato.ts";
import { validarDatosCurso, type CampoCurso } from "../../validacion/curso.ts";
import estilos from "./MapaCurso.module.css";

type ValoresCurso = Record<CampoCurso, string>;

type PropsDatosCurso = {
  curso: CursoEnEditor;
  // lo que estaba sin guardar cuando expiró la sesión
  inicial: ValoresCurso | null;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarPendientes: (hayCambios: boolean) => void;
  alCambiarCapturado: (valores: ValoresCurso) => void;
  alSesionPerdida: () => void;
};

// Título y descripción del curso (spec F05, "Editar los datos del curso").
export default function DatosCurso({
  curso,
  inicial,
  ocupado,
  alCambiarOcupado,
  alCambiarPendientes,
  alCambiarCapturado,
  alSesionPerdida,
}: PropsDatosCurso) {
  const [guardados, setGuardados] = useState<ValoresCurso>({
    titulo: curso.titulo,
    descripcion: curso.descripcion,
  });
  const [recienGuardado, setRecienGuardado] = useState(false);

  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario<CampoCurso>({
    inicial: inicial ? { titulo: inicial.titulo, descripcion: inicial.descripcion } : guardados,
    validar: validarDatosCurso,
    leerError: (error) => leerErrorDeFormulario(error, "No se pudieron guardar los cambios."),
    enviar: async (datos) => {
      alCambiarOcupado(true);
      try {
        const { curso: guardado } = await actualizarCurso(curso.id, datos);
        // el servidor recorta el título: lo guardado es lo que devuelve
        cambiar("titulo", guardado.titulo);
        setGuardados({ titulo: guardado.titulo, descripcion: guardado.descripcion });
        setRecienGuardado(true);
      } catch (error) {
        if (esSesionPerdida(error)) alSesionPerdida();
        throw error;
      } finally {
        alCambiarOcupado(false);
      }
    },
  });

  const hayCambios =
    valores.titulo !== guardados.titulo || valores.descripcion !== guardados.descripcion;

  useEffect(() => {
    alCambiarPendientes(hayCambios);
  }, [hayCambios, alCambiarPendientes]);

  const { titulo, descripcion } = valores;
  useEffect(() => {
    alCambiarCapturado({ titulo, descripcion });
  }, [titulo, descripcion, alCambiarCapturado]);

  return (
    <Superficie className={estilos.panel}>
      <div className={estilos.encabezado}>
        <PortadaCurso id={curso.id} titulo={guardados.titulo} tamano="tarjeta" />
        <div>
          <InsigniaEstadoCurso estado={curso.estado} />
        </div>
      </div>
      {/* noValidate: los mensajes son los de la spec, no los del navegador */}
      <form className={estilos.formulario} noValidate onSubmit={manejarEnvio}>
        <CampoTexto
          id="titulo-curso"
          etiqueta="Título"
          valor={valores.titulo}
          alCambiar={(valor) => cambiar("titulo", valor)}
          error={errores.titulo}
          maxLongitud={LIMITES_CURSO.tituloMax}
          deshabilitado={ocupado}
        />
        <CampoArea
          id="descripcion-curso"
          etiqueta="Descripción"
          valor={valores.descripcion}
          alCambiar={(valor) => cambiar("descripcion", valor)}
          error={errores.descripcion}
          maxLongitud={LIMITES_CURSO.descripcionMax}
          deshabilitado={ocupado}
        />
        {general && <Aviso texto={general} />}
        <div className={estilos.acciones}>
          {recienGuardado && !hayCambios && (
            <p className={estilos.guardado} role="status">
              Cambios guardados
            </p>
          )}
          <Boton
            tipo="submit"
            enviando={enviando}
            textoEnviando="Guardar cambios"
            deshabilitado={!hayCambios || ocupado}
          >
            Guardar cambios
          </Boton>
        </div>
      </form>
    </Superficie>
  );
}
