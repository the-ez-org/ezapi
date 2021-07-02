// Third Party Libraries Imports
import { connect, Redis } from "https://deno.land/x/redis@v0.22.2/mod.ts";

import { RunServerPropsType } from "./types.ts";
import { routeExtract } from "./utils/route_extract.ts";
import { parseRequestBody } from "./utils/parse_request_body.ts";

export const run = async (props: RunServerPropsType) => {
  // Connect Redis
  let redis: Redis | null = null;
  if (props.connections.redis) {
    redis = await connect(props.connections.redis);
  }

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
            // Parse Request Body
            const reqBody = await parseRequestBody({ request });

            if (!reqBody) {
              // Respond with Bad Request Error when there is no Request Body
              request.respond({
                status: 400,
                body: "The Request is missing Body",
              });
              break;
            } else {
              switch (extract.operation) {
                case "read":
                  // Check if there is a Redis connection and it's a Cached Request.
                  if (redis && reqBody.cache) {
                    const redisRes = await redis.get(reqBody.cache.key);
                    // Respond if there is a response from Redis
                    if (redisRes) {
                      request.respond({
                        headers: new Headers({
                          "Content-Type": "application/json",
                        }),
                        body: JSON.stringify({ data: redisRes.toString() }),
                      });
                      break;
                    }
                  }
              }
              break;
            }
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
