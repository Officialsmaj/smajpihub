import dotenv from "dotenv";

console.log("NODE_ENV: " + process.env.NODE_ENV);

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
}

const sandboxSDK = String(process.env.SANDBOX_SDK || "false").toLowerCase() === "true";

const env: Environment = {
  sandbox_sdk: sandboxSDK,
  port: parseInt(process.env.PORT || "8000"),
  session_secret: process.env.SESSION_SECRET || "This is my session secret",
  pi_api_key: process.env.PI_API_KEY || "",
  platform_api_url:
    process.env.PLATFORM_API_URL || (sandboxSDK ? "https://api.sandbox.minepi.com" : "https://api.minepi.com"),
  mongo_host: process.env.MONGO_HOST || "localhost:27017",
  mongo_db_name: process.env.MONGODB_DATABASE_NAME || "demo-app",
  mongo_user: process.env.MONGODB_USERNAME || "",
  mongo_password: process.env.MONGODB_PASSWORD || "",
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3314",
  use_memory_db: String(process.env.USE_MEMORY_DB || "false").toLowerCase() === "true",
  dev_auth: String(process.env.DEV_AUTH || "false").toLowerCase() === "true",
};

export default env;


if (env.sandbox_sdk && env.platform_api_url.includes("api.minepi.com")) {
  console.warn("WARNING: SANDBOX_SDK=true but PLATFORM_API_URL points to production Pi API. Use https://api.sandbox.minepi.com");
}
