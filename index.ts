import { RunServerPropsType } from "./types.ts";
import { routeExtract } from "./utils/route_extract.ts";

export const run = async (props: RunServerPropsType) => {
  for await (const request of props.server) {
    // Check for Request Method
    if (request.method === "POST") {
      // Extract Table and Operation
      const extract = routeExtract({ url: request.url });

      // Check if the URL contains the Table and an Operation
      if (
        extract.table && extract.table !== "" && extract.operation
      ) {
        // Find the table from config.
        const table = props.tables[extract.table];

        // Check if the Table exists in the Config
        if (table) {
          // Check if the Operation is allowed on the Table
          if (
            table.operations[extract.operation] &&
            table.operations[extract.operation].allowed
          ) {
            request.respond({ body: "Thank You" });
          } else {
            // Respond with Method Not Allowed Error when the Operation is not allowed on the Table
            request.respond({
              status: 405,
              body:
                `${extract.operation} Operation is not allowed on ${extract.table} Table`,
            });
          }
        } else {
          // Respond with Not Found Error when the Table is not specified in the Config
          request.respond({
            status: 404,
            body: `${extract.table} Table not specifed in the Config`,
          });
        }
      } else {
        // Respond with Bad Request Error when Table and Operation are missing or invalid
        request.respond({
          status: 400,
          body: "Invalid Query: Table/Operation is missing or invalid",
        });
      }
    } else {
      // Respond with Method Not Allowed Error when a non POST Request is made
      request.respond({
        status: 405,
        body:
          `EzAPI accepts only POST Request. ${request.method} Request was made.`,
      });
    }
  }
};
