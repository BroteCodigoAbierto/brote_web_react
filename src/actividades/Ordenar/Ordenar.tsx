import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import ElementoRespuesta from "../../componentes/ElementoRespuesta/ElementoRespuesta.tsx";
import LugarElemento from "../../componentes/LugarElemento/LugarElemento.tsx";
import ZonaElementos from "../../componentes/ZonaElementos/ZonaElementos.tsx";
import { useArrastrarElemento } from "../../hooks/useArrastrarElemento.ts";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useFocoElementos } from "../../hooks/useFocoElementos.ts";
import {
  colocarEnPrimerLibre,
  detalleOrdenar,
  lugaresVacios,
  mezclarSinResolver,
  primerLibre,
  quitarDeLugar,
  SIN_COLOCAR,
  soltarEnLugares,
  type Lugares,
} from "../../utilidades/relacionar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./Ordenar.module.css";

// Ordenar (spec F11): se llenan los lugares numerados, pulsando cada elemento o arrastrándolo a
// un lugar en concreto. Se acierta solo si todos quedan en su lugar.
export default function Ordenar({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"ordenar">) {
  const { elementos } = actividad;
  const [orden] = useState(() => mezclarSinResolver(elementos.length));
  const [lugares, setLugares] = useState<Lugares>(() => lugaresVacios(elementos.length));
  const [comprobada, setComprobada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const { raiz, pedirFoco, enfocarComprobar } = useFocoElementos();
  const completa = primerLibre(lugares) === -1;
  const acerto = lugares.every((elemento, lugar) => elemento === lugar);

  const arrastre = useArrastrarElemento<number, number | typeof SIN_COLOCAR>({
    alSoltar: (item, destino) => cambiar(soltarEnLugares(lugares, item, destino), item),
  });

  function cambiar(nuevos: Lugares, elemento: number) {
    const lugar = nuevos.indexOf(elemento);
    const texto = elementos[elemento] ?? "";
    setLugares(nuevos);
    setAnuncio(lugar === -1 ? `${texto} sin colocar` : `${texto} en el lugar ${lugar + 1}`);
    alInteractuar();
  }

  function pulsar(elemento: number) {
    const colocado = lugares.includes(elemento);
    const nuevos = colocado
      ? quitarDeLugar(lugares, elemento)
      : colocarEnPrimerLibre(lugares, elemento);
    cambiar(nuevos, elemento);
    if (colocado) pedirFoco(`[data-elemento="${elemento}"]`);
    else if (primerLibre(nuevos) === -1) pedirFoco(null);
    else pedirFoco("[data-sin-colocar]");
  }

  function dibujar(elemento: number, lugar: number | null) {
    const texto = elementos[elemento] ?? "";
    const correcto = elemento === lugar;
    const partes = [
      texto,
      lugar !== null && `lugar ${lugar + 1}`,
      comprobada && (correcto ? "correcto" : "incorrecto"),
    ];
    return (
      <ElementoRespuesta
        key={elemento}
        texto={texto}
        estado={comprobada ? (correcto ? "correcta" : "incorrecta") : "normal"}
        atenuada={arrastre.item === elemento}
        deshabilitada={comprobada}
        etiqueta={partes.filter(Boolean).join(", ")}
        alPulsar={() => pulsar(elemento)}
        data-elemento={elemento}
        data-sin-colocar={lugar === null ? "" : undefined}
        {...(comprobada ? {} : arrastre.propsOrigen(elemento))}
      />
    );
  }

  return (
    <div ref={raiz} className={comun.actividad} {...arrastre.propsRaiz}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna}
      </h2>
      <div className={estilos.lugares}>
        {lugares.map((elemento, lugar) => (
          <LugarElemento
            key={lugar}
            numero={lugar + 1}
            estado={comprobada ? (elemento === lugar ? "correcto" : "incorrecto") : "normal"}
            resaltado={arrastre.destino === lugar}
            etiqueta={`Lugar ${lugar + 1}, vacío`}
            {...(comprobada ? {} : arrastre.propsDestino(lugar))}
          >
            {elemento === null ? undefined : dibujar(elemento, lugar)}
          </LugarElemento>
        ))}
      </div>
      <ZonaElementos
        etiqueta="Elementos sin colocar"
        resaltada={arrastre.destino === SIN_COLOCAR}
        {...(comprobada ? {} : arrastre.propsDestino(SIN_COLOCAR))}
      >
        {orden.filter((elemento) => !lugares.includes(elemento)).map((e) => dibujar(e, null))}
      </ZonaElementos>
      <p className="oculto" aria-live="polite">
        {anuncio}
      </p>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          detalle={acerto ? undefined : detalleOrdenar(actividad)}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(acerto ? "acierto" : "fallo")}
        />
      ) : (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={!completa}
          enfocar={enfocarComprobar}
          alPulsar={() => setComprobada(true)}
        />
      )}
    </div>
  );
}
