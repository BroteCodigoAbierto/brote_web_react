import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import ElementoRespuesta from "../../componentes/ElementoRespuesta/ElementoRespuesta.tsx";
import type { EstadoOpcion } from "../../componentes/OpcionRespuesta/OpcionRespuesta.tsx";
import { useArrastrarElemento } from "../../hooks/useArrastrarElemento.ts";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useFocoElementos } from "../../hooks/useFocoElementos.ts";
import { CONSIGNA_POR_DEFECTO } from "../../tipos/contrato.ts";
import { nombreDeContenido } from "../../utilidades/actividades.ts";
import { esImagen } from "../../utilidades/imagenes.ts";
import {
  claveDe,
  detalleParejas,
  elementoDe,
  esParejaCorrecta,
  mezclarSinResolver,
  parejaDe,
  pulsarEnEmparejar,
  unirElementos,
  type ElementoPareja,
  type EstadoEmparejar,
  type Lado,
} from "../../utilidades/relacionar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./Emparejar.module.css";

// Emparejar (spec F11): dos columnas, y cada elemento de la izquierda se une con uno de la
// derecha, pulsando o arrastrando. Se acierta solo si todas las parejas son correctas. Desde
// F13, una columna puede ser de imágenes: mosaicos del ancho de la columna.
export default function Emparejar({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"emparejar">) {
  const { parejas } = actividad;
  const [ordenDerecha] = useState(() => mezclarSinResolver(parejas.length));
  const [estado, setEstado] = useState<EstadoEmparejar>({ parejas: [], seleccion: null });
  const [comprobada, setComprobada] = useState(false);
  const [anuncio, setAnuncio] = useState("");
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const { raiz, pedirFoco, enfocarComprobar } = useFocoElementos();
  const { parejas: formadas, seleccion } = estado;
  const completa = formadas.length === parejas.length;
  const acerto = comprobada && formadas.every(esParejaCorrecta);

  const arrastre = useArrastrarElemento<string, string>({
    alEmpezar: () => setEstado((antes) => ({ ...antes, seleccion: null })),
    acepta: (item, destino) => elementoDe(item).lado !== elementoDe(destino).lado,
    alSoltar: (item, destino) => {
      const uno = elementoDe(item);
      cambiar({ parejas: unirElementos(formadas, uno, elementoDe(destino)), seleccion: null }, uno);
    },
  });

  // "Imagen {n}": su lugar entre los mosaicos al empezar, primero la columna izquierda
  const lugaresDeImagen = new Map(
    [
      ...parejas.map((_, indice) => ({ lado: "izquierda" as const, indice })),
      ...ordenDerecha.map((indice) => ({ lado: "derecha" as const, indice })),
    ]
      .filter(({ lado, indice }) => {
        const contenido = parejas[indice]?.[lado];
        return contenido !== undefined && esImagen(contenido);
      })
      .map((elemento, i) => [claveDe(elemento), i + 1]),
  );

  function textoDe(elemento: ElementoPareja): string {
    const contenido = parejas[elemento.indice]?.[elemento.lado] ?? "";
    return nombreDeContenido(contenido, lugaresDeImagen.get(claveDe(elemento)) ?? 0);
  }

  function anuncioDe(nuevo: EstadoEmparejar, elemento: ElementoPareja): string {
    const nueva = nuevo.parejas.find((pareja) => !formadas.includes(pareja));
    if (nueva) {
      const izquierda = textoDe({ lado: "izquierda", indice: nueva.izquierda });
      const derecha = textoDe({ lado: "derecha", indice: nueva.derecha });
      return `Pareja ${nueva.numero}: ${izquierda} con ${derecha}`;
    }
    if (nuevo.parejas.length < formadas.length) return `${textoDe(elemento)} sin colocar`;
    if (nuevo.seleccion) return `${textoDe(nuevo.seleccion)}, seleccionado`;
    return `${textoDe(elemento)}, sin seleccionar`;
  }

  function cambiar(nuevo: EstadoEmparejar, elemento: ElementoPareja) {
    setEstado(nuevo);
    setAnuncio(anuncioDe(nuevo, elemento));
    alInteractuar();
  }

  function pulsar(elemento: ElementoPareja) {
    const nuevo = pulsarEnEmparejar(estado, elemento);
    cambiar(nuevo, elemento);
    const formoPareja = seleccion !== null && seleccion.lado !== elemento.lado;
    if (nuevo.parejas.length === parejas.length) pedirFoco(null);
    else if (formoPareja) pedirFoco(`[data-sin-pareja="${seleccion.lado}"]`);
    else pedirFoco(`[data-elemento="${claveDe(elemento)}"]`);
  }

  function estadoDe(elemento: ElementoPareja): EstadoOpcion {
    const pareja = parejaDe(formadas, elemento);
    if (comprobada) return pareja && esParejaCorrecta(pareja) ? "correcta" : "incorrecta";
    const elegido = seleccion?.lado === elemento.lado && seleccion.indice === elemento.indice;
    return elegido ? "seleccionada" : "normal";
  }

  function etiquetaDe(elemento: ElementoPareja): string {
    const pareja = parejaDe(formadas, elemento);
    const estadoElemento = estadoDe(elemento);
    return [
      textoDe(elemento),
      estadoElemento === "seleccionada" && "seleccionado",
      pareja && `pareja ${pareja.numero}`,
      estadoElemento === "correcta" && "correcto",
      estadoElemento === "incorrecta" && "incorrecto",
    ]
      .filter(Boolean)
      .join(", ");
  }

  function dibujar(lado: Lado, indice: number) {
    const elemento = { lado, indice };
    const clave = claveDe(elemento);
    const pareja = parejaDe(formadas, elemento);
    const contenido = parejas[indice]?.[lado] ?? "";
    return (
      <ElementoRespuesta
        key={clave}
        {...(esImagen(contenido)
          ? { imagen: contenido, forma: "mosaico" as const, llenar: true }
          : { texto: contenido })}
        estado={estadoDe(elemento)}
        marca={pareja?.numero}
        atenuada={arrastre.item === clave}
        resaltada={arrastre.destino === clave}
        deshabilitada={comprobada}
        etiqueta={etiquetaDe(elemento)}
        alPulsar={() => pulsar(elemento)}
        data-elemento={clave}
        data-sin-pareja={pareja ? undefined : lado}
        {...(comprobada ? {} : { ...arrastre.propsOrigen(clave), ...arrastre.propsDestino(clave) })}
      />
    );
  }

  return (
    <div ref={raiz} className={comun.actividad} {...arrastre.propsRaiz}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna ?? CONSIGNA_POR_DEFECTO.emparejar}
      </h2>
      <div className={estilos.columnas}>
        <div className={estilos.columna}>{parejas.map((_, i) => dibujar("izquierda", i))}</div>
        <div className={estilos.columna}>{ordenDerecha.map((i) => dibujar("derecha", i))}</div>
      </div>
      <p className="oculto" aria-live="polite">
        {anuncio}
      </p>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          {...(acerto ? {} : detalleParejas(actividad, formadas))}
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
