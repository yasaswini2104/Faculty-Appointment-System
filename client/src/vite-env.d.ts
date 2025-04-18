/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_MONGODB_URI: string;
    readonly VITE_JWT_SECRET: string;
    readonly VITE_API_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }