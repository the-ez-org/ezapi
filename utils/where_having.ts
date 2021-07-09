import { WhereProps, WhereReturn } from "../types.ts";

export const where_having = (props: WhereProps): WhereReturn => {
  let query = props.query;
  let args = props.args;
  let param = props.param;

  let action = props.reqBody.where;

  if (props.name === "having") {
    action = props.reqBody.having;
  }

  if (action) {
    query += ` ${props.name.toUpperCase()} `;
    action.forEach((condition) => {
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

  return {
    query,
    param,
    args,
  };
};
