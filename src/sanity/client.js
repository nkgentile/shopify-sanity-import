import assert from "node:assert/strict";

import {createClient} from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
assert(projectId, "Please provide a Sanity project ID");

const dataset = process.env.SANITY_DATASET || "production";

const apiVersion = process.env.SANITY_API_VERSION || "2023-08-01";

const token = process.env.SANITY_API_TOKEN;
assert(token, "Please provide a Sanity API token");

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});
