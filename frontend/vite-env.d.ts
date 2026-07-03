/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BACKEND_URL: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css';

declare module '*.module.scss';

declare module '*.module.sass';

declare module '*.module.less';

declare module '*.module.styl';
