import { SendResponsePropsType } from "../types.ts";

export const sendResponse = (props: SendResponsePropsType) =>
  props.request.respond({
    headers: new Headers({ "Content-Type": "application/json" }),
    status: props.error?.status,
    body: JSON.stringify({ data: props.data, error: props.error }),
  });
