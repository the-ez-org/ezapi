import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";

import { QueryPropsType } from "../types.ts";

export const deleteQuery = async (
  props: QueryPropsType,
): Promise<QueryArrayResult<undefined[]>> => {
  let query = `DELETE FROM ${props.table}`;
  const args: Array<string | number> = [];
  let param = 0;

  if (props.reqBody.where) {
    query += " WHERE ";
    props.reqBody.where.forEach((condition) => {
      query += `${condition.field} ${condition.operator} $${++param}`;
      if (condition.nextCondition) {
        query += ` ${condition.nextCondition} `;
      } else {
        query += ",";
      }
      args.push(condition.input);
    });
    query = query.slice(0, query.length - 1);
  }

  if (props.reqBody.returning) {
    query += ` RETURNING ${props.reqBody.returning.toString()}`;
  }

  query += ";";

  return await props.client.queryArray({ text: query, args });
};
