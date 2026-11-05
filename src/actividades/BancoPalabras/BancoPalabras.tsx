import { Fragment, useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import ElementoRespuesta from "../../componentes/ElementoRespuesta/ElementoRespuesta.tsx";
import LugarElemento from "../../componentes/LugarElemento/LugarElemento.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import ZonaElementos from "../../componentes/ZonaElementos/ZonaElementos.tsx";
import { useArrastrarElemento } from "../../hooks/useArrastrarElemento.ts";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useFocoElementos } from "../../hooks/useFocoElementos.ts";
import { CONSIGNA_POR_DEFECTO } from "../../tipos/contrato.ts";
import { mezclar, partirEnEspacios } from "../../utilidades/actividades.ts";
import {
  colocarEnPrimerLibre,
  fichaCorrecta,
  lugaresVacios,
  primerLibre,
  quitarDeLugar,
  SIN_COLOCAR,
  solucionBanco,
  soltarEnLugares,
  textoConFichas,
  type Lugares,
} from "../../utilidades/relacionar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./BancoPalabras.module.css";

// Banco de palabras (spec F11): cada espacio del texto se llena con una ficha, y cada ficha se
// usa una sola vez. Se acierta solo si todos los espacios son correctos.
export default function BancoPalabras({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"bancoPalabras">) {
  const { fichas, espacios } = actividad;
  const [orden] = useState(() => mezclar(fichas.map((_, indice) => indice)));
  const [lugares, setLugares] = useState<Lugares>(() => lugaresVacios(espacios.length));
  const [comprobada, setComprobada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const { raiz, pedirFoco, enfocarComprobar } = useFocoElementos();
  const trozos = partirEnEspacios(actividad.texto);
  const completa = primerLibre(lugares) === -1;
  const acerto = lugares.every((ficha, espacio) => fichaCorrecta(actividad, ficha, espacio));
  const solucion = comprobada && !acerto ? solucionBanco(actividad, lugares) : [];

  const arrastre = useArrastrarElemento<number, number | typeof SIN_COLOCAR>({
    alSoltar: (item, destino) => cambiar(soltarEnLugares(lugares, item, destino), item),
  });

  function cambiar(nuevos: Lugares, ficha: number) {
    const espacio = nuevos.indexOf(ficha);
    const texto = fichas[ficha] ?? "";
    setLugares(nuevos);
    setAnuncio(espacio === -1 ? `${texto} sin colocar` : `${texto} en el espacio ${espacio + 1}`);
    alInteractuar();
  }

  function pulsar(ficha: number) {
    const colocada = lugares.includes(ficha);
    if (!colocada && completa) return;
    const nuevos = colocada ? quitarDeLugar(lugares, ficha) : colocarEnPrimerLibre(lugares, ficha);
    cambiar(nuevos, ficha);
    if (colocada) pedirFoco(`[data-elemento="${ficha}"]`);
    // aunque en el banco sobren fichas: con la respuesta completa, ya no hace falta otra
    else if (primerLibre(nuevos) === -1) pedirFoco(null);
    else pedirFoco("[data-sin-colocar]");
  }

  function dibujar(ficha: number, espacio: number | null) {
    const texto = fichas[ficha] ?? "";
    const correcta = espacio !== null && fichaCorrecta(actividad, ficha, espacio);
    const enEspacio = comprobada && espacio !== null;
    const partes = [
      texto,
      espacio !== null && `espacio ${espacio + 1}`,
      enEspacio && (correcta ? "correcto" : "incorrecto"),
    ];
    return (
      <ElementoRespuesta
        key={ficha}
        texto={texto}
        forma="compacta"
        estado={enEspacio ? (correcta ? "correcta" : "incorrecta") : "normal"}
        atenuada={arrastre.item === ficha}
        deshabilitada={comprobada}
        etiqueta={partes.filter(Boolean).join(", ")}
        alPulsar={() => pulsar(ficha)}
        data-elemento={ficha}
        data-sin-colocar={espacio === null ? "" : undefined}
        {...(comprobada ? {} : arrastre.propsOrigen(ficha))}
      />
    );
  }

  function dibujarEspacio(espacio: number) {
    const ficha = lugares[espacio] ?? null;
    const correcta = fichaCorrecta(actividad, ficha, espacio);
    return (
      <LugarElemento
        enLinea
        estado={comprobada ? (correcta ? "correcto" : "incorrecto") : "normal"}
        esperada={comprobada && !correcta ? fichas[solucion[espacio] ?? -1] : undefined}
        resaltado={arrastre.destino === espacio}
        etiqueta={`Espacio ${espacio + 1}, vacío`}
        {...(comprobada ? {} : arrastre.propsDestino(espacio))}
      >
        {ficha === null ? undefined : dibujar(ficha, espacio)}
      </LugarElemento>
    );
  }

  return (
    <div ref={raiz} className={comun.actividad} {...arrastre.propsRaiz}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna ?? CONSIGNA_POR_DEFECTO.bancoPalabras}
      </h2>
      <Superficie className={comun.panel}>
        <div className={estilos.texto}>
          {trozos.map((trozo, i) => (
            <Fragment key={i}>
              {trozo}
              {i < espacios.length && dibujarEspacio(i)}
            </Fragment>
          ))}
        </div>
      </Superficie>
      <ZonaElementos
        etiqueta="Banco de fichas"
        resaltada={arrastre.destino === SIN_COLOCAR}
        {...(comprobada ? {} : arrastre.propsDestino(SIN_COLOCAR))}
      >
        {orden.filter((ficha) => !lugares.includes(ficha)).map((ficha) => dibujar(ficha, null))}
      </ZonaElementos>
      <p className="oculto" aria-live="polite">
        {anuncio}
      </p>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          detalle={acerto ? undefined : textoConFichas(actividad, solucion)}
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
