import "dotenv/config";

import {pipeline} from "node:stream/promises";

import {createConnectionPaginator, productsQuery} from "./shopify/index.js";

const abortController = new AbortController();
const signal = abortController.signal;

async function* catchErrors(source) {
  try {
    for await (const chunk of source) {
      yield chunk;
    }
  } catch (error) {
    console.error(error);
    abortController.abort();
  }
}

await pipeline(
  createConnectionPaginator({
    label: "Fetching product page",
    query: productsQuery,
    getConnection(response) {
      return response.products;
    },
  }),
  catchErrors,
  async function* (source, {signal}) {
    for await (const page of source) {
      console.log(page);
    }
    yield;
  },
  {signal},
);
