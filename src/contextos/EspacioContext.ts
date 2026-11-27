import { createContext } from "react";
import type { ConfiguracionInstancia, OrganizacionPropia } from "../tipos/contrato.ts";

// Estado global de configuración de instancia y espacios (organizaciones / silos opcionales).
// Si el usuario no pertenece a ninguna organización, `organizaciones` está vacío y el selector
// de espacio simplemente no aparece en la interfaz.
export type ValorEspacio = {
  configuracion: ConfiguracionInstancia;
  organizaciones: OrganizacionPropia[];
  organizacionesDocente: OrganizacionPropia[];
  cargandoOrganizaciones: boolean;
  // slug de la organización activa en el catálogo, o null para la comunidad abierta
  espacioActivo: string | null;
  organizacionActiva: OrganizacionPropia | null;
  puedeModerar: boolean;
  seleccionarEspacio: (slug: string | null) => void;
  recargarOrganizaciones: () => Promise<void>;
};

export const EspacioContext = createContext<ValorEspacio | null>(null);
