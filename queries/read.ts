import { QueryArrayResult } from "https://deno.land/x/postgres@v0.11.3/query/query.ts";

import { QueryPropsType } from "../types.ts";
import { where_having } from "../utils/where_having.ts";

export const read = async (
  props: QueryPropsType,
): Promise<QueryArrayResult<undefined[]>> => {
  let query = `SELECT ${props.reqBody.distinct ? "DISTINCT" : ""} ${
    props.reqBody.fields?.toString()
  } FROM ${props.table}`;
  let args: Array<string | number> = [];
  let param = 0;

  if (props.reqBody.join) {
    const innerOrOuter = `${
      !props.reqBody.join.outer
        ? "INNER JOIN"
        : `${props.reqBody.join.outer.type.toUpperCase()} OUTER JOIN`
    }`;

    if (props.reqBody.join.cross) {
      query += ` CROSS JOIN ${props.reqBody.join.table}`;
    } else if (props.reqBody.join.natural) {
      query += ` NATURAL ${innerOrOuter} ${props.reqBody.join.table}`;
    } else if (props.reqBody.join.on) {
      query += ` ${innerOrOuter} ON ${props.reqBody.join.on}`;
    } else if (props.reqBody.join.using) {
      query +=
        ` ${innerOrOuter} USING (${props.reqBody.join.using.toString()})`;
    }
  }

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

  if (props.reqBody.group) {
    query += ` GROUP BY ${props.reqBody.group.toString()}`;
  }

  const havingReturn = where_having({
    name: "having",
    reqBody: props.reqBody,
    query,
    args,
    param,
  });
  query = havingReturn.query;
  param = havingReturn.param;
  args = havingReturn.args;

  if (props.reqBody.order) {
    query += ` ORDER BY `;
    props.reqBody.order.forEach((orderExp) => {
      query += `${orderExp.by} ${orderExp.desc ? "DESC" : ""} ${
        orderExp.nulls ? `NULLS ${orderExp.nulls.toUpperCase()}` : ""
      },`;
    });
    query.slice(0, query.length - 1);
  }

  query += ` ${props.reqBody.limit ? `LIMIT ${props.reqBody.limit}` : ""} ${
    props.reqBody.offset ? `OFFSET ${props.reqBody.offset}` : ";"
  }`;

  return await props.client.queryArray({ text: query, args });
};
