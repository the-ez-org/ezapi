import { RouteExtractPropsType, RouteExtractReturnType } from "../types.ts";

export const routeExtract = (
  props: RouteExtractPropsType,
): RouteExtractReturnType => {
  const [table, operation] = props.url.replace(/^\/|\/$/g, "").split("/");
  return { table, operation };
};
