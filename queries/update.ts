import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";

import { QueryPropsType } from "../types.ts";
import { where_having } from "../utils/where_having.ts";

export const update = async (
  props: QueryPropsType,
): Promise<QueryArrayResult<undefined[]>> => {
  let query = `UPDATE ${props.table} SET `;
  let args: Array<string | number> = [];
  let param = 0;

  if (props.reqBody.new) {
    for (const column in props.reqBody.new) {
      query += `${column} = $${++param},`;
      args.push(props.reqBody.new[column]);
    }
  }

  query = query.slice(0, query.length - 1);

  const whereReturn = where_having({
    name: "where",
    reqBody: props.reqBody,
    query,
    args,
    param,
  });
  query = whereReturn.query;
  param = whereReturn.param;
  args = whereReturn.args;

  if (props.reqBody.returning) {
    query += ` RETURNING ${props.reqBody.returning.toString()}`;
  }

  query += ";";

  return await props.client.queryArray({ text: query, args });
};
