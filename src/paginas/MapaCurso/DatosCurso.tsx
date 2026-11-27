import { useEffect, useState } from "react";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoCasilla from "../../componentes/CampoCasilla/CampoCasilla.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import InsigniaEstadoCurso from "../../componentes/InsigniaEstadoCurso/InsigniaEstadoCurso.tsx";
import PesoArchivos from "../../componentes/PesoArchivos/PesoArchivos.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import VistaPortada from "../../componentes/VistaPortada/VistaPortada.tsx";
import { aValorImagen, type ValorImagen } from "../../editor/imagenes.ts";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { ErrorHttp } from "../../servicios/api.ts";
import { actualizarCurso, esSesionPerdida, leerErrorDeFormulario } from "../../servicios/editor.ts";
import { leerErrorDeSubida, subirImagen } from "../../servicios/imagenes.ts";
import {
  CATEGORIAS_CURSO,
  IDIOMAS_CURSO,
  LIMITES_ARCHIVOS,
  LIMITES_CURSO,
  MENSAJES_ARCHIVOS,
  MENSAJES_IMAGENES,
  NIVELES_CURSO,
  NOMBRE_CATEGORIA,
  NOMBRE_IDIOMA,
  NOMBRE_NIVEL,
  NOMBRE_VISIBILIDAD,
  VISIBILIDADES_CURSO,
  type CategoriaCurso,
  type CursoEnEditor,
  type IdiomaCurso,
  type NivelCurso,
  type RespuestaError,
  type VisibilidadCurso,
} from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import { prepararImagen } from "../../utilidades/imagenes.ts";
import { validarDatosCurso, type CampoCurso } from "../../validacion/curso.ts";
import estilos from "./MapaCurso.module.css";

type ValoresCurso = Record<CampoCurso, string>;

type CapturadoCurso = ValoresCurso & { idioma?: IdiomaCurso; daInsignia?: boolean };

const OPCIONES_IDIOMA = IDIOMAS_CURSO.map((idioma) => ({
  valor: idioma,
  texto: NOMBRE_IDIOMA[idioma],
}));

const OPCIONES_CATEGORIA = CATEGORIAS_CURSO.map((c) => ({
  valor: c,
  texto: NOMBRE_CATEGORIA[c],
}));

const OPCIONES_NIVEL = NIVELES_CURSO.map((n) => ({
  valor: n,
  texto: NOMBRE_NIVEL[n],
}));

function separarEtiquetas(texto: string): string[] {
  return texto
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .slice(0, LIMITES_CURSO.etiquetasMax);
}

type PropsDatosCurso = {
  curso: CursoEnEditor;
  inicial: CapturadoCurso | null;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarPendientes: (hayCambios: boolean) => void;
  alCambiarCapturado: (valores: CapturadoCurso) => void;
  alActualizarCurso: (curso: CursoEnEditor) => void;
  alSesionPerdida: () => void;
};

