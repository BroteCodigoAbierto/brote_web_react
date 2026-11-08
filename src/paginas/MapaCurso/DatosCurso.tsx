import { useEffect, useState } from "react";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import PesoArchivos from "../../componentes/PesoArchivos/PesoArchivos.tsx";
import VistaPortada from "../../componentes/VistaPortada/VistaPortada.tsx";
import { aValorImagen, type ValorImagen } from "../../editor/imagenes.ts";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import InsigniaEstadoCurso from "../../componentes/InsigniaEstadoCurso/InsigniaEstadoCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { ErrorHttp } from "../../servicios/api.ts";
import { actualizarCurso, esSesionPerdida, leerErrorDeFormulario } from "../../servicios/editor.ts";
import { leerErrorDeSubida, subirImagen } from "../../servicios/imagenes.ts";
import {
  IDIOMAS_CURSO,
  LIMITES_ARCHIVOS,
  LIMITES_CURSO,
  MENSAJES_ARCHIVOS,
  MENSAJES_IMAGENES,
  NOMBRE_IDIOMA,
  type CursoEnEditor,
  type IdiomaCurso,
  type RespuestaError,
} from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import { prepararImagen } from "../../utilidades/imagenes.ts";
import { validarDatosCurso, type CampoCurso } from "../../validacion/curso.ts";
import estilos from "./MapaCurso.module.css";

type ValoresCurso = Record<CampoCurso, string>;

// F14: el idioma va con el título y la descripción en la copia que se recupera al volver a
// entrar (una copia de antes no lo trae)
type CapturadoCurso = ValoresCurso & { idioma?: IdiomaCurso };

const OPCIONES_IDIOMA = IDIOMAS_CURSO.map((idioma) => ({
  valor: idioma,
  texto: NOMBRE_IDIOMA[idioma],
}));

type PropsDatosCurso = {
  curso: CursoEnEditor;
  // lo que estaba sin guardar cuando expiró la sesión
  inicial: CapturadoCurso | null;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarPendientes: (hayCambios: boolean) => void;
  alCambiarCapturado: (valores: CapturadoCurso) => void;
  alSesionPerdida: () => void;
};

