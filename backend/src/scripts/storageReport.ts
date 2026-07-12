import { MongoClient } from "mongodb";
import env from "../environments";
import { isBase64Image } from "../services/imageStorage";

const dbName = env.mongo_db_name;
const buildLegacyMongoUri = () => {
  if (env.mongo_user && env.mongo_password) {
    return `mongodb://${encodeURIComponent(env.mongo_user)}:${encodeURIComponent(env.mongo_password)}@${env.mongo_host}/${dbName}?authSource=admin`;
  }
  return `mongodb://${env.mongo_host}/${dbName}`;
};

const mongoUri = env.mongodb_uri || buildLegacyMongoUri();
const paths = [
  "image",
  "images",
  "variants.image",
  "avatar",
  "coverImage",
  "profileImage",
  "bannerImage",
  "documents",
  "media",
];

const getPathValues = (document: Record<string, any>, path: string): unknown[] => {
  const parts = path.split(".");
  const visit = (value: unknown, index: number): unknown[] => {
    if (Array.isArray(value)) return value.flatMap((item) => visit(item, index));
    if (index >= parts.length) return [value];
    if (!value || typeof value !== "object") return [];
    return visit((value as Record<string, unknown>)[parts[index]], index + 1);
  };
  return visit(document, 0);
};

const countBase64Fields = async (collection: any, collectionName: string) => {
  const counts: Record<string, number> = {};
  const cursor = collection.find({}, { projection: Object.fromEntries(paths.map((path) => [path.split(".")[0], 1])) });
  for await (const document of cursor) {
    for (const path of paths) {
      const count = getPathValues(document, path).filter(isBase64Image).length;
      if (count) counts[path] = (counts[path] || 0) + count;
    }
  }
  return { collection: collectionName, fields: counts, total: Object.values(counts).reduce((sum, value) => sum + value, 0) };
};

const main = async () => {
  const client = await MongoClient.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  try {
    const db = client.db(dbName);
    const now = new Date();
    const [products, users, onboarding, oversizedSessions, expiredSessions] = await Promise.all([
      countBase64Fields(db.collection("products"), "products"),
      countBase64Fields(db.collection("users"), "users"),
      countBase64Fields(db.collection("onboarding_applications"), "onboarding_applications"),
      db.collection("user_sessions").countDocuments({ $expr: { $gt: [{ $bsonSize: "$$ROOT" }, 16_384] } }),
      db.collection("user_sessions").countDocuments({ expires: { $lte: now } }),
    ]);
    console.log(JSON.stringify({ products, users, onboarding, oversizedSessions, expiredSessions }, null, 2));
  } finally {
    await client.close();
  }
};

main().catch((error) => {
  console.error("Storage report failed:", error);
  process.exit(1);
});
