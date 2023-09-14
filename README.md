# Shopify Sanity Import

Imports Shopify products and collections into your Sanity project. You can run this script sucessively without data loss or issues, since the documents that are created in Sanity will use the relevant Shopify ID in their `_id` field.

> _NOTE: This script uses the [Shopify Storefront API](https://shopify.dev/docs/api/storefront) to read Shopify data from your store, so it will not serve as a 1:1 replacement for the [Sanity Connect Shopify](https://www.sanity.io/docs/sanity-connect-for-shopify) app._

## Instructions

1. Install package dependencies

```sh
npm i
```

2. Copy `.env.example` and rename as `.env`

3. Add required environment variables

```env
# Shopify
SHOPIFY_STOREFRONT_TOKEN=""
SHOPIFY_STORE_NAME=""

# Sanity
SANITY_PROJECT_ID=""
# Optional (defaults to `production`)
# SANITY_DATASET=""
# Optional (defaults to `2023-08-01`)
# SANITY_API_VERSION=""
# Token needs to have at least Editor access
SANITY_API_TOKEN=""
```

4. Run the script

```sh
npm start
```
