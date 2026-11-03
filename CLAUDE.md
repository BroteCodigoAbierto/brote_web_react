# brote_web_react: instrucciones para el agente

Web de Brote: cursar y **crear/editar** cursos. **Las specs, la constitución y
las decisiones viven en `../brote_specs`**; este repo solo implementa lo que
ahí está especificado.

Antes de cambiar algo, lee:

1. `../brote_specs/.specify/memory/constitution.md`
2. `../brote_specs/docs/estilo-codigo.md`
3. `../brote_specs/docs/diseno.md` si tocas pantallas: tokens, componentes y
   patrones del sistema de diseño de vidrio. Es obligatorio seguirlo.
4. La spec y el plan de la feature: `../brote_specs/specs/features/F0X-.../`

## Stack

Vite · React 19 · TypeScript · React Router (modo datos, `createBrowserRouter`)
· CSS Modules.

## Estructura

```text
src/
  main.tsx            arranque
  rutas.tsx           mapa de rutas (coincide con specs/01-navegacion.md)
  config.ts           URL de la API (VITE_URL_API)
  estilos/            tokens.css (variables de diseño) y global.css
  paginas/            una carpeta por página: Pagina.tsx + Pagina.module.css
  componentes/        componentes reutilizables, misma convención
  actividades/        un componente por tipo de actividad, el registro tipo → componente
                      (registro.ts) y el reproductor de lecciones (F03)
  hooks/              usePeticion y hooks por recurso (useCursos, ...)
  servicios/          api.ts (pedir, ErrorHttp) y funciones por recurso
  contextos/          estado global: un contexto por área, con useReducer
  utilidades/         funciones de presentación sin estado (p. ej. la portada de un curso)
  tipos/contrato.ts   GENERADO desde brote_specs; no se edita a mano
```

## Reglas

- Los componentes no llaman `fetch`: usan funciones de `servicios/`, y las
  páginas las consumen con `usePeticion` o un hook propio.
- Sin TanStack Query, SWR, Redux, Zustand ni librerías de UI (decisiones
  0009 a 0011 de brote_specs). Una dependencia nueva va justificada en el plan.
- Nada de colores, sombras ni medidas sueltos: `var(--...)` de
  `estilos/tokens.css`, con los nombres de `docs/diseno.md`.
- Las pantallas se arman con los componentes del sistema de diseño:
  `Superficie` (vidrio), `Boton`, `CampoTexto`, `CampoContrasena`, `Buscador`,
  `Aviso`, `Insignia`, `EstadoVacio`, `ErrorCarga`, `IndicadorCarga`, `Marca`,
  `PortadaCurso`, `TarjetaCurso` y, para las lecciones (F03), `BarraProgreso`,
  `BarraRespuesta`, `OpcionRespuesta`, `BloqueCodigo`, `TarjetaVolteable`,
  `CampoEspacio`, `Dialogo` y `ResultadoLeccion`. Los iconos son de
  `lucide-react`.
- Agregar un tipo de actividad: su componente en `actividades/` y una línea
  en `actividades/registro.ts` (el tipo del registro obliga a tenerlo).
- Un componente o token nuevo se agrega primero a `docs/diseno.md` y también
  en el móvil, con el mismo nombre.
- Contenido de cursos (lo escriben usuarios) nunca con
  `dangerouslySetInnerHTML`.
- Toda página que carga datos muestra cargando, vacío y error.
- Ramas `feature/F0X-...` desde `dev`; commits `F0X: ...`. Sin push sin
  permiso.
- Antes de terminar: `npm run tipos` y `npm run lint`.
