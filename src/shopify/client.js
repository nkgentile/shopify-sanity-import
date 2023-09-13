import assert from "node:assert/strict";

import {LATEST_API_VERSION} from "@shopify/shopify-api";
import {GraphQLClient} from "graphql-request";

const storeName = process.env.SHOPIFY_STORE_NAME;
assert(storeName, "Please provide a Shopify store name");

const accessToken = process.env.SHOPIFY_STOREFRONT_TOKEN;
assert(accessToken, "Please provide a Shopify Storefront API token");

export const client = new GraphQLClient(
  `https://${storeName}.myshopify.com/api/${LATEST_API_VERSION}/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token": accessToken,
    },
  },
);
