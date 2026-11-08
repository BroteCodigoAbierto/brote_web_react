import { ETIQUETA_VOZ, type IdiomaCurso } from "../../tipos/contrato.ts";
import estilos from "./FraseEscuchar.module.css";

type PropsFraseEscuchar = {
  frase: string;
  idioma: IdiomaCurso;
  // hasta comprobar: la frase no se dibuja, tampoco para un lector de pantalla
  oculta: boolean;
};

// La frase de escuchar y repetir (docs/diseno.md, sección 4; spec F14). Marcada con el idioma
// del curso, para que el lector de pantalla la lea con su voz de ese idioma. Siempre como
// texto: lo escribió el autor.
export default function FraseEscuchar({ frase, idioma, oculta }: PropsFraseEscuchar) {
  if (oculta) return <p className={estilos.oculta}>El texto aparece al comprobar.</p>;
  return (
    <p className={estilos.frase} lang={ETIQUETA_VOZ[idioma]}>
      {frase}
    </p>
  );
}
