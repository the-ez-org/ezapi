// Third Party Libraries Imports
import { Pool } from "https://deno.land/x/postgres@v0.11.3/mod.ts";
import { connect, Redis } from "https://deno.land/x/redis@v0.22.2/mod.ts";

import { create } from "./queries/create.ts";
import { update } from "./queries/update.ts";
import { deleteQuery } from "./queries/delete.ts";

import { RunServerPropsType } from "./types.ts";
import { routeExtract } from "./utils/route_extract.ts";
import { parseRequestBody } from "./utils/parse_request_body.ts";
import { queryRespond } from "./utils/query_respond.ts";
import { sendResponse } from "./utils/send_response.ts";
import { read } from "./queries/read.ts";

export const run = async (props: RunServerPropsType) => {
  // Connect to Postgres
  const { connectionParams, maxsize, lazy } = props.connections.postgres;
  const pool = new Pool(connectionParams, maxsize, lazy);
  const client = await pool.connect();

  // Connect to Redis
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
            try {
              const reqBody = await parseRequestBody({ request });

              if (!reqBody) {
                // Respond with Bad Request Error when there is no Request Body
                sendResponse({
                  request,
                  error: {
                    status: 400,
                    message: "The Request is missing Body",
                  },
                });
                break;
              } else {
                switch (extract.operation) {
                  case "create": {
                    await queryRespond({
                      queryFn: create,
                      client,
                      reqBody,
                      request,
                      ...extract,
                    });
                    break;
                  }
                  case "read": {
                    // Check if there is a Redis connection and it's a Cached Request.
                    if (redis && reqBody.cache) {
                      const redisRes = await redis.get(reqBody.cache.key);
                      // Respond if there is a response from Redis
                      if (redisRes) {
                        sendResponse({ request, data: redis.toString() });
                      } else {
                        // Else get data from Postgres
                        const postgresResponse = await read({
                          reqBody,
                          request,
                          client,
                          table: extract.table,
                        });
                        sendResponse({ request, data: postgresResponse });
                        // Set the cache
                        await redis.executor.exec(
                          "SET",
                          reqBody.cache.key,
                          `${postgresResponse}`,
                          "EX",
                          reqBody.cache.expiration,
                        );
                      }
                    } else {
                      await queryRespond({
                        queryFn: read,
                        client,
                        reqBody,
                        request,
                        ...extract,
                      });
                    }
                    break;
                  }
                  case "update": {
                    await queryRespond({
                      queryFn: update,
                      client,
                      reqBody,
                      request,
                      ...extract,
                    });
                    break;
                  }
                  case "delete": {
                    await queryRespond({
                      queryFn: deleteQuery,
                      client,
                      reqBody,
                      request,
                      ...extract,
                    });
                    break;
                  }
                }
              }
            } catch (_) {
              sendResponse({
                request,
                error: {
                  status: 400,
                  message: "Error while parsing request body",
                },
              });
            }
          } else {
            // Respond with Method Not Allowed Error when the Operation is not allowed on the Table
            sendResponse({
              request,
              error: {
                status: 405,
                message:
                  `${extract.operation} Operation is not allowed on ${extract.table} Table`,
              },
            });
          }
        } else {
          // Respond with Not Found Error when the Table is not specified in the Config
          sendResponse({
            request,
            error: {
              status: 404,
              message: `${extract.table} Table not specified in the Config`,
            },
          });
        }
      } else {
        // Respond with Bad Request Error when Table and Operation are missing or invalid
        sendResponse({
          request,
          error: {
            status: 400,
            message: "Invalid Query: Table/Operation is missing or invalid",
          },
        });
      }
    } else {
      // Respond with Method Not Allowed Error when a non POST Request is made
      sendResponse({
        request,
        error: {
          status: 405,
          message:
            `EzAPI accepts only POST Request. ${request.method} Request was made.`,
        },
      });
    }
  }
};
