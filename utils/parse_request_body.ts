import { readAll } from "https://deno.land/std@0.100.0/io/util.ts";
import { ParseRequestBodyPropsType, RequestBodyType } from "../types.ts";

export const parseRequestBody = async (
  props: ParseRequestBodyPropsType,
): Promise<RequestBodyType | undefined> => {
  const uIntArray = await readAll(props.request.body);
  if (uIntArray.length === 0) {
    return;
  } else {
    return JSON.parse(new TextDecoder().decode(uIntArray));
  }
};
