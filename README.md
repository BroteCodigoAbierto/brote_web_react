# brote_web_react

Web de **Brote**, la plataforma open source de cursos interactivos creados por
la comunidad. Aquí se cursan lecciones y se crean y editan cursos.

Qué hace y por qué está en
[brote_specs](https://github.com/BroteCodigoAbierto/brote_specs). Consume la API
de [brote_backend_express](https://github.com/BroteCodigoAbierto/brote_backend_express).

## Entrega de Aplicaciones Web

- **Desplegada**: https://brote-web-react.vercel.app
- [Bitácora de IA](docs/bitacora-ia.md)
- [Diario de decisiones](docs/diario-decisiones.md)
- Los otros repos del proyecto:
  [brote_specs](https://github.com/BroteCodigoAbierto/brote_specs) (specs y
  decisiones),
  [brote_backend_express](https://github.com/BroteCodigoAbierto/brote_backend_express)
  (API) y [brote_mobile_expo](https://github.com/BroteCodigoAbierto/brote_mobile_expo)
  (móvil).

## Stack

Vite · React 19 · TypeScript · React Router · CSS Modules

## Arrancar en local

Con la API corriendo (ver brote_backend_express):

```bash
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

## Scripts

| Script            | Qué hace                        |
| ----------------- | ------------------------------- |
| `npm run dev`     | Servidor de desarrollo          |
| `npm run build`   | Revisa tipos y genera `dist/`   |
| `npm run preview` | Sirve el build                  |
| `npm run tipos`   | Revisa los tipos con TypeScript |
| `npm run lint`    | ESLint                          |
| `npm run formato` | Formatea con Prettier           |

## Contribuir

Ninguna feature se programa sin spec. El flujo está en
[brote_specs/docs/flujo-trabajo.md](https://github.com/BroteCodigoAbierto/brote_specs/blob/dev/docs/flujo-trabajo.md).
