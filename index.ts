import { error, info } from "https://deno.land/std@0.100.0/log/mod.ts";

import { RunServerPropsType } from "./types.ts";
import { routeExtract } from "./utils/route_extract.ts";

export const run = async (props: RunServerPropsType) => {
  for await (const request of props.server) {
    const extract = routeExtract({ url: request.url });
    if (
      "table" in extract && extract.table !== "" && "operation" in extract &&
      extract.operation
    ) {
      info(extract);
      request.respond({ body: "Valid Query" });
    } else {
      error({ error: "Table/Operation is missing or invalid" });
      request.respond({
        status: 400,
        body: "Invalid Query: Table/Operation is missing or invalid",
      });
    }
  }
};
