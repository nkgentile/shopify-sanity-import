import groq from "groq";
import {getDraftId} from "sanity";
import {v5 as uuidv5} from "uuid";

import {UUID_NAMESPACE_PRODUCT_VARIANT} from "./constants.js";

export async function hasDrafts(client, documents) {
  const draftIds = documents.map((document) => getDraftId(document._id));
  const drafts = await client.fetch(groq`*[_id in $draftIds]._id`, {draftIds});

  const data = documents.reduce((acc, current) => {
    acc[current._id] = drafts.includes(getDraftId(current._id));
    return acc;
  }, {});

  return data;
}

export async function hasDraft(client, document, signal) {
  const draftId = getDraftId(document._id);
  const draft = await client.getDocument(draftId, {signal});

  return draft !== undefined;
}

export async function createProductVariantDocument(_client, transaction, document, draftExists) {
  const publishedId = document._id;

  // Create document if it doesn't exist, otherwise patch with existing content
  transaction.createIfNotExists(document).patch(publishedId, (patch) => patch.set(document));

  if (draftExists) {
    const draftId = getDraftId(document._id);
    const documentDraft = Object.assign({}, document, {
      _id: draftId,
    });

    transaction.patch(draftId, (patch) => patch.set(documentDraft));
  }
}

export async function createProductDocument(_client, transaction, document, draftExists) {
  const publishedId = document._id;

  // Create new product if none found
  transaction.createIfNotExists(document).patch(publishedId, (patch) => {
    return patch.set({store: document.store});
  });

  // Patch existing draft (if present)
  if (draftExists) {
    const draftId = getDraftId(document._id);
    transaction.patch(draftId, (patch) => {
      return patch.set({store: document.store});
    });
  }
}

export function createProductVariantReference(_client, transaction, document) {
  transaction.patch(getProductDocumentId(document.store.productId), (patch) => {
    return patch.append("store.variants", [
      {
        _key: uuidv5(document._id, UUID_NAMESPACE_PRODUCT_VARIANT),
        _ref: document._id,
        _type: "reference",
        _weak: true,
      },
    ]);
  });
}

export async function commitProductDocuments(client, productDocument, productVariantsDocuments) {
  const transaction = client.transaction();

  const drafts = await hasDrafts(client, [productDocument, ...productVariantsDocuments]);

  // Create product and merge options
  createProductDocument(client, transaction, productDocument, drafts[productDocument._id]);

  // Mark the non existing product variants as deleted
  await deleteProductVariants(client, transaction, productDocument, productVariantsDocuments);

  // Create / update product variants
  for (const productVariantsDocument of productVariantsDocuments) {
    createProductVariantDocument(
      client,
      transaction,
      productVariantsDocument,
      drafts[productVariantsDocument._id],
    );
  }

  await transaction.commit();
}

export async function createCollectionDocument(
  _client,
  transaction,
  collectionDocument,
  draftExists,
) {
  transaction
    .createIfNotExists(collectionDocument)
    .patch(collectionDocument._id, (patch) => patch.set(collectionDocument));

  const draftId = getDraftId(collectionDocument._id);
  if (draftExists) {
    const documentDraft = Object.assign({}, collectionDocument, {
      _id: draftId,
    });

    transaction.patch(draftId, (patch) => patch.set(documentDraft));
  }
}

export async function commitCollectionDocument(client, collectionDocument) {
  const transaction = client.transaction();

  const drafts = await hasDrafts(client, [collectionDocument]);

  // Create product and merge options
  await createCollectionDocument(
    client,
    transaction,
    collectionDocument,
    drafts[collectionDocument._id],
  );

  await transaction.commit();
}

export function getProductDocumentId(id) {
  return `shopifyProduct-${id}`;
}

export function getProductVariantDocumentId(id) {
  return `shopifyProductVariant-${id}`;
}

export function getCollectionDocumentId(id) {
  return `shopifyCollection-${id}`;
}

async function deleteProductVariants(
  client,
  transaction,
  productDocument,
  productVariantsDocuments,
) {
  const productVariantIds = productVariantsDocuments.map(({_id}) => _id);
  const deletedProductVariantIds = await client.fetch(
    groq`*[
      _type == "productVariant"
      && store.productId == $productId
      && !(_id in $productVariantIds)
    ]._id`,
    {
      productId: productDocument.store.id,
      productVariantIds,
    },
  );

  deletedProductVariantIds.forEach((deletedProductVariantId) => {
    transaction.patch(deletedProductVariantId, (patch) => patch.set({"store.isDeleted": true}));
  });
}
