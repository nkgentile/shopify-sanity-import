import lodash from "lodash";
const {get} = lodash;

import {v5 as uuidv5} from "uuid";

import {UUID_NAMESPACE_COLLECTIONS} from "./constants.js";
import {
  getCollectionDocumentId,
  getProductDocumentId,
  getProductVariantDocumentId,
} from "./documents.js";

export function transformProductDocument(data) {
  const id = parseInt(data.id.replace("gid://shopify/Product/", ""), 10);

  const options =
    data.options.map((option) => ({
      _type: "option",
      _key: option.name,
      name: option.name,
      values: option.values?.map((value) => value) || [],
    })) || [];

  let status = "active";
  switch (data.status) {
    case "ACTIVE":
      status = "active";
      break;
    case "ARCHIVED":
      status = "archived";
      break;
    case "DRAFT":
      status = "draft";
      break;
    default:
      break;
  }

  return {
    _id: getProductDocumentId(id), // Shopify product ID
    _type: "product",
    store: {
      gid: `gid://shopify/Product/${id}`,
      descriptionHtml: data.descriptionHtml,
      vendor: data.vendor,
      priceRange: {
        minVariantPrice: parseFloat(data.compareAtPriceRange?.minVariantPrice?.amount || "0"),
        maxVariantPrice: parseFloat(data.compareAtPriceRange?.maxVariantPrice?.amount || "0"),
      },
      productType: data.productType,
      slug: {
        _type: "slug",
        current: data.handle,
      },
      status,
      tags: data.tags.join(", "),
      title: data.title,
      updatedAt: undefined,
      createdAt: data.createdAt,
      previewImageUrl: data.featuredImage?.url,
      id,
      isDeleted: false,
      variants: [],
      options,
    },
  };
}

export function transformProductVariantDocument(variant) {
  const id = parseInt(variant.id.replace("gid://shopify/ProductVariant/", ""), 10);
  const productId = parseInt(variant.product.id.replace("gid://shopify/Product/", ""), 10);

  let status = "active";
  switch (variant.product.status) {
    case "ACTIVE":
      status = "active";
      break;
    case "ARCHIVED":
      status = "archived";
      break;
    case "DRAFT":
      status = "draft";
      break;
    default:
      break;
  }

  return {
    _id: getProductVariantDocumentId(id), // Shopify variant ID
    _type: "productVariant",
    store: {
      id,
      gid: `gid://shopify/ProductVariant/${id}`,
      compareAtPrice: Number(variant.compareAtPrice),
      createdAt: variant.createdAt,
      isDeleted: false,
      option1: get(variant, "selectedOptions[0].value", ""),
      option2: get(variant, "selectedOptions[1].value", ""),
      option3: get(variant, "selectedOptions[2].value", ""),
      previewImageUrl: variant.image?.src,
      price: parseFloat(variant.price),
      productId,
      productGid: `gid://shopify/Product/${productId}`,
      sku: variant.sku,
      status,
      title: variant.title,
      inventory: {
        management: variant.inventoryManagement?.toUpperCase() || "",
        policy: variant.inventoryPolicy?.toUpperCase() || "",
        isAvailable: variant.inventoryQuantity > 0,
      },
    },
  };
}

export function transformCollection(collection) {
  const id = parseInt(collection.id.replace("gid://shopify/Collection/", ""), 10);
  // https://shopify.dev/api/admin-graphql/2021-10/enums/collectionsortorder#values
  const sortOrder = (collection.sortOrder?.toUpperCase() || "unknown").replace("-", "_");

  return {
    _id: getCollectionDocumentId(id),
    _type: "collection",
    store: {
      id,
      gid: `gid://shopify/Collection/${id}`,
      isDeleted: false,
      imageUrl: collection.image?.src,
      descriptionHtml: collection.descriptionHtml,
      rules: collection.ruleSet?.rules.map((rule) => ({
        _key: uuidv5(
          `shopify-collection-${collection.id}-${rule.column}-${rule.condition}-${rule.relation}`,
          UUID_NAMESPACE_COLLECTIONS,
        ),
        _type: "object",
        column: rule.column?.toUpperCase(),
        condition: rule.condition,
        relation: rule.relation?.toUpperCase(),
      })),
      disjunctive: collection.ruleSet?.appliedDisjunctively,
      slug: {
        _type: "slug",
        current: collection.handle,
      },
      sortOrder,
      title: collection.title,
      createdAt: new Date().toISOString(),
    },
  };
}
