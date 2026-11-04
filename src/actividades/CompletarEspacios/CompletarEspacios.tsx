import { Fragment, useState, type FormEvent, type KeyboardEvent } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import CampoEspacio, { type EstadoEspacio } from "../../componentes/CampoEspacio/CampoEspacio.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { esAceptada, partirEnEspacios, textoConRespuestas } from "../../utilidades/actividades.ts";
import { useAmbito } from "../ambito.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./CompletarEspacios.module.css";

// Completar espacios (spec F03): se escribe en cada espacio y se acepta
// cualquiera de sus respuestas, sin importar mayúsculas, acentos ni espacios
// de más. Se acierta solo si todos los espacios son correctos.
export default function CompletarEspacios({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"completarEspacios">) {
  const { espacios } = actividad;
  const enRecuadro = useAmbito() !== null;
  const trozos = partirEnEspacios(actividad.texto);
  const [valores, setValores] = useState<string[]>(() => espacios.map(() => ""));
  const [correctos, setCorrectos] = useState<boolean[] | null>(null);
  const comprobada = correctos !== null;
  const completo = valores.every((valor) => valor.trim() !== "");
  const acerto = comprobada && correctos.every(Boolean);

  function cambiar(indice: number, valor: string) {
    setValores((antes) => antes.map((anterior, i) => (i === indice ? valor : anterior)));
    alInteractuar();
  }

  function comprobar() {
    if (!completo || comprobada) return;
    setCorrectos(valores.map((valor, i) => esAceptada(valor, espacios[i] ?? { aceptadas: [] })));
  }

  // Enter en cualquier espacio es "Comprobar". Con dos o más campos y sin
  // botón de enviar, el navegador no envía el formulario solo.
  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    comprobar();
  }

  function manejarTecla(evento: KeyboardEvent<HTMLFormElement>) {
    if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
    evento.preventDefault();
    comprobar();
  }

  function estadoDe(indice: number): EstadoEspacio {
    if (!comprobada) return "normal";
    return correctos[indice] ? "correcto" : "incorrecto";
  }

  return (
    <div className={comun.actividad}>
      {/* aquí el foco va directo al primer espacio */}
      <h2 className="oculto">Completa los espacios</h2>
      <Superficie className={comun.panel}>
        <form className={estilos.texto} onSubmit={manejarEnvio} onKeyDown={manejarTecla}>
          {trozos.map((trozo, i) => (
            <Fragment key={i}>
              {trozo}
              {i < espacios.length && (
                <CampoEspacio
                  valor={valores[i] ?? ""}
                  alCambiar={(valor) => cambiar(i, valor)}
                  estado={estadoDe(i)}
                  esperada={estadoDe(i) === "incorrecto" ? espacios[i]?.aceptadas[0] : undefined}
                  etiqueta={`Espacio ${i + 1} de ${espacios.length}`}
                  deshabilitado={comprobada}
                  autoFocus={i === 0 && !enRecuadro}
                />
              )}
            </Fragment>
          ))}
        </form>
      </Superficie>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          detalle={acerto ? undefined : textoConRespuestas(actividad)}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(acerto ? "acierto" : "fallo")}
        />
      ) : (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={!completo}
          alPulsar={comprobar}
        />
      )}
    </div>
  );
}
