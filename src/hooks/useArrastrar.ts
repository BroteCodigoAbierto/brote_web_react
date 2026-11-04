import { useState, type DragEvent } from "react";

type OpcionesArrastrar<T> = {
  // `destino` es el lugar de la lista antes del cual se suelta (0 a total)
  alSoltar: (item: T, destino: number) => void;
};

// Arrastrar y soltar con la API del navegador, sin paquetes (brote_specs, research
// de F05, punto 13): en pantallas angostas y con teclado se usan los botones.
export function useArrastrar<T>({ alSoltar }: OpcionesArrastrar<T>) {
  const [item, setItem] = useState<T | null>(null);
  const [destino, setDestino] = useState<number | null>(null);

  function limpiar() {
    setItem(null);
    setDestino(null);
  }

  function soltar(evento: DragEvent) {
    if (item === null || destino === null) return;
    evento.preventDefault();
    evento.stopPropagation();
    alSoltar(item, destino);
    limpiar();
  }

  function propsOrigen(valor: T) {
    return {
      draggable: true,
      onDragStart(evento: DragEvent) {
        evento.dataTransfer.effectAllowed = "move";
        setItem(valor);
      },
      onDragEnd: limpiar,
    };
  }

  // Un elemento de la lista: la mitad sobre la que está decide antes o después.
  function propsDestino(indice: number) {
    return {
      onDragOver(evento: DragEvent<HTMLElement>) {
        if (item === null) return;
        evento.preventDefault();
        evento.stopPropagation();
        const { top, height } = evento.currentTarget.getBoundingClientRect();
        setDestino(evento.clientY < top + height / 2 ? indice : indice + 1);
      },
      onDrop: soltar,
    };
  }

  // La lista entera: para soltar en una vacía o debajo del último elemento.
  function propsZona(total: number) {
    return {
      onDragOver(evento: DragEvent<HTMLElement>) {
        if (item === null) return;
        evento.preventDefault();
        setDestino(total);
      },
      onDrop: soltar,
    };
  }

  return { arrastrando: item !== null, destino, propsOrigen, propsDestino, propsZona };
}

export type Arrastre<T> = ReturnType<typeof useArrastrar<T>>;
