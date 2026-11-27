import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CLAVES, leerTexto, ponerTexto, quitarMarca } from "../constantes/almacenamiento.ts";
import { useSesion } from "../hooks/useSesion.ts";
import { traerConfiguracionInstancia } from "../servicios/configuracion.ts";
import { traerMisOrganizaciones } from "../servicios/organizaciones.ts";
import type { ConfiguracionInstancia, OrganizacionPropia } from "../tipos/contrato.ts";
import { EspacioContext } from "./EspacioContext.ts";

const CONFIG_DEFECTO: ConfiguracionInstancia = {
  modoInstancia: "comunidad",
  nombreInstancia: "Brote",
  slugOrganizacionFija: null,
};

type PropsEspacioProvider = { children: ReactNode };

export default function EspacioProvider({ children }: PropsEspacioProvider) {
  const { usuario } = useSesion();
  const [configuracion, setConfiguracion] = useState<ConfiguracionInstancia>(CONFIG_DEFECTO);
  const [organizaciones, setOrganizaciones] = useState<OrganizacionPropia[]>([]);
  const [cargandoOrganizaciones, setCargandoOrganizaciones] = useState(false);
  const [espacioGuardado, setEspacioGuardado] = useState<string | null>(() =>
    leerTexto(CLAVES.espacio),
  );

  useEffect(() => {
    let activo = true;
    traerConfiguracionInstancia()
      .then(({ configuracion: cfg }) => {
        if (activo) setConfiguracion(cfg);
      })
      .catch(() => {
        // usa valores por defecto si aún no responde
      });
    return () => {
      activo = false;
    };
  }, []);

  const recargarOrganizaciones = useCallback(async () => {
    if (!usuario) {
      setOrganizaciones([]);
      return;
    }
    setCargandoOrganizaciones(true);
    try {
      const { organizaciones: lista } = await traerMisOrganizaciones();
      setOrganizaciones(lista);
    } catch {
      // mantiene el estado actual si falla temporalmente
    } finally {
      setCargandoOrganizaciones(false);
    }
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    traerMisOrganizaciones()
      .then(({ organizaciones: lista }) => {
        if (activo) setOrganizaciones(lista);
      })
      .catch(() => {
        // mantiene el estado actual si falla temporalmente
      });
    return () => {
      activo = false;
    };
  }, [usuario]);

  const organizacionesUsuario = useMemo(
    () => (usuario ? organizaciones : []),
    [usuario, organizaciones],
  );

  const seleccionarEspacio = useCallback((slug: string | null) => {
    setEspacioGuardado(slug);
    if (slug) ponerTexto(CLAVES.espacio, slug);
    else quitarMarca(CLAVES.espacio);
  }, []);

  // Si la instancia está dedicada a una organización, se fija ese espacio.
  // Si el espacio guardado ya no existe entre las organizaciones del usuario, vuelve a comunidad.
  const espacioActivo = useMemo(() => {
    if (configuracion.modoInstancia === "organizacion" && configuracion.slugOrganizacionFija) {
      return configuracion.slugOrganizacionFija;
    }
    if (!espacioGuardado) return null;
    if (organizacionesUsuario.some((o) => o.slug === espacioGuardado)) return espacioGuardado;
    return null;
  }, [configuracion, espacioGuardado, organizacionesUsuario]);

  const organizacionActiva = useMemo(
    () => organizacionesUsuario.find((o) => o.slug === espacioActivo) ?? null,
    [organizacionesUsuario, espacioActivo],
  );

  const organizacionesDocente = useMemo(
    () => organizacionesUsuario.filter((o) => o.rol !== "alumno"),
    [organizacionesUsuario],
  );

  const puedeModerar = useMemo(
    () =>
      Boolean(usuario?.esAdministrador) ||
      organizacionesUsuario.some((o) => o.rol === "dueno" || o.rol === "admin"),
    [usuario, organizacionesUsuario],
  );

  const valor = useMemo(
    () => ({
      configuracion,
      organizaciones: organizacionesUsuario,
      organizacionesDocente,
      cargandoOrganizaciones,
      espacioActivo,
      organizacionActiva,
      puedeModerar,
      seleccionarEspacio,
      recargarOrganizaciones,
    }),
    [
      configuracion,
      organizacionesUsuario,
      organizacionesDocente,
      cargandoOrganizaciones,
      espacioActivo,
      organizacionActiva,
      puedeModerar,
      seleccionarEspacio,
      recargarOrganizaciones,
    ],
  );

  return <EspacioContext value={valor}>{children}</EspacioContext>;
}
