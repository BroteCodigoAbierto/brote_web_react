import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { CLAVES, leerMarca, ponerMarca, quitarMarca } from "../constantes/almacenamiento.ts";
import { ErrorHttp, alPerderSesion } from "../servicios/api.ts";
import * as servicio from "../servicios/sesion.ts";
import type { CuerpoCrearCuenta, CuerpoEntrar, Usuario } from "../tipos/contrato.ts";
import { descartarCopiaAjena } from "../utilidades/copiaEditor.ts";
import { SesionContext, type EstadoSesion } from "./SesionContext.ts";

type Accion =
  | { tipo: "iniciada"; usuario: Usuario }
  | { tipo: "terminada"; aviso: EstadoSesion["aviso"] }
  | { tipo: "perdida" }
  | { tipo: "cerrada" }
  | { tipo: "sinServidor" }
  | { tipo: "reintentar" };

const inicial: EstadoSesion = { estado: "cargando", usuario: null, aviso: null, motivo: null };

function reducir(actual: EstadoSesion, accion: Accion): EstadoSesion {
  switch (accion.tipo) {
    case "iniciada":
      return { estado: "conSesion", usuario: accion.usuario, aviso: null, motivo: null };
    case "terminada":
      return { estado: "sinSesion", usuario: null, aviso: accion.aviso, motivo: null };
    case "perdida":
      // un 401 solo significa "la sesión terminó" si había una; al arrancar
      // el 401 de /usuarios/yo lo resuelve arrancar()
      if (actual.estado !== "conSesion") return actual;
      return { estado: "sinSesion", usuario: null, aviso: "sesionTerminada", motivo: null };
    case "cerrada":
      return { estado: "sinSesion", usuario: null, aviso: null, motivo: "cerrada" };
    case "sinServidor":
      return { ...actual, estado: "sinServidor" };
    case "reintentar":
      return { ...actual, estado: "cargando" };
  }
}

function esFalloDeRed(error: unknown): boolean {
  return !(error instanceof ErrorHttp) || error.estado >= 500;
}

// Al abrir la web: primero termina un cierre de sesión que no llegó al
// servidor; luego pregunta quién es el usuario.
async function arrancar(): Promise<Accion> {
  if (leerMarca(CLAVES.cierrePendiente)) {
    try {
      await servicio.cerrarSesion();
      quitarMarca(CLAVES.cierrePendiente);
    } catch {
      return { tipo: "sinServidor" }; // sin cerrar no se puede dejar entrar
    }
  }
  try {
    const { usuario } = await servicio.traerYo();
    ponerMarca(CLAVES.sesionActiva);
    return { tipo: "iniciada", usuario };
  } catch (error) {
    if (esFalloDeRed(error)) return { tipo: "sinServidor" };
    // la cookie vence junto con la sesión: la marca dice si había una (se
    // quita en el efecto, no aquí, ver abajo)
    return { tipo: "terminada", aviso: leerMarca(CLAVES.sesionActiva) ? "sesionTerminada" : null };
  }
}

type PropsSesionProvider = { children: ReactNode };

export default function SesionProvider({ children }: PropsSesionProvider) {
  const [estado, despachar] = useReducer(reducir, inicial);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true; // StrictMode monta dos veces; la respuesta vieja se ignora
    arrancar().then((accion) => {
      if (!vigente) return;
      // la marca se quita solo con la respuesta vigente: si la quitara la
      // primera vuelta de StrictMode, la segunda ya no mostraría el aviso
      if (accion.tipo === "terminada") quitarMarca(CLAVES.sesionActiva);
      despachar(accion);
    });
    return () => {
      vigente = false;
    };
  }, [intento]);

  // La marca sesionActiva no se quita aquí: al arrancar, pedir() avisa de este
  // 401 antes de que arrancar() lea la marca para decidir si muestra el aviso.
  useEffect(() => {
    alPerderSesion(() => despachar({ tipo: "perdida" }));
    return () => alPerderSesion(null);
  }, []);

  // lo no guardado en el editor solo lo recupera la cuenta que lo escribió (F05)
  const idUsuario = estado.usuario?.id;
  useEffect(() => {
    if (idUsuario) descartarCopiaAjena(idUsuario);
  }, [idUsuario]);

  const iniciar = useCallback((usuario: Usuario) => {
    ponerMarca(CLAVES.sesionActiva);
    despachar({ tipo: "iniciada", usuario });
  }, []);

  // los errores se relanzan para que el formulario los muestre
  const crearCuenta = useCallback(
    async (cuerpo: CuerpoCrearCuenta) => iniciar((await servicio.crearCuenta(cuerpo)).usuario),
    [iniciar],
  );

  const entrar = useCallback(
    async (cuerpo: CuerpoEntrar) => iniciar((await servicio.entrar(cuerpo)).usuario),
    [iniciar],
  );

  // El dispositivo queda sin sesión aunque el servidor no responda: el cierre
  // se reintenta al volver a abrir la web.
  const cerrarSesion = useCallback(() => {
    quitarMarca(CLAVES.sesionActiva);
    despachar({ tipo: "cerrada" });
    servicio.cerrarSesion().catch((error: unknown) => {
      if (esFalloDeRed(error)) ponerMarca(CLAVES.cierrePendiente);
    });
  }, []);

  const reintentar = useCallback(() => {
    despachar({ tipo: "reintentar" });
    setIntento((n) => n + 1);
  }, []);

  const valor = useMemo(
    () => ({ ...estado, crearCuenta, entrar, cerrarSesion, reintentar }),
    [estado, crearCuenta, entrar, cerrarSesion, reintentar],
  );

  return <SesionContext value={valor}>{children}</SesionContext>;
}
