import { Server } from "https://deno.land/std@0.100.0/http/server.ts";

export interface RunServerPropsType {
  server: Server;
  connections: {
    postgres: string;
    redis?: string;
  };
  logging?: boolean;
  tables: Record<string, Table>;
}

export interface Table {
  operations: Operations;
}

interface OperationsKeys {
  [key: string]: Operation;
}

export interface Operations extends OperationsKeys {
  create: Operation;
  read: Operation;
  update: Operation;
  delete: Operation;
}

export interface Operation {
  allowed?: boolean;
  onRequest?: () => void;
}

export interface RouteExtractPropsType {
  url: string;
}

export interface RouteExtractReturnType {
  table: string;
  operation: string;
}
