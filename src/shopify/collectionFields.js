import graphql from "graphql-tag";

export const collectionFieldsFragment = graphql`
  fragment collectionFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    title
    image {
      url
    }
  }
`;
