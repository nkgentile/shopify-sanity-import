import graphql from "graphql-tag";

import {collectionFieldsFragment} from "./collectionFields.js";

export const productsQuery = graphql`
  query getProducts($first: Int) {
    collections(first: $first) {
      nodes {
        ...collectionFields
      }

      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }

  ${collectionFieldsFragment}
`;
