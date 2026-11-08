import { ImagePlus } from "lucide-react";
import { useRef } from "react";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { useSubidas } from "../../contextos/ContextoSubidas.ts";
import {
  LIMITES_ACTIVIDADES,
  LIMITES_IMAGENES,
  MARCA_IMAGEN,
  MENSAJES_IMAGENES,
} from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorTeoria } from "./editorTeoria.ts";
import { ajustarImagenes, contarMarcasImagen } from "./grupos.ts";

// Formulario de la teoría (spec F05, "Formulario de cada tipo"). Desde F13, "Agregar imagen"
// escribe [imagen] donde está el cursor y aparece un grupo "Imagen {n}" por marca.
export default function FormularioTeoria({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorTeoria>) {
  const { puntosClave, imagenes } = borrador;
  const { subir } = useSubidas();
  const area = useRef<HTMLTextAreaElement>(null);
  const marcas = contarMarcasImagen(borrador.texto);
  const sobran = imagenes.length > marcas;

  function cambiar(cambios: Partial<BorradorTeoria>) {
    alCambiar({ ...borrador, ...cambios });
  }

  function cambiarTexto(texto: string) {
    cambiar({ texto, imagenes: ajustarImagenes(texto, imagenes) });
  }

  // Escribe la marca donde está el cursor y lo deja justo después, como "Agregar espacio".
  function agregarImagen() {
    const campo = area.current;
    const texto = borrador.texto;
    const inicio = campo?.selectionStart ?? texto.length;
    const fin = campo?.selectionEnd ?? texto.length;
    const nuevo = texto.slice(0, inicio) + MARCA_IMAGEN + texto.slice(fin);
    if (Array.from(nuevo).length > LIMITES_ACTIVIDADES.textoMax) return;
    cambiarTexto(nuevo);
    const cursor = inicio + MARCA_IMAGEN.length;
    requestAnimationFrame(() => {
      campo?.focus();
      campo?.setSelectionRange(cursor, cursor);
    });
  }

  function cambiarPunto(id: string, texto: string) {
    cambiar({
      puntosClave: puntosClave.map((punto) => (punto.id === id ? { ...punto, texto } : punto)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoTexto
        id={`${idBase}-titulo`}
        etiqueta="Título"
        valor={borrador.titulo}
        alCambiar={(titulo) => cambiar({ titulo })}
        maxLongitud={LIMITES_ACTIVIDADES.tituloMax}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        ref={area}
        id={`${idBase}-texto`}
        etiqueta="Texto"
        ayuda="Separa los párrafos con un renglón en blanco. Cada [imagen] es el lugar de una imagen."
        valor={borrador.texto}
        alCambiar={cambiarTexto}
        error={errores.texto}
        maxLongitud={LIMITES_ACTIVIDADES.textoMax}
        filas={6}
        deshabilitado={deshabilitado}
      />
      <div>
        <Boton
          variante="secundario"
          tamano="chico"
          icono={ImagePlus}
          deshabilitado={deshabilitado || marcas >= LIMITES_IMAGENES.imagenesTeoriaMax}
          alPulsar={agregarImagen}
        >
          Agregar imagen
        </Boton>
      </div>
      {sobran && <Aviso tono="calido" texto={MENSAJES_IMAGENES.imagenesDeMas} />}
      {imagenes.map((grupo, indice) => (
        <div key={grupo.id} className={estilos.grupo}>
          <CampoImagen
            id={`${idBase}-imagen-${grupo.id}`}
            etiqueta={`Imagen ${indice + 1}`}
            valor={grupo.valor}
            alCambiar={(valor) =>
              cambiar({
                imagenes: imagenes.map((otro) =>
                  otro.id === grupo.id ? { ...otro, valor } : otro,
                ),
              })
            }
            alElegirArchivo={subir}
            error={errores[`imagen-${grupo.id}`]}
            deshabilitado={deshabilitado}
          />
          {sobran && (
            <div>
              <Boton
                variante="fantasma"
                tamano="chico"
                deshabilitado={deshabilitado}
                alPulsar={() => cambiar({ imagenes: imagenes.filter(({ id }) => id !== grupo.id) })}
              >
                Quitar imagen
              </Boton>
            </div>
          )}
        </div>
      ))}
      <CampoArea
        id={`${idBase}-codigo`}
        etiqueta="Código"
        ayuda="Las líneas que empiezan con +, - o @@ se resaltan como un diff."
        valor={borrador.codigo}
        alCambiar={(codigo) => cambiar({ codigo })}
        maxLongitud={LIMITES_ACTIVIDADES.codigoMax}
        codigo
        deshabilitado={deshabilitado}
      />
      <div className={estilos.grupo}>
        <p className={estilos.etiqueta}>Puntos clave</p>
        <ListaEditable
          filas={puntosClave}
          dibujarFila={(punto, indice) => (
            <CampoTexto
              id={`${idBase}-punto-${punto.id}`}
              etiqueta={`Punto ${indice + 1}`}
              valor={punto.texto}
              alCambiar={(texto) => cambiarPunto(punto.id, texto)}
              maxLongitud={LIMITES_ACTIVIDADES.puntoClaveMax}
              deshabilitado={deshabilitado}
            />
          )}
          alAgregar={() => cambiar({ puntosClave: [...puntosClave, { id: idLocal(), texto: "" }] })}
          alQuitar={(id) =>
            cambiar({ puntosClave: puntosClave.filter((punto) => punto.id !== id) })
          }
          textoAgregar="Agregar punto"
          minimo={0}
          maximo={LIMITES_ACTIVIDADES.puntosClaveMax}
          deshabilitada={deshabilitado}
        />
      </div>
    </div>
  );
}
