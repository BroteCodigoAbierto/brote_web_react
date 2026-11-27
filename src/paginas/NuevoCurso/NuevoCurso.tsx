import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { crearCurso, esSesionPerdida, leerErrorDeFormulario } from "../../servicios/editor.ts";
import {
  CATEGORIAS_CURSO,
  LIMITES_CURSO,
  NIVELES_CURSO,
  NOMBRE_CATEGORIA,
  NOMBRE_NIVEL,
  NOMBRE_VISIBILIDAD,
  VISIBILIDADES_CURSO,
  type CategoriaCurso,
  type NivelCurso,
  type VisibilidadCurso,
} from "../../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../../utilidades/copiaEditor.ts";
import { validarDatosCurso, type CampoCurso } from "../../validacion/curso.ts";
import estilos from "./NuevoCurso.module.css";

const OPCIONES_CATEGORIA = CATEGORIAS_CURSO.map((c) => ({
  valor: c,
  texto: NOMBRE_CATEGORIA[c],
}));

const OPCIONES_NIVEL = NIVELES_CURSO.map((n) => ({
  valor: n,
  texto: NOMBRE_NIVEL[n],
}));

// Crear un curso (F05 + decisión 0020): nace como borrador, sin lecciones.
export default function NuevoCurso() {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  const { organizacionesDocente } = useEspacio();
  const [copia] = useState(() => tomarCopia<Record<CampoCurso, string>>(idUsuario, pathname));

  const [categoria, setCategoria] = useState<CategoriaCurso>("otros");
  const [nivel, setNivel] = useState<NivelCurso>("principiante");
  const [visibilidad, setVisibilidad] = useState<VisibilidadCurso>("publico");
  const [idOrganizacion, setIdOrganizacion] = useState<string | null>(null);

  const opcionesVisibilidad = VISIBILIDADES_CURSO.filter(
    (v) => v !== "organizacion" || organizacionesDocente.length > 0,
  ).map((v) => ({ valor: v, texto: NOMBRE_VISIBILIDAD[v] }));

  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario<CampoCurso>({
    inicial: copia ?? { titulo: "", descripcion: "" },
    validar: validarDatosCurso,
    leerError: (error) =>
      leerErrorDeFormulario(error, "No se pudo crear el curso. Inténtalo de nuevo en un momento."),
    enviar: async (datos) => {
      try {
        const orgElegida =
          visibilidad === "organizacion"
            ? (idOrganizacion ?? organizacionesDocente[0]?.id ?? null)
            : idOrganizacion;
        const { curso } = await crearCurso({
          ...datos,
          categoria,
          nivel,
          visibilidad,
          idOrganizacion: orgElegida,
        });
        navegar(`/editor/${curso.id}`, { replace: true });
      } catch (error) {
        if (esSesionPerdida(error)) guardarCopia({ idUsuario, ruta: pathname, datos });
        throw error;
      }
    },
  });

  return (
    <Superficie className={estilos.tarjeta} elevada>
      <h1 className={estilos.titulo}>Nuevo curso</h1>
      <form className={estilos.formulario} noValidate onSubmit={manejarEnvio}>
        <CampoTexto
          id="titulo"
          etiqueta="Título"
          valor={valores.titulo}
          alCambiar={(valor) => cambiar("titulo", valor)}
          error={errores.titulo}
          maxLongitud={LIMITES_CURSO.tituloMax}
        />
        <CampoArea
          id="descripcion"
          etiqueta="Descripción"
          valor={valores.descripcion}
          alCambiar={(valor) => cambiar("descripcion", valor)}
          error={errores.descripcion}
          maxLongitud={LIMITES_CURSO.descripcionMax}
        />
        <CampoSelector
          id="categoria"
          etiqueta="Categoría"
          valor={categoria}
          opciones={OPCIONES_CATEGORIA}
          alCambiar={(v) => v && setCategoria(v as CategoriaCurso)}
          deshabilitado={enviando}
        />
        <CampoSelector
          id="nivel"
          etiqueta="Nivel"
          valor={nivel}
          opciones={OPCIONES_NIVEL}
          alCambiar={(v) => v && setNivel(v as NivelCurso)}
          deshabilitado={enviando}
        />
        <CampoSelector
          id="visibilidad"
          etiqueta="Dónde se publicará"
          valor={visibilidad}
          opciones={opcionesVisibilidad}
          alCambiar={(v) => v && setVisibilidad(v as VisibilidadCurso)}
          ayuda="Los cursos con enlace privado o de organización sin revisión se publican al instante."
          deshabilitado={enviando}
        />
        {organizacionesDocente.length > 0 && (
          <CampoSelector
            id="organizacion"
            etiqueta="Organización (opcional)"
            valor={idOrganizacion}
            textoVacio="Mi cuenta personal"
            opciones={organizacionesDocente.map((o) => ({ valor: o.id, texto: o.nombre }))}
            alCambiar={setIdOrganizacion}
            deshabilitado={enviando}
          />
        )}
        {general && <Aviso texto={general} />}
        <div className={estilos.botones}>
          <Boton
            variante="secundario"
            deshabilitado={enviando}
            alPulsar={() => navegar("/estudio")}
          >
            Cancelar
          </Boton>
          <Boton tipo="submit" enviando={enviando} textoEnviando="Crear curso">
            Crear curso
          </Boton>
        </div>
      </form>
    </Superficie>
  );
}
