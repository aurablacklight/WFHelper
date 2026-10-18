import type { Bridge } from "../../config/shared/ipcRoute.js";
import type { ApiRoutes, TradeApiRoutes } from "../../config/shared/ipcRoutes.js";

declare global {
  interface Window {
    api: Bridge<ApiRoutes> & { platform: string };
    tradeApi: Bridge<TradeApiRoutes>;
  }

  interface ImportMetaEnv {
    readonly MODE: string;
    readonly VITE_APP_VERSION?: string;
    readonly VITE_WFM_BACKEND_URL?: string;
    readonly VITE_WFM_BACKEND_DIRECT_FALLBACK?: "always" | "high" | "never";
    readonly VITE_WFM_BACKEND_BOOTSTRAP_ENABLED?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
