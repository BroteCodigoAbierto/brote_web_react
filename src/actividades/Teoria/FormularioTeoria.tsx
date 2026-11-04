import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorTeoria } from "./editorTeoria.ts";

// Formulario de la teoría (spec F05, "Formulario de cada tipo").
export default function FormularioTeoria({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorTeoria>) {
  const { puntosClave } = borrador;

  function cambiar(cambios: Partial<BorradorTeoria>) {
    alCambiar({ ...borrador, ...cambios });
  }

  function cambiarPunto(id: string, texto: string) {
    cambiar({
      puntosClave: puntosClave.map((punto) => (punto.id === id ? { ...punto, texto } : punto)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoTexto
        id={`${idBase}-titulo`}
        etiqueta="Título"
        valor={borrador.titulo}
        alCambiar={(titulo) => cambiar({ titulo })}
        maxLongitud={LIMITES_ACTIVIDADES.tituloMax}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-texto`}
        etiqueta="Texto"
        ayuda="Separa los párrafos con un renglón en blanco."
        valor={borrador.texto}
        alCambiar={(texto) => cambiar({ texto })}
        error={errores.texto}
        maxLongitud={LIMITES_ACTIVIDADES.textoMax}
        filas={6}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-codigo`}
        etiqueta="Código"
        ayuda="Las líneas que empiezan con +, - o @@ se resaltan como un diff."
        valor={borrador.codigo}
        alCambiar={(codigo) => cambiar({ codigo })}
        maxLongitud={LIMITES_ACTIVIDADES.codigoMax}
        codigo
        deshabilitado={deshabilitado}
      />
      <div className={estilos.grupo}>
        <p className={estilos.etiqueta}>Puntos clave</p>
        <ListaEditable
          filas={puntosClave}
          dibujarFila={(punto, indice) => (
            <CampoTexto
              id={`${idBase}-punto-${punto.id}`}
              etiqueta={`Punto ${indice + 1}`}
              valor={punto.texto}
              alCambiar={(texto) => cambiarPunto(punto.id, texto)}
              maxLongitud={LIMITES_ACTIVIDADES.puntoClaveMax}
              deshabilitado={deshabilitado}
            />
          )}
          alAgregar={() => cambiar({ puntosClave: [...puntosClave, { id: idLocal(), texto: "" }] })}
          alQuitar={(id) =>
            cambiar({ puntosClave: puntosClave.filter((punto) => punto.id !== id) })
          }
          textoAgregar="Agregar punto"
          minimo={0}
          maximo={LIMITES_ACTIVIDADES.puntosClaveMax}
          deshabilitada={deshabilitado}
        />
      </div>
    </div>
  );
}