// Los datos del curso (spec F05, "Editar los datos del curso"): la portada (F13), el título,
// la descripción y el idioma (F14), que se guardan juntos con "Guardar cambios".
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
  // F13: la portada elegida (se guarda con "Guardar cambios") y el peso de las imágenes
  const [portada, setPortada] = useState<ValorImagen>(() =>
    aValorImagen(curso.portada ?? undefined),
  );
  const [portadaGuardada, setPortadaGuardada] = useState(curso.portada?.id ?? null);
  // F14: el peso cuenta imágenes y audios
  const [pesoArchivos, setPesoArchivos] = useState(curso.pesoArchivos);
  const idPortada = portada.imagen?.id ?? null;
  const cambioPortada = idPortada !== portadaGuardada;
  // F14: el idioma, como la portada: se manda solo si cambió
  const [idioma, setIdioma] = useState<IdiomaCurso>(inicial?.idioma ?? curso.idioma);
  const [idiomaGuardado, setIdiomaGuardado] = useState(curso.idioma);
  const cambioIdioma = idioma !== idiomaGuardado;

  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario<CampoCurso>({
    inicial: inicial ? { titulo: inicial.titulo, descripcion: inicial.descripcion } : guardados,
    validar: validarDatosCurso,
    leerError: (error) => leerErrorDeFormulario(error, "No se pudieron guardar los cambios."),
    enviar: async (datos) => {
      alCambiarOcupado(true);
      try {
        const { curso: guardado } = await actualizarCurso(curso.id, {
          ...datos,
          ...(cambioPortada && { idPortada }),
          ...(cambioIdioma && { idioma }),
        });
        // el servidor recorta el título: lo guardado es lo que devuelve
        cambiar("titulo", guardado.titulo);
        setGuardados({ titulo: guardado.titulo, descripcion: guardado.descripcion });
        setPortadaGuardada(guardado.portada?.id ?? null);
        setIdiomaGuardado(guardado.idioma);
        setPesoArchivos(guardado.pesoArchivos);
        setRecienGuardado(true);
      } catch (error) {
        if (esSesionPerdida(error)) alSesionPerdida();
        marcarErrorPortada(error);
        throw error;
      } finally {
        alCambiarOcupado(false);
      }
    },
  });

  const hayCambios =
    valores.titulo !== guardados.titulo ||
    valores.descripcion !== guardados.descripcion ||
    cambioPortada ||
    cambioIdioma ||
    portada.subida !== null;

  // F13: un 400 con campos.portada (no es del curso o es un GIF) va en su campo
  function marcarErrorPortada(error: unknown) {
    if (!(error instanceof ErrorHttp) || error.estado !== 400) return;
    const mensaje = (error.cuerpo as Partial<RespuestaError> | null)?.campos?.portada;
    if (!mensaje) return;
    setPortada((actual) =>
      mensaje === MENSAJES_IMAGENES.imagenNoEsta
        ? { ...actual, perdida: true }
        : { ...actual, error: mensaje },
    );
  }

  // F13: sube la portada; al terminar, la pone solo si sigue siendo la que se eligió
  function subirPortada(archivo: File): string {
    const idSubida = idLocal();
    function terminar(cambios: Partial<ValorImagen>) {
      setPortada((actual) =>
        actual.subida === idSubida ? { ...actual, subida: null, ...cambios } : actual,
      );
    }
    void (async () => {
      let preparada: Blob;
      try {
        preparada = await prepararImagen(archivo, { soloFotos: true });
      } catch (error) {
        terminar({
          error: error instanceof Error ? error.message : MENSAJES_IMAGENES.subidaFallida,
        });
        return;
      }
      try {
        const { imagen } = await subirImagen(curso.id, preparada);
        terminar({ imagen, error: null, perdida: false });
      } catch (error) {
        terminar(esSesionPerdida(error) ? {} : { error: leerErrorDeSubida(error) });
        if (esSesionPerdida(error)) alSesionPerdida();
      }
    })();
    return idSubida;
  }

  useEffect(() => {
    alCambiarPendientes(hayCambios);
  }, [hayCambios, alCambiarPendientes]);

  const { titulo, descripcion } = valores;
  useEffect(() => {
    alCambiarCapturado({ titulo, descripcion, idioma });
  }, [titulo, descripcion, idioma, alCambiarCapturado]);

  return (
    <Superficie className={estilos.panel}>
      <div className={estilos.encabezado}>
        <VistaPortada idCurso={curso.id} titulo={guardados.titulo} idPortada={idPortada} />
        <div>
          <InsigniaEstadoCurso estado={curso.estado} />
        </div>
      </div>
      {/* noValidate: los mensajes son los de la spec, no los del navegador */}
      <form className={estilos.formulario} noValidate onSubmit={manejarEnvio}>
        <CampoImagen
          id="portada-curso"
          etiqueta="Portada"
          valor={portada}
          alCambiar={setPortada}
          alElegirArchivo={subirPortada}
          soloFotos
          deshabilitado={ocupado}
        />
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
        <CampoSelector
          id="idioma-curso"
          etiqueta="Idioma"
          valor={idioma}
          opciones={OPCIONES_IDIOMA}
          alCambiar={(valor) => valor && setIdioma(valor as IdiomaCurso)}
          ayuda="El idioma de la voz que lee las frases de escuchar y repetir."
          deshabilitado={ocupado}
        />
        {pesoArchivos > 0 && (
          <PesoArchivos
            peso={pesoArchivos}
            maximo={LIMITES_ARCHIVOS.pesoCursoMax}
            texto="Archivos del curso"
          />
        )}
        {general && <Aviso texto={general} />}
        <div className={estilos.acciones}>
          {portada.subida !== null && (
            <p className={estilos.guardado}>{MENSAJES_ARCHIVOS.esperarSubidas}</p>
          )}
          {recienGuardado && !hayCambios && (
            <p className={estilos.guardado} role="status">
              Cambios guardados
            </p>
          )}
          <Boton
            tipo="submit"
            enviando={enviando}
            textoEnviando="Guardar cambios"
            deshabilitado={!hayCambios || ocupado || portada.subida !== null}
          >
            Guardar cambios
          </Boton>
        </div>
      </form>
    </Superficie>
  );
}
