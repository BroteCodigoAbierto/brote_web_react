import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import type { Arrastre } from "../../hooks/useArrastrar.ts";
import { LIMITES_LECCION, MENSAJES_EDITOR, type TipoActividad } from "../../tipos/contrato.ts";
import type { ItemArrastre } from "../estadoLeccion.ts";
import { GRUPOS_PALETA, tipoDisponible } from "../paleta.ts";
import estilos from "./PaletaActividades.module.css";

type PropsPaletaActividades = {
  cantidadActividades: number;
  alAgregar: (tipo: TipoActividad) => void;
  // el arrastre empieza aquí y termina en la secuencia: la instancia es de la página
  arrastre: Arrastre<ItemArrastre>;
  deshabilitada: boolean;
};

// Los 13 tipos en sus cuatro grupos (spec F05; docs/diseno.md, sección 4, "Editor
// (solo web)"). Los que no tienen editor todavía se ven, pero no se pueden usar.
export default function PaletaActividades({
  cantidadActividades,
  alAgregar,
  arrastre,
  deshabilitada,
}: PropsPaletaActividades) {
  const llena = cantidadActividades >= LIMITES_LECCION.actividadesMax;
  const sinAgregar = deshabilitada || llena;

  return (
    <Superficie className={estilos.paleta}>
      {GRUPOS_PALETA.map(({ nombre, entradas }) => (
        <section key={nombre} className={estilos.grupo} aria-label={nombre}>
          <h2 className={estilos.nombre}>{nombre}</h2>
          <ul className={estilos.lista}>
            {entradas.map(({ tipo, etiqueta, icono: Icono }) => {
              if (!tipoDisponible(tipo)) {
                return (
                  <li key={tipo}>
                    <button type="button" className={estilos.tipo} disabled>
                      <Icono className={estilos.iconoInactivo} aria-hidden="true" />
                      <span>{etiqueta}</span>
                      <span className={estilos.insignia}>
                        <Insignia>Próximamente</Insignia>
                      </span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={tipo}>
                  <button
                    type="button"
                    className={estilos.tipo}
                    disabled={sinAgregar}
                    onClick={() => alAgregar(tipo)}
                    {...(sinAgregar ? {} : arrastre.propsOrigen({ origen: "paleta", tipo }))}
                  >
                    <Icono className={estilos.icono} aria-hidden="true" />
                    <span>{etiqueta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {llena && <p className={estilos.nota}>{MENSAJES_EDITOR.maxActividades}</p>}
    </Superficie>
  );
}
