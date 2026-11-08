import Aviso from "../../componentes/Aviso/Aviso.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { useSubidas } from "../../contextos/ContextoSubidas.ts";
import { aValorImagen, type ValorImagen } from "../../editor/imagenes.ts";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorOpcionMultiple, TipoOpciones } from "./editorOpcionMultiple.ts";

const TIPOS_OPCIONES: { tipo: TipoOpciones; etiqueta: string }[] = [
  { tipo: "texto", etiqueta: "Texto" },
  { tipo: "simbolo", etiqueta: "Símbolo" },
  { tipo: "imagen", etiqueta: "Imagen" },
];

// Formulario de la opción múltiple (spec F05, "Formulario de cada tipo"). Desde F13, la
// imagen de la pregunta y las opciones de imagen; al cambiar de tipo se conserva todo.
export default function FormularioOpcionMultiple({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorOpcionMultiple>) {
  const { opciones, tipoOpciones, idCorrecta } = borrador;
  const conSimbolos = tipoOpciones === "simbolo";
  const conImagenes = tipoOpciones === "imagen";
  const { subir } = useSubidas();

  function cambiar(cambios: Partial<BorradorOpcionMultiple>) {
    alCambiar({ ...borrador, ...cambios });
  }

  function cambiarOpcion(id: string, valor: string) {
    cambiar({
      opciones: opciones.map((opcion) => (opcion.id === id ? { ...opcion, valor } : opcion)),
    });
  }

  function cambiarImagenOpcion(id: string, imagen: ValorImagen) {
    cambiar({
      opciones: opciones.map((opcion) => (opcion.id === id ? { ...opcion, imagen } : opcion)),
    });
  }

  function quitarOpcion(id: string) {
    cambiar({
      opciones: opciones.filter((opcion) => opcion.id !== id),
      idCorrecta: id === idCorrecta ? null : idCorrecta,
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-pregunta`}
        etiqueta="Pregunta"
        valor={borrador.pregunta}
        alCambiar={(pregunta) => cambiar({ pregunta })}
        error={errores.pregunta}
        maxLongitud={LIMITES_ACTIVIDADES.preguntaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <CampoImagen
        id={`${idBase}-imagen-pregunta`}
        etiqueta="Imagen de la pregunta"
        valor={borrador.imagenPregunta}
        alCambiar={(imagenPregunta) => cambiar({ imagenPregunta })}
        alElegirArchivo={subir}
        error={errores.imagenPregunta}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-codigo`}
        etiqueta="Código"
        ayuda="Las líneas que empiezan con +, - o @@ se resaltan como un diff."
        valor={borrador.codigo}
        alCambiar={(codigo) => cambiar({ codigo })}
        maxLongitud={LIMITES_ACTIVIDADES.codigoMax}
        filas={3}
        codigo
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Tipo de opciones</legend>
        <div className={estilos.opciones}>
          {TIPOS_OPCIONES.map(({ tipo, etiqueta }) => (
            <label key={tipo} className={estilos.radio}>
              <input
                type="radio"
                name={`${idBase}-tipo-opciones`}
                checked={tipoOpciones === tipo}
                onChange={() => cambiar({ tipoOpciones: tipo })}
                disabled={deshabilitado}
              />
              {etiqueta}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Opciones</legend>
        <ListaEditable
          filas={opciones}
          dibujarFila={(opcion, indice) => (
            <div className={estilos.filaOpcion}>
              {conImagenes ? (
                <CampoImagen
                  id={`${idBase}-opcion-${opcion.id}`}
                  etiqueta={`Opción ${indice + 1}`}
                  valor={opcion.imagen}
                  alCambiar={(imagen) => cambiarImagenOpcion(opcion.id, imagen)}
                  alElegirArchivo={subir}
                  error={errores[`opciones.${opcion.id}`]}
                  deshabilitado={deshabilitado}
                />
              ) : (
                <CampoTexto
                  id={`${idBase}-opcion-${opcion.id}`}
                  etiqueta={`Opción ${indice + 1}`}
                  valor={opcion.valor}
                  alCambiar={(valor) => cambiarOpcion(opcion.id, valor)}
                  error={errores[`opciones.${opcion.id}`]}
                  maxLongitud={
                    conSimbolos
                      ? LIMITES_ACTIVIDADES.opcionSimboloMax
                      : LIMITES_ACTIVIDADES.opcionTextoMax
                  }
                  deshabilitado={deshabilitado}
                />
              )}
              <label className={estilos.radio}>
                <input
                  type="radio"
                  name={`${idBase}-correcta`}
                  checked={idCorrecta === opcion.id}
                  onChange={() => cambiar({ idCorrecta: opcion.id })}
                  disabled={deshabilitado}
                  aria-invalid={errores.correcta ? true : undefined}
                />
                Correcta
              </label>
            </div>
          )}
          alAgregar={() =>
            cambiar({
              opciones: [...opciones, { id: idLocal(), valor: "", imagen: aValorImagen() }],
            })
          }
          alQuitar={quitarOpcion}
          textoAgregar="Agregar opción"
          minimo={LIMITES_ACTIVIDADES.opcionesMin}
          maximo={LIMITES_ACTIVIDADES.opcionesMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
      {errores.correcta && <Aviso texto={errores.correcta} />}
    </div>
  );
}
