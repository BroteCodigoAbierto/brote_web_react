/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_API?: string;
  // F14, solo en desarrollo: idiomas sin voz, separados por comas (research de F14, punto 17)
  readonly VITE_SIN_VOCES?: string;
}
