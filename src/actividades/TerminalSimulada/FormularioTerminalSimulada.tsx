import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import { crearComando, type BorradorTerminalSimulada } from "./editorTerminalSimulada.ts";

// Formulario de la terminal simulada (spec F12, "Formulario de cada tipo"). La carpeta y los
// comandos son de una línea: un CampoTexto no deja escribir saltos de línea.
export default function FormularioTerminalSimulada({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorTerminalSimulada>) {
  const { comandos } = borrador;

  function cambiarComando(id: string, texto: string) {
    alCambiar({
      ...borrador,
      comandos: comandos.map((fila) => (fila.id === id ? { ...fila, texto } : fila)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        valor={borrador.consigna}
        alCambiar={(consigna) => alCambiar({ ...borrador, consigna })}
        error={errores.consigna}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <CampoTexto
        id={`${idBase}-carpeta`}
        etiqueta="Carpeta"
        valor={borrador.carpeta}
        alCambiar={(carpeta) => alCambiar({ ...borrador, carpeta })}
        ayuda="Se ve antes del $. Por ejemplo: ~/proyectos/mi-app (main)."
        maxLongitud={LIMITES_ACTIVIDADES.carpetaMax}
        codigo
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-salida-previa`}
        etiqueta="Salida previa"
        valor={borrador.salidaPrevia}
        alCambiar={(salidaPrevia) => alCambiar({ ...borrador, salidaPrevia })}
        ayuda="Lo que la terminal ya muestra antes de que el alumno escriba."
        maxLongitud={LIMITES_ACTIVIDADES.salidaMax}
        filas={3}
        codigo
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Comandos aceptados</legend>
        <p className={estilos.ayuda}>
          Escribe cada forma que aceptas. Los espacios de sobra no cuentan; las mayúsculas y las
          comillas, sí.
        </p>
        <ListaEditable
          filas={comandos}
          dibujarFila={(comando, indice) => (
            <CampoTexto
              id={`${idBase}-comando-${comando.id}`}
              etiqueta={`Comando ${indice + 1}`}
              valor={comando.texto}
              alCambiar={(texto) => cambiarComando(comando.id, texto)}
              error={errores[`comandos.${comando.id}`]}
              ayuda={indice === 0 ? "Es el que ve el alumno como respuesta correcta" : undefined}
              maxLongitud={LIMITES_ACTIVIDADES.comandoMax}
              codigo
              deshabilitado={deshabilitado}
            />
          )}
          alAgregar={() => alCambiar({ ...borrador, comandos: [...comandos, crearComando()] })}
          alQuitar={(id) =>
            alCambiar({ ...borrador, comandos: comandos.filter((fila) => fila.id !== id) })
          }
          textoAgregar="Agregar comando"
          minimo={1}
          maximo={LIMITES_ACTIVIDADES.comandosMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
      <CampoArea
        id={`${idBase}-salida-acierto`}
        etiqueta="Salida al acertar"
        valor={borrador.salidaAcierto}
        alCambiar={(salidaAcierto) => alCambiar({ ...borrador, salidaAcierto })}
        ayuda="La terminal la muestra si el alumno acierta."
        maxLongitud={LIMITES_ACTIVIDADES.salidaMax}
        filas={3}
        codigo
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-pista`}
        etiqueta="Pista"
        valor={borrador.pista}
        alCambiar={(pista) => alCambiar({ ...borrador, pista })}
        ayuda="Se muestra solo si el alumno falla, junto al comando esperado."
        maxLongitud={LIMITES_ACTIVIDADES.pistaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
