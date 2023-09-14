import assert from "node:assert/strict";

import {client} from "./client.js";
export {client as shopify};
export {collectionsQuery} from "./collections.js";
export {productsQuery} from "./products.js";

/**
 * @param {*} args
 * @returns {AsyncGenerator}
 */
export function createConnectionPaginator(args = {pageSize: 5}) {
  const {pageSize = 100, label, query, getConnection} = args;

  return async function* ({signal}) {
    let cursor = null;
    let hasNextPage = false;
    do {
      if (label) {
        console.count(label);
      }

      const response = await client.request({
        document: query,
        variables: {
          first: pageSize,
          ...(cursor ? {after: cursor} : {}),
        },
        signal,
      });

      const connection = getConnection(response);
      assert(
        "pageInfo" in connection && "nodes" in connection && Array.isArray(connection.nodes),
        "Received invalid connection",
      );

      const {nodes, pageInfo} = connection;

      yield nodes;

      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;

      assert(
        !(cursor == null || hasNextPage == null),
        "Received invalid pagination information in response",
      );
    } while (hasNextPage);
  };
}
