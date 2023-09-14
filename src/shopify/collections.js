import graphql from "graphql-tag";

import {collectionFieldsFragment} from "./collectionFields.js";

export const collectionsQuery = graphql`
  query getCollections($first: Int) {
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
