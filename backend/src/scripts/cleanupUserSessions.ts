import { MongoClient } from "mongodb";
import env from "../environments";

const confirmationFlag = "--confirm-delete-user-sessions";
const dbName = env.mongo_db_name;
const buildLegacyMongoUri = () => {
  if (env.mongo_user && env.mongo_password) {
    return `mongodb://${encodeURIComponent(env.mongo_user)}:${encodeURIComponent(env.mongo_password)}@${env.mongo_host}/${dbName}?authSource=admin`;
  }
  return `mongodb://${env.mongo_host}/${dbName}`;
};

const main = async () => {
  if (!process.argv.includes(confirmationFlag)) {
    console.error(`Refusing to delete sessions. Re-run with ${confirmationFlag} to clear only the user_sessions collection.`);
    process.exit(1);
  }

  const client = await MongoClient.connect(env.mongodb_uri || buildLegacyMongoUri(), { serverSelectionTimeoutMS: 5000 });
  try {
    const collection = client.db(dbName).collection("user_sessions");
    const before = await collection.countDocuments({});
    const result = await collection.deleteMany({});
    console.log(JSON.stringify({
      collectionName: "user_sessions",
      sessionsBefore: before,
      deletedSessions: result.deletedCount,
      untouchedCollections: ["users", "products", "orders", "messages", "notifications"],
    }, null, 2));
  } finally {
    await client.close();
  }
};

main().catch((error) => {
  console.error("Session cleanup failed:", error);
  process.exit(1);
});
