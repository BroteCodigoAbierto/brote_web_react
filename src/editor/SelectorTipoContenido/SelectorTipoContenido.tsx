import estilos from "../../actividades/formulario.module.css";

export type TipoContenido = "texto" | "imagen";

type PropsSelectorTipoContenido = {
  nombre: string; // el name de los radios, único en el formulario
  etiqueta: string; // "Columna izquierda", "Tipo de elementos"
  valor: TipoContenido;
  alCambiar: (valor: TipoContenido) => void;
  deshabilitado?: boolean;
};

// "Texto" o "Imagen" para una columna de emparejar o los elementos de clasificar y ordenar
// (spec F13), con el aspecto de "Tipo de opciones" de la opción múltiple.
export default function SelectorTipoContenido({
  nombre,
  etiqueta,
  valor,
  alCambiar,
  deshabilitado = false,
}: PropsSelectorTipoContenido) {
  return (
    <fieldset className={estilos.grupo}>
      <legend className={estilos.etiqueta}>{etiqueta}</legend>
      <div className={estilos.opciones}>
        {(["texto", "imagen"] as const).map((tipo) => (
          <label key={tipo} className={estilos.radio}>
            <input
              type="radio"
              name={nombre}
              checked={valor === tipo}
              onChange={() => alCambiar(tipo)}
              disabled={deshabilitado}
            />
            {tipo === "texto" ? "Texto" : "Imagen"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
