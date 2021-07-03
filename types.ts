import {
  Server,
  ServerRequest,
} from "https://deno.land/std@0.100.0/http/server.ts";

import { ConnectionParams } from "https://deno.land/x/postgres@v0.11.3/connection/connection_params.ts";
import { PoolClient } from "https://deno.land/x/postgres@v0.11.3/client.ts";
import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";
import { RedisConnectOptions } from "https://deno.land/x/redis@v0.22.2/mod.ts";

export interface RunServerPropsType {
  server: Server;
  connections: {
    postgres: {
      connectionParams: string | ConnectionParams | undefined;
      maxsize: number;
      lazy?: boolean;
    };
    redis?: RedisConnectOptions;
  };
  logging?: boolean;
  tables: Record<string, Table>;
}

interface CreateQueryProps {
  // create query props
  fields?: Array<string>;
  data?: Array<Array<number | string>>;
  returning?: Array<string>;
}

interface UpdateQueryProps {
  // update query props
  updateData?: Record<string, string | number>;
  where?: Array<WhereType>;
}

interface WhereType {
  field: string;
  operator: string;
  input: string | number;
  // boolean condition like OR and AND
  nextCondition?: string;
}

export interface RequestBodyType extends CreateQueryProps, UpdateQueryProps {
  cache?: {
    key: string;
    expiration: number;
  };
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

export interface ParseRequestBodyPropsType {
  request: ServerRequest;
}

export interface QueryPropsType {
  request: ServerRequest;
  reqBody: RequestBodyType;
  table: string;
  client: PoolClient;
}

export interface QueryRespondPropsType
  extends QueryPropsType, RouteExtractReturnType {
  queryFn: (props: QueryPropsType) => Promise<QueryArrayResult<undefined[]>>;
}
