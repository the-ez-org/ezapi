import { sendResponse } from "./send_response.ts";
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
    sendResponse({ request, data: result });
  } catch (error) {
    sendResponse({ request, error: { message: error } });
  }
};
