// deno.d.ts

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
  }

  export type Handler = (request: Request) => Response | Promise<Response>;

  export function serve(handler: Handler): void;
  export function serve(options: ServeInit): void;
} 