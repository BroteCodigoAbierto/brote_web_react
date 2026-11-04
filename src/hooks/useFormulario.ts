import { useRef, useState, type FormEvent } from "react";
import { leerErrorDeEnvio, type ErrorDeEnvio } from "../servicios/sesion.ts";

type OpcionesFormulario<C extends string> = {
  inicial: Record<C, string>;
  validar: (valores: Record<C, string>) => Partial<Record<C, string>>;
  // si lanza, el error se muestra en el formulario y lo capturado se conserva
  enviar: (valores: Record<C, string>) => Promise<void>;
  // para mostrar otro mensaje que el de "No se pudo conectar" (F05)
  leerError?: (error: unknown) => ErrorDeEnvio;
};

// Estado de un formulario según la spec F01: los errores de campo aparecen al
// enviar y se quitan al editar ese campo; mientras se envía no se puede enviar
// otra vez; si falla, nada de lo escrito se pierde.
export function useFormulario<C extends string>({
  inicial,
  validar,
  enviar,
  leerError = leerErrorDeEnvio,
}: OpcionesFormulario<C>) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState<Partial<Record<C, string>>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  // el estado tarda un render en verse; con la ref un doble Enter no pasa
  const enviandoAhora = useRef(false);

  function cambiar(campo: C, valor: string) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales;
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviandoAhora.current) return;

    const encontrados = validar(valores);
    setErrores(encontrados);
    setGeneral(null);
    if (Object.keys(encontrados).length > 0) return;

    enviandoAhora.current = true;
    setEnviando(true);
    try {
      await enviar(valores);
    } catch (error) {
      const leido = leerError(error);
      setErrores((leido.campos ?? {}) as Partial<Record<C, string>>);
      setGeneral(leido.general ?? null);
    } finally {
      enviandoAhora.current = false;
      setEnviando(false);
    }
  }

  return { valores, errores, general, enviando, cambiar, manejarEnvio };
}
