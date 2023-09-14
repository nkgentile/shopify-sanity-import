import graphql from "graphql-tag";

import {productVariantFieldsFragment} from "./productVariantFields.js";

const SHOPIFY_VARIANT_LIMIT = 100;

export const productFieldsFragment = graphql`
  fragment productFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    featuredImage {
      url
    }
    variants(first: ${SHOPIFY_VARIANT_LIMIT}) {
      nodes {
        ...productVariantFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
      }
      maxVariantPrice {
        amount
      }
    }
    options {
      id
      name
      values
    }

    createdAt
    # updated_at,
  }

  ${productVariantFieldsFragment}
`;
