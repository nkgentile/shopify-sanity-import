import graphql from "graphql-tag";

import {productFieldsFragment} from "./productFields.js";

export const productsQuery = graphql`
  query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ...productFields
      }

      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }

  ${productFieldsFragment}
`;
