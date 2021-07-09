import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";

import { QueryPropsType } from "../types.ts";
import { where_having } from "../utils/where_having.ts";

export const deleteQuery = async (
  props: QueryPropsType,
): Promise<QueryArrayResult<undefined[]>> => {
  let query = `DELETE FROM ${props.table}`;
  let args: Array<string | number> = [];
  let param = 0;

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
