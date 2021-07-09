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
  new?: Record<string, string | number>;
  where?: Array<WhereType>;
}

interface WhereType {
  field: string;
  operator: string;
  input: string | number;
  // boolean condition like OR and AND
  nextCondition?: string;
}

interface ReadQueryProps {
  distinct?: boolean;
  join?: {
    table: string;
    cross?: boolean;
    // Default join is inner;
    outer?: {
      // left, right or full
      type: string;
    };
    natural?: boolean;
    on?: string;
    using?: Array<string>;
  };
  group?: Array<string>;
  having?: Array<WhereType>;
  order?: Array<{
    by: string;
    desc?: boolean;
    nulls?: string;
  }>;
  limit?: number;
  offset?: number;
}

export interface RequestBodyType
  extends CreateQueryProps, UpdateQueryProps, ReadQueryProps {
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

export interface SendResponsePropsType {
  request: ServerRequest;
  data?: unknown;
  error?: {
    status?: number;
    message: string;
  };
}

export interface WhereProps extends WhereReturn {
  reqBody: RequestBodyType;
  name: string;
}

export interface WhereReturn {
  query: string;
  param: number;
  args: Array<string | number>;
}
