import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { crearCurso, esSesionPerdida, leerErrorDeFormulario } from "../../servicios/editor.ts";
import { LIMITES_CURSO } from "../../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../../utilidades/copiaEditor.ts";
import { validarDatosCurso, type CampoCurso } from "../../validacion/curso.ts";
import estilos from "./NuevoCurso.module.css";

// Crear un curso (spec F05): nace como borrador, sin lecciones.
export default function NuevoCurso() {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  // lo que estaba escrito si la sesión expiró al crear
  const [copia] = useState(() => tomarCopia<Record<CampoCurso, string>>(idUsuario, pathname));

  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario<CampoCurso>({
    inicial: copia ?? { titulo: "", descripcion: "" },
    validar: validarDatosCurso,
    leerError: (error) =>
      leerErrorDeFormulario(error, "No se pudo crear el curso. Inténtalo de nuevo en un momento."),
    enviar: async (datos) => {
      try {
        const { curso } = await crearCurso(datos);
        // reemplaza: "atrás" desde el mapa no vuelve a este formulario
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
      {/* noValidate: los mensajes son los de la spec, no los del navegador */}
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
        {general && <Aviso texto={general} />}
        <div className={estilos.botones}>
          <Boton variante="secundario" deshabilitado={enviando} alPulsar={() => navegar("/panel")}>
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
