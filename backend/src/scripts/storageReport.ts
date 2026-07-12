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

const parseSessionPayload = (session: unknown): Record<string, any> => {
  try {
    return typeof session === "string" ? JSON.parse(session) : session && typeof session === "object" ? session as Record<string, any> : {};
  } catch {
    return {};
  }
};

const sessionPayloadReport = async (collection: any) => {
  const samples = await collection.find({}, { projection: { _id: 0, session: 1, expires: 1 } })
    .sort({ expires: -1 })
    .limit(10)
    .toArray();
  const summaries = samples.map((document: Record<string, any>) => {
    const payload = parseSessionPayload(document.session);
    return {
      documentBytes: Buffer.byteLength(JSON.stringify(document)),
      sessionKeys: Object.keys(payload),
      userKeys: payload.user && typeof payload.user === "object" ? Object.keys(payload.user) : [],
      hasCurrentUser: Boolean(payload.currentUser),
      hasAccessToken: Boolean(payload.accessToken || payload.user?.accessToken || payload.currentUser?.accessToken),
      cookie: payload.cookie ? {
        originalMaxAge: payload.cookie.originalMaxAge ?? null,
        expires: payload.cookie.expires ?? null,
        secure: payload.cookie.secure ?? null,
        sameSite: payload.cookie.sameSite ?? null,
        httpOnly: payload.cookie.httpOnly ?? null,
      } : null,
      fieldBytes: Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, Buffer.byteLength(JSON.stringify(value))])),
    };
  });
  return {
    sampled: summaries.length,
    summaries,
  };
};

const main = async () => {
  const client = await MongoClient.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  try {
    const db = client.db(dbName);
    const now = new Date();
    const sessionCollection = db.collection("user_sessions");
    const [products, users, onboarding, oversizedSessions, expiredSessions, sessionPayloads] = await Promise.all([
      countBase64Fields(db.collection("products"), "products"),
      countBase64Fields(db.collection("users"), "users"),
      countBase64Fields(db.collection("onboarding_applications"), "onboarding_applications"),
      sessionCollection.countDocuments({ $expr: { $gt: [{ $bsonSize: "$$ROOT" }, 16_384] } }),
      sessionCollection.countDocuments({ expires: { $lte: now } }),
      sessionPayloadReport(sessionCollection),
    ]);
    console.log(JSON.stringify({ products, users, onboarding, oversizedSessions, expiredSessions, sessionPayloads }, null, 2));
  } finally {
    await client.close();
  }
};

main().catch((error) => {
  console.error("Storage report failed:", error);
  process.exit(1);
});
