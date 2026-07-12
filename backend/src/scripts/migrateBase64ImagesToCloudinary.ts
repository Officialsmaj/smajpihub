import { MongoClient } from "mongodb";
import env from "../environments";
import { isBase64Image, uploadImageToCloudinary } from "../services/imageStorage";

const dryRun = !process.argv.includes("--apply");
const dbName = env.mongo_db_name;
const buildLegacyMongoUri = () => {
  if (env.mongo_user && env.mongo_password) {
    return `mongodb://${encodeURIComponent(env.mongo_user)}:${encodeURIComponent(env.mongo_password)}@${env.mongo_host}/${dbName}?authSource=admin`;
  }
  return `mongodb://${env.mongo_host}/${dbName}`;
};

type FieldPlan = { path: string; purpose: string };
const plans: Record<string, FieldPlan[]> = {
  products: [
    { path: "image", purpose: "product" },
    { path: "images", purpose: "product" },
    { path: "variants.image", purpose: "product-variant" },
  ],
  users: [
    { path: "avatar", purpose: "avatar" },
    { path: "coverImage", purpose: "profile-banner" },
    { path: "profileImage", purpose: "profile" },
    { path: "bannerImage", purpose: "profile-banner" },
  ],
  onboarding_applications: [
    { path: "documents", purpose: "onboarding" },
    { path: "media", purpose: "onboarding" },
    { path: "images", purpose: "onboarding" },
  ],
};

const migrateValue = async (value: unknown, purpose: string, label: string): Promise<{ value: unknown; changed: boolean }> => {
  if (isBase64Image(value)) {
    if (dryRun) return { value, changed: true };
    const upload = await uploadImageToCloudinary(String(value), purpose, label);
    return { value: upload.url, changed: true };
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = [];
    for (let index = 0; index < value.length; index += 1) {
      const result = await migrateValue(value[index], purpose, `${label}-${index + 1}`);
      changed = changed || result.changed;
      next.push(result.value);
    }
    return { value: next, changed };
  }
  return { value, changed: false };
};

const migratePath = async (document: Record<string, any>, path: string, purpose: string) => {
  const parts = path.split(".");
  const parentPath = parts.slice(0, -1);
  const leaf = parts[parts.length - 1];
  const parents = parentPath.reduce<unknown[]>((items, part) => items.flatMap((item) => {
    const next = item && typeof item === "object" ? (item as Record<string, unknown>)[part] : undefined;
    return Array.isArray(next) ? next : [next];
  }), [document]).filter((item): item is Record<string, any> => Boolean(item) && typeof item === "object");
  let changed = false;

  for (const parent of parents.length ? parents : [document]) {
    if (!(leaf in parent)) continue;
    const result = await migrateValue(parent[leaf], purpose, path.replace(/\./g, "-"));
    changed = changed || result.changed;
    if (!dryRun && result.changed) parent[leaf] = result.value;
  }

  return changed;
};

const main = async () => {
  const client = await MongoClient.connect(env.mongodb_uri || buildLegacyMongoUri(), { serverSelectionTimeoutMS: 5000 });
  try {
    const db = client.db(dbName);
    for (const [collectionName, fieldPlans] of Object.entries(plans)) {
      const collection = db.collection(collectionName);
      const cursor = collection.find({});
      for await (const document of cursor) {
        let changed = false;
        for (const plan of fieldPlans) {
          try {
            changed = await migratePath(document, plan.path, plan.purpose) || changed;
          } catch (error) {
            console.error(JSON.stringify({ collectionName, documentId: document._id.toString(), path: plan.path, status: "failed", error: error instanceof Error ? error.message : String(error) }));
          }
        }
        if (changed) {
          if (!dryRun) await collection.replaceOne({ _id: document._id }, document);
          console.log(JSON.stringify({ collectionName, documentId: document._id.toString(), status: dryRun ? "would_update" : "updated" }));
        }
      }
    }
  } finally {
    await client.close();
  }
};

main().catch((error) => {
  console.error("Base64 image migration failed:", error);
  process.exit(1);
});
