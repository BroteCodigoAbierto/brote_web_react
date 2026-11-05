import { useEffect, useRef, useState, type DragEvent } from "react";

// A esta distancia del borde de la ventana, la página se desplaza sola. Abajo es más ancha
// porque ahí está la barra fija de la actividad.
const BORDE_ARRIBA = 80;
const BORDE_ABAJO = 140;
const PASO_DESPLAZAR = 12;

// Primitivos, para comparar el origen y el destino con ===.
export type Clave = string | number;

type OpcionesArrastrarElemento<I extends Clave, D extends Clave> = {
  alSoltar: (item: I, destino: D) => void;
  alEmpezar?: () => void;
  // para que no se resalte lo que no es un destino de este elemento
  acepta?: (item: I, destino: D) => boolean;
};

// Arrastrar con el ratón en las actividades de relacionar (spec F11; brote_specs, research
// de F11, punto 2). Es la API del navegador, como useArrastrar, pero aquí el destino es un
// lugar concreto y no una posición en una lista. Cada instancia solo acepta lo que empezó
// ella: por eso lo que se arrastra en la vista previa no llega a la secuencia del editor.
export function useArrastrarElemento<I extends Clave, D extends Clave>({
  alSoltar,
  alEmpezar,
  acepta,
}: OpcionesArrastrarElemento<I, D>) {
  // `enCurso` es lo que se arrastra; `item`, lo que se ve. Van separados porque el aviso va
  // un cuadro después: si se atenúa en dragstart, la imagen que sigue al puntero sale atenuada.
  const enCurso = useRef<I | null>(null);
  const [item, setItem] = useState<I | null>(null);
  const [destino, setDestino] = useState<D | null>(null);

  useEffect(() => {
    if (item === null) return;
    function desplazarCercaDelBorde({ clientY }: globalThis.DragEvent) {
      if (clientY < BORDE_ARRIBA) window.scrollBy(0, -PASO_DESPLAZAR);
      else if (clientY > window.innerHeight - BORDE_ABAJO) window.scrollBy(0, PASO_DESPLAZAR);
    }
    document.addEventListener("dragover", desplazarCercaDelBorde);
    return () => document.removeEventListener("dragover", desplazarCercaDelBorde);
  }, [item]);

  function limpiar() {
    enCurso.current = null;
    setItem(null);
    setDestino(null);
  }

  function propsOrigen(valor: I) {
    return {
      draggable: true,
      onDragStart(evento: DragEvent) {
        evento.dataTransfer.effectAllowed = "move";
        enCurso.current = valor;
        requestAnimationFrame(() => {
          if (enCurso.current !== valor) return;
          setItem(valor);
          alEmpezar?.();
        });
      },
      onDragEnd: limpiar,
    };
  }

  function propsDestino(valor: D) {
    return {
      onDragOver(evento: DragEvent) {
        const actual = enCurso.current;
        if (actual === null || !(acepta?.(actual, valor) ?? true)) return;
        evento.preventDefault();
        evento.stopPropagation();
        setDestino(valor);
      },
      onDrop(evento: DragEvent) {
        const actual = enCurso.current;
        if (actual === null || !(acepta?.(actual, valor) ?? true)) return;
        evento.preventDefault();
        evento.stopPropagation();
        alSoltar(actual, valor);
        limpiar();
      },
    };
  }

  // En la raíz de la actividad: fuera de un destino, soltar no cambia nada, y sin aceptar el
  // arrastre algunos sistemas animan la imagen de regreso, sin respetar "reducir movimiento".
  const propsRaiz = {
    onDragOver(evento: DragEvent) {
      if (enCurso.current === null) return;
      evento.preventDefault();
      setDestino(null);
    },
    onDragLeave(evento: DragEvent<HTMLElement>) {
      if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setDestino(null);
    },
    onDrop(evento: DragEvent) {
      if (enCurso.current === null) return;
      evento.preventDefault();
      limpiar();
    },
  };

  return { arrastrando: item !== null, item, destino, propsOrigen, propsDestino, propsRaiz };
}
