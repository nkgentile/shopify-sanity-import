import graphql from "graphql-tag";

export const productVariantFieldsFragment = graphql`
  fragment productVariantFields on ProductVariant {
    id
    title
    sku
    image {
      url
    }
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
    price {
      amount
    }
  }
`;
