import { createContext, use, useEffect, useState } from "react";
import { traerAudio } from "../servicios/audios.ts";
import type { Audio } from "../tipos/contrato.ts";

// Los audios de una lección (spec F14, "Cargar el audio al cursar"; brote_specs, research de
// F14, puntos 9 y 11): id → la URL de objeto de sus bytes, ya traídos. Una sola petición por
// audio; la que falla sale del almacén, y la pide otra vez el siguiente intento o el botón.
export type AlmacenAudios = {
  traer: (audio: Audio) => Promise<string>;
  // para un audio que no pudo sonar: el siguiente `traer` lo pide otra vez a la red
  olvidar: (id: string) => void;
  // al salir de la lección
  liberar: () => void;
};

export function crearAlmacenAudios(): AlmacenAudios {
  const pedidos = new Map<string, Promise<string>>();
  const urls = new Map<string, string>();
  // los que llegaron dañados: la caché del navegador guarda lo que llegó, así que se saltan
  const sinCache = new Set<string>();

  return {
    traer({ id }) {
      const pedido = pedidos.get(id);
      if (pedido) return pedido;
      const nuevo = traerAudio(id, { sinCache: sinCache.has(id) }).then((bytes) => {
        const url = URL.createObjectURL(bytes);
        urls.set(id, url);
        sinCache.delete(id);
        return url;
      });
      nuevo.catch(() => {
        if (pedidos.get(id) === nuevo) pedidos.delete(id);
      });
      pedidos.set(id, nuevo);
      return nuevo;
    },
    olvidar(id) {
      const url = urls.get(id);
      if (url) URL.revokeObjectURL(url);
      urls.delete(id);
      pedidos.delete(id);
      sinCache.add(id);
    },
    liberar() {
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
      pedidos.clear();
    },
  };
}

export const ContextoAudios = createContext<AlmacenAudios | null>(null);

// El del reproductor o la vista previa; sin proveedor (el campo de audio del editor), uno
// propio, que se libera al desmontarse.
export function useAudios(): AlmacenAudios {
  const delProveedor = use(ContextoAudios);
  const [propio] = useState(() => (delProveedor ? null : crearAlmacenAudios()));
  useEffect(() => () => propio?.liberar(), [propio]);
  return delProveedor ?? propio!;
}
