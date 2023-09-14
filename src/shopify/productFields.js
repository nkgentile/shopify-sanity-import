import graphql from "graphql-tag";

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
        title
        sku
        id
        product {
          id
        }
        unitPrice {
          amount
        }
        compareAtPrice {
          amount
        }
        selectedOptions {
          name
          value
        }
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
`;
