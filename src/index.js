import "dotenv/config";

// import {setMaxListeners} from "node:events";
import {pipeline} from "node:stream/promises";

import PQueue from "p-queue";

import {
  createProductDocument,
  createProductVariantDocument,
  createProductVariantReference,
  hasDraft,
  sanity,
  transformProductDocument,
  transformProductVariantDocument,
} from "./sanity/index.js";
import {createConnectionPaginator, productsQuery} from "./shopify/index.js";

const sanityQueue = new PQueue({
  /** @see https://www.sanity.io/docs/technical-limits#50838b4c19db */
  interval: 1000,
  intervalCap: 25,
});

const abortController = new AbortController();
// Increase global max listeners for event emitters
// setMaxListeners(25);

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

console.log('Importing...')

let productCount = 0
let variantCount = 0
let collectionCount = 0

await pipeline(
  createConnectionPaginator({
    label: "Fetching product page",
    query: productsQuery,
    getConnection(response) {
      return response.products;
    },
  }),
  catchErrors,
  async function (source, {signal}) {
    for await (const products of source) {
      for (const product of products) {
        await sanityQueue.add(
          async () => {
            const transaction = sanity.transaction();

            const document = transformProductDocument(product);
            const draftExists = await hasDraft(sanity, document, signal);
            createProductDocument(sanity, transaction, document, draftExists);

            await transaction.commit({visibility: "deferred", signal});

            productCount++;
          },
          {signal},
        );

        if (Array.isArray(product.variants?.nodes)) {
          for (const variant of product.variants.nodes) {
            await sanityQueue.add(
              async () => {
                const transaction = sanity.transaction();

                const document = transformProductVariantDocument(variant);
                const draftExists = await hasDraft(sanity, document, signal);
                createProductVariantDocument(sanity, transaction, document, draftExists);
                createProductVariantReference(sanity, transaction, document);

                await transaction.commit({visibility: "deferred", signal});

                variantCount++;
              },
              {signal},
            );
          }
        }
      }
    }

    await sanityQueue.onIdle();
  },
  {signal: abortController.signal},
);

console.log("Finished!");
console.log(`Successfully imported ${productCount} product${productCount === 1 ? '' : 's'}, ${variantCount} variant${variantCount === 1 ? '' : 's'}, and ${collectionCount} collection${collectionCount === 1 ? '' : 's'}`)
