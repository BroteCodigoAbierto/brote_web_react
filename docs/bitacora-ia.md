# Bitácora de IA

Cómo usé la IA para construir Brote, qué le pedí, qué revisé y dónde se
equivocó. Las decisiones que salieron de esto están en
[diario-decisiones.md](diario-decisiones.md).

## Herramientas

| Herramienta | Para qué |
|---|---|
| **Claude Code** (Claude Opus 5.5) | Specs, planes, tareas e implementación con los comandos `/speckit-*`, en una sesión abierta en `brote_specs` con acceso a los otros tres repos |
| **GitHub Spec Kit** | El flujo de SDD: spec → plan → tareas → análisis → implementación |
| **Claude en Chrome** | Validar la web con clics, teclado y portapapeles reales |
| **Claude Desktop con computer use** | Validar el móvil en el iPhone por iPhone Mirroring (solo desde la Mac) |
| **Codex** | La feature de temas (rama `Codex-Temas`), que no entró a la entrega |

## Cómo trabajo con la IA

1. **Las reglas van primero.** La IA lee `CLAUDE.md` y la
   [constitución](https://github.com/BroteCodigoAbierto/brote_specs/blob/main/.specify/memory/constitution.md)
   antes de cada tarea. Ahí está lo que no se negocia: todo en español, la
   spec dice qué y no cómo, identificadores sin acentos, un commit por tarea.
2. **Spec antes de código.** `/speckit-specify` escribe la spec con el formato
   del curso y yo la reviso a mano antes del plan. Sin spec no se programa.
3. **Las decisiones son mías.** La IA me pregunta las decisiones de producto y
   de diseño una por una, con su recomendación primero, y yo elijo. Las
   técnicas quedan registradas en `docs/decisiones/`.
4. **Un commit por tarea** (`F03: ...`), para poder revisar cada cambio por
   separado y deshacer uno sin perder los demás.
5. **Terminado = validado a mano.** Cada criterio de aceptación se comprueba
   siguiendo el `quickstart.md` de la feature. La IA no marca los criterios de
   validación por su cuenta.
6. **Una sesión por cosa.** Una para hacer la feature y otra para validarla,
   para que quien valida no sea la misma conversación que escribió el código.
   `continuar.md` en `brote_specs` guarda el estado entre sesiones.

## Cronología

| Fecha | Qué se hizo |
|---|---|
| 2026-08-30 | Plan de proyecto con otro stack (Spring Boot y Vue) |
| 2026-10-14 | Con Claude Code: base del proyecto, Spec Kit, constitución y decisiones 0001 a 0014. Se cambió el stack (Express, React) |
| 2026-10-19 a 10-26 | F01, crear cuenta e iniciar sesión |
| 2026-10-26 a 11-02 | F02, explorar el catálogo |
| 2026-11-02 | Sistema de diseño de vidrio (0015); F03, cursar una lección |
| 2026-11-03 | F04, progreso; catálogo de actividades F11 a F15; F05, editor de cursos |
| 2026-11-04 | F06, enviar a revisión y publicar |
| 2026-11-04 a 11-08 | F11, actividades de relacionar; F12, código y terminal |
| 2026-11-07 a 11-09 | F13, imágenes propias (0016); F14, escuchar y repetir (0017) |
| 2026-11-22 | Entrega: F14 en `main`, esta bitácora y el diario de decisiones |

## Dónde se equivocó la IA y cómo me di cuenta

Todos estos casos están en los commits y en `continuar.md`.

- **Un criterio de aceptación imposible de probar (F12, V51).** La spec pedía
  que en la actividad "Ramas" la X saliera directo, sin haber escrito nada. Al
  validar vimos que no se podía: esa terminal va después de una teoría, y
  pasar de la primera actividad ya pide confirmación (regla de F03). La spec
  contradecía otra feature. Se movió la prueba a las lecciones 9 y 10 de
  "Actividades de prueba" y se corrigieron la spec, las tareas y el quickstart.
- **Código que el teléfono no ejecuta (F03, móvil).** La IA usó
  `Object.hasOwn`, que el motor de JavaScript del móvil (Hermes) no soporta, y
  supuso que Hermes separa los acentos al normalizar texto. Se cambió por una
  alternativa compatible y un respaldo (commits `2978137` y `38b9f86` de
  `brote_mobile_expo`).
- **Un plan que se saltaba la constitución (F11).** `/speckit-analyze` encontró
  16 problemas en los documentos de F11. El crítico: el plan decía cumplir el
  principio IV ("agregar un tipo de actividad no cambia otro código"), pero sí
  tocaba piezas compartidas, sin declararlo como excepción. Se corrigió antes
  de implementar.
- **Detalles de interfaz que solo se ven usándola.**
  - F13, web: en el visor de imágenes, pulsar lo oscuro a los lados no cerraba
    el visor, porque el `<img>` ocupaba todo el marco con `object-fit: contain`
    (commit `dbb4827`). Lo vi al validar en Chrome.
  - F12, móvil: la etiqueta del lenguaje de la "Solución de referencia" salía
    tapada por el código. Lo vi en el iPhone.
  - F04, móvil: a 375 px el título del curso se partía a media palabra
    ("Condicio / nales"). Elegí poner los aciertos en otra línea.

## Lo que le rechacé o le cambié a la IA

- **Pruebas automáticas.** Las descarté para el MVP (decisión 0012): valido a
  mano con un quickstart por feature, porque así comprobé cada criterio en la
  pantalla real.
- **Librerías que resolvían todo.** Al decidir el stack se compararon TanStack
  Query, Tailwind, Zustand, Next.js y servicios de autenticación externos. Me
  quedé con lo que trae React y con el patrón de `fetch` del Taller 10
  (decisiones 0007 a 0011).
- **La feature de temas** que hizo Codex: no la integré el día de la entrega
  porque no estaba validada.
- _Por completar con mis propios casos:_
  - _Una propuesta de la IA que rechacé y por qué._
  - _Una vez que me dio código que parecía bien y no funcionó._

## Límites que encontré

- La IA no puede probar el iPhone desde Linux (iPhone Mirroring es de macOS),
  así que los criterios del móvil de F13 y F14 siguen pendientes.
- F14 está implementada, pero su validación va en 0 de 82 criterios, y F13 en
  51 de 90.
- Si dos sesiones trabajan sobre las mismas carpetas, se cambian la rama una a
  la otra. Por eso trabajo con una sesión a la vez, o con `git worktree`.
