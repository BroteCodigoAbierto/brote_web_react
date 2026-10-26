import { createContext } from "react";
import type { CuerpoCrearCuenta, CuerpoEntrar, Usuario } from "../tipos/contrato.ts";

// Estado global de la sesión (decisión 0011). Lo llena SesionProvider y se lee
// con useSesion().

export type EstadoSesion = {
  // sinServidor: al abrir no se pudo saber si hay sesión porque la API no responde
  estado: "cargando" | "conSesion" | "sinSesion" | "sinServidor";
  usuario: Usuario | null;
  // aviso que "Entrar" muestra cuando la sesión venció
  aviso: "sesionTerminada" | null;
  // el usuario cerró sesión él mismo: después de entrar no se regresa a donde estaba
  motivo: "cerrada" | null;
};

export type ValorSesion = EstadoSesion & {
  crearCuenta: (cuerpo: CuerpoCrearCuenta) => Promise<void>;
  entrar: (cuerpo: CuerpoEntrar) => Promise<void>;
  cerrarSesion: () => void;
  reintentar: () => void;
};

export const SesionContext = createContext<ValorSesion | null>(null);
