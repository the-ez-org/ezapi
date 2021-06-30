import { Server } from "https://deno.land/std@0.100.0/http/server.ts";

export interface RunServerPropsType {
  server: Server;
}

export interface RouteExtractPropsType {
  url: string;
}

export interface RouteExtractReturnType {
  table: string;
  operation: string;
}
