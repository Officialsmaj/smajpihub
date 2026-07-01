import dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  if (process.env.NODE_ENV === "development" && !process.env.RUNNING_IN_CONTAINER) {
    console.error(".env file not found. This is an error condition in development. Additional error is logged below");
    throw result.error;
  }

  // In production, environment variables are injected into the container environment. We should not even have
  // a .env file inside the running container.
}

interface Environment {
  node_env: string;
  sandbox_sdk: boolean;
  port: number;
  session_secret: string;
  pi_api_key: string;
  platform_api_url: string;
  mongo_host: string;
  mongo_db_name: string;
  mongo_user: string;
  mongo_password: string;
  frontend_url: string;
  use_memory_db: boolean;
  dev_auth: boolean;
  admin_pi_usernames: string[];
  cloudinary_cloud_name: string;
  cloudinary_upload_preset: string;
  cloudinary_folder: string;
  marketplace_auto_approve_products: boolean;
}

const sandboxSDK = String(process.env.SANDBOX_SDK || "false").toLowerCase() === "true";
const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const defaultSessionSecret = "This is my session secret";

const env: Environment = {
  node_env: nodeEnv,
  sandbox_sdk: sandboxSDK,
  port: parseInt(process.env.PORT || "8000"),
  session_secret: process.env.SESSION_SECRET || defaultSessionSecret,
  pi_api_key: process.env.PI_API_KEY || "",
  platform_api_url:
    process.env.PLATFORM_API_URL || (sandboxSDK ? "https://api.sandbox.minepi.com" : "https://api.minepi.com"),
  mongo_host: process.env.MONGO_HOST || "localhost:27017",
  mongo_db_name: process.env.MONGODB_DATABASE_NAME || "smajpihub",
  mongo_user: process.env.MONGODB_USERNAME || "",
  mongo_password: process.env.MONGODB_PASSWORD || "",
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3314",
  use_memory_db: String(process.env.USE_MEMORY_DB || "false").toLowerCase() === "true",
  dev_auth: String(process.env.DEV_AUTH || "false").toLowerCase() === "true",
  admin_pi_usernames: String(process.env.ADMIN_PI_USERNAMES || "")
    .split(",")
    .map((username) => username.trim().toLowerCase())
    .filter(Boolean),
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  cloudinary_folder: process.env.CLOUDINARY_FOLDER || "smajpihub",
  marketplace_auto_approve_products: String(process.env.MARKETPLACE_AUTO_APPROVE_PRODUCTS || "false").toLowerCase() === "true",
};

if (env.sandbox_sdk && env.platform_api_url.includes("api.minepi.com")) {
  console.warn("WARNING: SANDBOX_SDK=true but PLATFORM_API_URL points to production Pi API. Use https://api.sandbox.minepi.com");
}

if (isProduction) {
  const missing: string[] = [];
  if (!process.env.SESSION_SECRET || env.session_secret === defaultSessionSecret) missing.push("SESSION_SECRET");
  if (!env.pi_api_key) missing.push("PI_API_KEY");
  if (!process.env.FRONTEND_URL) missing.push("FRONTEND_URL");
  if (env.use_memory_db) missing.push("USE_MEMORY_DB=false");
  if (!process.env.MONGO_HOST) missing.push("MONGO_HOST");
  if (!process.env.MONGODB_DATABASE_NAME) missing.push("MONGODB_DATABASE_NAME");
  if (!env.cloudinary_cloud_name) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!env.cloudinary_upload_preset) missing.push("CLOUDINARY_UPLOAD_PRESET");

  if (missing.length) {
    throw new Error(`Missing or invalid production environment configuration: ${missing.join(", ")}`);
  }
}

export default env;
