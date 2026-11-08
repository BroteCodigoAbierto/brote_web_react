import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import ElementoRespuesta from "../../componentes/ElementoRespuesta/ElementoRespuesta.tsx";
import type { EstadoOpcion } from "../../componentes/OpcionRespuesta/OpcionRespuesta.tsx";
import ZonaElementos from "../../componentes/ZonaElementos/ZonaElementos.tsx";
import { useArrastrarElemento } from "../../hooks/useArrastrarElemento.ts";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useFocoElementos } from "../../hooks/useFocoElementos.ts";
import { CONSIGNA_POR_DEFECTO } from "../../tipos/contrato.ts";
import { mezclar, nombreDeContenido } from "../../utilidades/actividades.ts";
import {
  detalleClasificar,
  pulsarCategoria,
  pulsarElementoClasificar,
  SIN_COLOCAR,
  soltarEnClasificar,
  type EstadoClasificar,
} from "../../utilidades/relacionar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./Clasificar.module.css";

// Clasificar (spec F11): cada elemento va en una categoría, pulsando o arrastrando. Se acierta
// solo si todos están en la suya.
export default function Clasificar({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"clasificar">) {
  const { categorias, elementos } = actividad;
  const [orden] = useState(() => mezclar(elementos.map((_, indice) => indice)));
  const [estado, setEstado] = useState<EstadoClasificar>({
    categoriaDe: elementos.map(() => null),
    seleccion: null,
  });
  const [comprobada, setComprobada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const { raiz, pedirFoco, enfocarComprobar } = useFocoElementos();
  const { categoriaDe, seleccion } = estado;
  const completa = categoriaDe.every((categoria) => categoria !== null);
  const acerto = elementos.every(({ categoria }, indice) => categoriaDe[indice] === categoria);

  const arrastre = useArrastrarElemento<number, number | typeof SIN_COLOCAR>({
    alEmpezar: () => setEstado((antes) => ({ ...antes, seleccion: null })),
    alSoltar: (item, destino) =>
      cambiar({ categoriaDe: soltarEnClasificar(categoriaDe, item, destino), seleccion: null }),
  });

  // F13: los elementos son todos textos o todos imágenes; "Imagen {n}" por su lugar al empezar
  const conImagenes = elementos.some((elemento) => "imagen" in elemento);

  function textoDe(indice: number): string {
    const elemento = elementos[indice];
    if (!elemento) return "";
    if ("texto" in elemento) return elemento.texto;
    return nombreDeContenido(elemento.imagen, orden.indexOf(indice) + 1);
  }

  function zona(indices: number[]) {
    const dibujados = indices.map(dibujar);
    return conImagenes ? <div className={estilos.mosaicos}>{dibujados}</div> : dibujados;
  }

  function movidoEn(nuevo: EstadoClasificar): number {
    return nuevo.categoriaDe.findIndex((categoria, i) => categoria !== categoriaDe[i]);
  }

  function anuncioDe(nuevo: EstadoClasificar): string {
    const movido = movidoEn(nuevo);
    if (movido === -1)
      return nuevo.seleccion === null ? "" : `${textoDe(nuevo.seleccion)}, seleccionado`;
    const categoria = nuevo.categoriaDe[movido] ?? null;
    if (categoria === null) return `${textoDe(movido)} sin colocar`;
    return `${textoDe(movido)} en ${categorias[categoria] ?? ""}`;
  }

  function cambiar(nuevo: EstadoClasificar) {
    setEstado(nuevo);
    setAnuncio(anuncioDe(nuevo));
    alInteractuar();
  }

  function enfocarTras(nuevo: EstadoClasificar) {
    const movido = movidoEn(nuevo);
    if (movido === -1) return;
    if (nuevo.categoriaDe[movido] === null) pedirFoco(`[data-elemento="${movido}"]`);
    else if (nuevo.categoriaDe.every((categoria) => categoria !== null)) pedirFoco(null);
    else pedirFoco("[data-sin-colocar]");
  }

  function pulsar(nuevo: EstadoClasificar) {
    cambiar(nuevo);
    enfocarTras(nuevo);
  }

  function estadoDe(indice: number): EstadoOpcion {
    if (comprobada) {
      return categoriaDe[indice] === elementos[indice]?.categoria ? "correcta" : "incorrecta";
    }
    return seleccion === indice ? "seleccionada" : "normal";
  }

  function etiquetaDe(indice: number): string {
    const categoria = categoriaDe[indice] ?? null;
    const estadoElemento = estadoDe(indice);
    return [
      textoDe(indice),
      estadoElemento === "seleccionada" && "seleccionado",
      categoria !== null && `en ${categorias[categoria] ?? ""}`,
      estadoElemento === "correcta" && "correcto",
      estadoElemento === "incorrecta" && "incorrecto",
    ]
      .filter(Boolean)
      .join(", ");
  }

  function dibujar(indice: number) {
    const elemento = elementos[indice];
    return (
      <ElementoRespuesta
        key={indice}
        {...(elemento && "imagen" in elemento
          ? { imagen: elemento.imagen, forma: "mosaico" as const }
          : { texto: textoDe(indice), forma: "compacta" as const })}
        estado={estadoDe(indice)}
        atenuada={arrastre.item === indice}
        deshabilitada={comprobada}
        etiqueta={etiquetaDe(indice)}
        alPulsar={() => pulsar(pulsarElementoClasificar(estado, indice))}
        data-elemento={indice}
        data-sin-colocar={categoriaDe[indice] === null ? "" : undefined}
        {...(comprobada ? {} : arrastre.propsOrigen(indice))}
      />
    );
  }

  return (
    <div ref={raiz} className={comun.actividad} {...arrastre.propsRaiz}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna ?? CONSIGNA_POR_DEFECTO.clasificar}
      </h2>
      <ZonaElementos
        etiqueta="Elementos sin colocar"
        resaltada={arrastre.destino === SIN_COLOCAR}
        {...(comprobada ? {} : arrastre.propsDestino(SIN_COLOCAR))}
      >
        {zona(orden.filter((indice) => categoriaDe[indice] === null))}
      </ZonaElementos>
      <div className={estilos.categorias}>
        {categorias.map((nombre, categoria) => (
          <ZonaElementos
            key={nombre}
            titulo={nombre}
            etiqueta={`Categoría ${nombre}`}
            resaltada={arrastre.destino === categoria}
            alPulsar={comprobada ? undefined : () => pulsar(pulsarCategoria(estado, categoria))}
            {...(comprobada ? {} : arrastre.propsDestino(categoria))}
          >
            {zona(orden.filter((indice) => categoriaDe[indice] === categoria))}
          </ZonaElementos>
        ))}
      </div>
      <p className="oculto" aria-live="polite">
        {anuncio}
      </p>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          {...(acerto ? {} : detalleClasificar(actividad, categoriaDe))}
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
