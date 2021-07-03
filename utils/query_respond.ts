import { QueryRespondPropsType } from "../types.ts";

export const queryRespond = async (props: QueryRespondPropsType) => {
  const { request, reqBody, client, table } = props;

  try {
    const result = await props.queryFn({
      request,
      reqBody,
      client,
      table,
    });
    request.respond({
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ data: result }),
    });
  } catch (error) {
    request.respond({
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ error }),
    });
  }
};