// Los datos del curso (F05 + F08 + F13 + F14 + decisión 0020).
export default function DatosCurso({
  curso,
  inicial,
  ocupado,
  alCambiarOcupado,
  alCambiarPendientes,
  alCambiarCapturado,
  alActualizarCurso,
  alSesionPerdida,
}: PropsDatosCurso) {
  const { organizacionesDocente } = useEspacio();
  const [guardados, setGuardados] = useState<ValoresCurso>({
    titulo: curso.titulo,
    descripcion: curso.descripcion,
  });
  const [recienGuardado, setRecienGuardado] = useState(false);

  const [portada, setPortada] = useState<ValorImagen>(() =>
    aValorImagen(curso.portada ?? undefined),
  );
  const [portadaGuardada, setPortadaGuardada] = useState(curso.portada?.id ?? null);
  const [pesoArchivos, setPesoArchivos] = useState(curso.pesoArchivos);
  const idPortada = portada.imagen?.id ?? null;
  const cambioPortada = idPortada !== portadaGuardada;

  const [idioma, setIdioma] = useState<IdiomaCurso>(inicial?.idioma ?? curso.idioma);
  const [idiomaGuardado, setIdiomaGuardado] = useState(curso.idioma);
  const cambioIdioma = idioma !== idiomaGuardado;

  const [daInsignia, setDaInsignia] = useState(inicial?.daInsignia ?? curso.daInsignia);
  const [daInsigniaGuardado, setDaInsigniaGuardado] = useState(curso.daInsignia);
  const cambioInsignia = daInsignia !== daInsigniaGuardado;

  const [categoria, setCategoria] = useState<CategoriaCurso>(curso.categoria);
  const [categoriaGuardada, setCategoriaGuardada] = useState<CategoriaCurso>(curso.categoria);
  const cambioCategoria = categoria !== categoriaGuardada;

  const [nivel, setNivel] = useState<NivelCurso>(curso.nivel);
  const [nivelGuardado, setNivelGuardado] = useState<NivelCurso>(curso.nivel);
  const cambioNivel = nivel !== nivelGuardado;

  const [etiquetasTexto, setEtiquetasTexto] = useState(curso.etiquetas.join(", "));
  const [etiquetasGuardadas, setEtiquetasGuardadas] = useState(curso.etiquetas.join(", "));
  const cambioEtiquetas = etiquetasTexto.trim() !== etiquetasGuardadas.trim();

  const [visibilidad, setVisibilidad] = useState<VisibilidadCurso>(curso.visibilidad);
  const [visibilidadGuardada, setVisibilidadGuardada] = useState<VisibilidadCurso>(
    curso.visibilidad,
  );
  const cambioVisibilidad = visibilidad !== visibilidadGuardada;

  const [idOrganizacion, setIdOrganizacion] = useState<string | null>(
    curso.organizacion?.id ?? null,
  );
  const [orgGuardada, setOrgGuardada] = useState<string | null>(curso.organizacion?.id ?? null);
  const cambioOrg = idOrganizacion !== orgGuardada;

  const [tambienPublico, setTambienPublico] = useState(curso.tambienPublico);
  const [tambienPublicoGuardado, setTambienPublicoGuardado] = useState(curso.tambienPublico);
  const cambioTambienPublico = tambienPublico !== tambienPublicoGuardado;

  const [permiteFork, setPermiteFork] = useState(curso.permiteFork);
  const [permiteForkGuardado, setPermiteForkGuardado] = useState(curso.permiteFork);
  const cambioFork = permiteFork !== permiteForkGuardado;

  const opcionesVisibilidad = VISIBILIDADES_CURSO.filter(
    (v) => v !== "organizacion" || organizacionesDocente.length > 0 || curso.organizacion !== null,
  ).map((v) => ({ valor: v, texto: NOMBRE_VISIBILIDAD[v] }));

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
          ...(cambioInsignia && { daInsignia }),
          ...(cambioCategoria && { categoria }),
          ...(cambioNivel && { nivel }),
          ...(cambioEtiquetas && { etiquetas: separarEtiquetas(etiquetasTexto) }),
          ...(cambioVisibilidad && { visibilidad }),
          ...(cambioOrg && { idOrganizacion }),
          ...(cambioTambienPublico && { tambienPublico }),
          ...(cambioFork && { permiteFork }),
        });
        cambiar("titulo", guardado.titulo);
        setGuardados({ titulo: guardado.titulo, descripcion: guardado.descripcion });
        setPortadaGuardada(guardado.portada?.id ?? null);
        setIdiomaGuardado(guardado.idioma);
        setDaInsigniaGuardado(guardado.daInsignia);
        setCategoriaGuardada(guardado.categoria);
        setNivelGuardado(guardado.nivel);
        const nuevasEtiquetas = guardado.etiquetas.join(", ");
        setEtiquetasTexto(nuevasEtiquetas);
        setEtiquetasGuardadas(nuevasEtiquetas);
        setVisibilidadGuardada(guardado.visibilidad);
        setOrgGuardada(guardado.organizacion?.id ?? null);
        setIdOrganizacion(guardado.organizacion?.id ?? null);
        setTambienPublicoGuardado(guardado.tambienPublico);
        setPermiteForkGuardado(guardado.permiteFork);
        setPesoArchivos(guardado.pesoArchivos);
        setRecienGuardado(true);
        alActualizarCurso(guardado);
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
    cambioInsignia ||
    cambioCategoria ||
    cambioNivel ||
    cambioEtiquetas ||
    cambioVisibilidad ||
    cambioOrg ||
    cambioTambienPublico ||
    cambioFork ||
    portada.subida !== null;

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
    alCambiarCapturado({ titulo, descripcion, idioma, daInsignia });
  }, [titulo, descripcion, idioma, daInsignia, alCambiarCapturado]);

  return (
    <Superficie className={estilos.panel}>
      <div className={estilos.encabezado}>
        <VistaPortada idCurso={curso.id} titulo={guardados.titulo} idPortada={idPortada} />
        <div>
          <InsigniaEstadoCurso estado={curso.estado} />
        </div>
      </div>
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
          id="categoria-curso"
          etiqueta="Categoría"
          valor={categoria}
          opciones={OPCIONES_CATEGORIA}
          alCambiar={(valor) => valor && setCategoria(valor as CategoriaCurso)}
          deshabilitado={ocupado}
        />
        <CampoSelector
          id="nivel-curso"
          etiqueta="Nivel"
          valor={nivel}
          opciones={OPCIONES_NIVEL}
          alCambiar={(valor) => valor && setNivel(valor as NivelCurso)}
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
        <CampoTexto
          id="etiquetas-curso"
          etiqueta="Etiquetas (opcional)"
          valor={etiquetasTexto}
          alCambiar={setEtiquetasTexto}
          ayuda={`Separadas por coma (hasta ${LIMITES_CURSO.etiquetasMax}). Ej: python, algoritmos, principiantes`}
          deshabilitado={ocupado}
        />
        <CampoSelector
          id="visibilidad-curso"
          etiqueta="Visibilidad"
          valor={visibilidad}
          opciones={opcionesVisibilidad}
          alCambiar={(valor) => valor && setVisibilidad(valor as VisibilidadCurso)}
          ayuda="El enlace privado y los espacios sin revisión se publican directo sin espera."
          deshabilitado={ocupado}
        />
        {organizacionesDocente.length > 0 && (
          <CampoSelector
            id="organizacion-curso"
            etiqueta="Organización (opcional)"
            valor={idOrganizacion}
            textoVacio="Mi cuenta personal"
            opciones={organizacionesDocente.map((o) => ({ valor: o.id, texto: o.nombre }))}
            alCambiar={setIdOrganizacion}
            deshabilitado={ocupado}
          />
        )}
        {visibilidad === "organizacion" && (
          <CampoCasilla
            id="tambien-publico-curso"
            etiqueta="Compartir también en el catálogo abierto de la comunidad"
            ayuda="Si lo activas, el curso aparecerá en tu organización y además podrá verse en la comunidad."
            valor={tambienPublico}
            alCambiar={setTambienPublico}
            deshabilitado={ocupado}
          />
        )}
        <CampoCasilla
          id="insignia-curso"
          etiqueta="Dar una insignia a quien complete el curso"
          ayuda="Quien termine todas las lecciones gana una insignia con la portada del curso."
          valor={daInsignia}
          alCambiar={setDaInsignia}
          deshabilitado={ocupado}
        />
        <CampoCasilla
          id="fork-curso"
          etiqueta="Permitir que otros docentes adapten (bifurquen) este curso"
          ayuda="Quien lo adapte creará su propio borrador manteniendo el crédito a tu curso original."
          valor={permiteFork}
          alCambiar={setPermiteFork}
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
