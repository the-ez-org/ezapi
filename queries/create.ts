import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";

import { QueryPropsType } from "../types.ts";

export const create = async (
  props: QueryPropsType,
): Promise<QueryArrayResult<undefined[]>> => {
  let query = `INSERT INTO ${props.table} (${
    props.reqBody.fields?.toString()
  }) VALUES `;

  let param = 0;

  props.reqBody.data?.forEach((row) => {
    query += "(";

    row.forEach((_) => {
      query += `$${++param},`;
    });
    query = query.slice(0, query.length - 1);

    query += "),";
  });

  // To remove the ending comma
  query = query.slice(0, query.length - 1);

  if (props.reqBody.returning) {
    query += ` RETURNING ${props.reqBody.returning.toString()}`;
  }

  // Add ending semi-colon;
  query += ";";

  const args: Array<string | number> = [];

  props.reqBody.data?.forEach((row) => args.push(...row));

  return await props.client.queryArray({ text: query, args });
};
