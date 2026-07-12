import fs from "fs";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "morgan";
import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import env from "./environments";
import mountPaymentsEndpoints from "./handlers/payments";
import mountUserEndpoints, { handleSignIn } from "./handlers/users";

// We must import typedefs for ts-node-dev to pick them up when they change (even though tsc would supposedly
// have no problem here)
// https://stackoverflow.com/questions/65108033/property-user-does-not-exist-on-type-session-partialsessiondata#comment125163548_65381085
import "./types/session";
import mountNotificationEndpoints from "./handlers/notifications";
import mountMarketplaceEndpoints from "./handlers/marketplace";
import mountAdminEndpoints from "./handlers/admin";
import mountMessageEndpoints from "./handlers/messages";
import mountOnboardingEndpoints from "./handlers/onboarding";
import mountSupportEndpoints from "./handlers/support";
import mountUploadEndpoints from "./handlers/uploads";
import { createMemoryCollections } from "./services/memoryDatabase";

const dbName = env.mongo_db_name;
const buildLegacyMongoUri = () => {
  if (env.mongo_user && env.mongo_password) {
    const username = encodeURIComponent(env.mongo_user);
    const password = encodeURIComponent(env.mongo_password);
    return `mongodb://${username}:${password}@${env.mongo_host}/${dbName}?authSource=admin`;
  }

  return `mongodb://${env.mongo_host}/${dbName}`;
};
const mongoUri = env.mongodb_uri || buildLegacyMongoUri();
const baseMongoClientOptions = { serverSelectionTimeoutMS: 5000 };
const mongoClientOptions = baseMongoClientOptions;
const maskMongoUri = (uri: string) => uri.replace(/\/\/([^:/?#]+):([^@/?#]+)@/, "//$1:****@");

//
// I. Initialize and set up the express app and various middlewares and packages:
//

const app: express.Application = express();
const serviceStartedAt = new Date();
const isProduction = env.is_production;
const crossSiteSession = isProduction;
const sessionTtlSeconds = 60 * 60 * 24 * 7;
const sessionCookieOptions = {
  httpOnly: true,
  sameSite: crossSiteSession ? "none" as const : "lax" as const,
  secure: crossSiteSession,
  maxAge: 1000 * sessionTtlSeconds,
};

if (isProduction) {
  app.set("trust proxy", 1);
}

console.info("[session-config]", {
  nodeEnv: env.node_env,
  renderDetected: env.is_render,
  production: isProduction,
  secure: sessionCookieOptions.secure,
  sameSite: sessionCookieOptions.sameSite,
  maxAge: sessionCookieOptions.maxAge,
  httpOnly: sessionCookieOptions.httpOnly,
  trustProxy: app.get("trust proxy"),
  sessionCollection: "user_sessions",
  ttlSeconds: sessionTtlSeconds,
});

// Log requests to the console in a compact format:
app.use(logger("dev"));

// Full log of all requests to /log/access.log:
app.use(
  logger("common", {
    stream: fs.createWriteStream(path.join(__dirname, "..", "log", "access.log"), { flags: "a" }),
  }),
);

// Enable response bodies to be sent as JSON:
app.use(express.json({ limit: "8mb" }));

// Handle CORS:
const configuredFrontendOrigins =
  (env.frontend_url || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const corsAllowlist = [
  "https://smaj.org",
  "https://www.smaj.org",
  "https://smajpihub.com",
  "https://www.smajpihub.com",
  "https://sandbox.minepi.com",
  "https://smajpihub.onrender.com",
  "http://localhost:3000",
  "http://localhost:3314",
  "http://localhost:5173",
  ...configuredFrontendOrigins,
];

const allowedOrigins = new Set(corsAllowlist);

console.info("[cors-config]", {
  credentials: true,
  allowedOrigins: [...allowedOrigins],
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin server requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      // Primary configured frontend origin(s).
      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      // Allow Codespaces preview hosts for development previews.
      if (origin.endsWith(".app.github.dev")) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Handle cookies
app.use(cookieParser());

// Use sessions:
app.use(
  session({
    secret: env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: sessionCookieOptions,
    ...(env.use_memory_db
      ? {}
      : {
          store: MongoStore.create({
            mongoUrl: mongoUri,
            mongoOptions: mongoClientOptions,
            dbName: dbName,
            collectionName: "user_sessions",
            ttl: sessionTtlSeconds,
            autoRemove: "native",
          }),
        }),
  }) as unknown as express.RequestHandler,
);

if (env.session_debug) {
  app.use((req, _, next) => {
    const cookieHeader = req.get("cookie") || "";
    const sessionFingerprint = req.sessionID
      ? crypto.createHash("sha256").update(req.sessionID).digest("hex").slice(0, 12)
      : "none";
    console.info("[session-debug]", {
      method: req.method,
      path: req.path,
      sessionFingerprint,
      hasSessionCookie: cookieHeader.includes("connect.sid="),
      hasSessionUser: Boolean(req.session.user?.userId),
      hasBearerAuth: Boolean(req.get("authorization") || req.get("x-smaj-access-token")),
    });
    next();
  });
}

//
// II. Mount app endpoints:
//

// Payments endpoint under /payments:
const paymentsRouter = express.Router();
mountPaymentsEndpoints(paymentsRouter);
app.use("/payments", paymentsRouter);

// User endpoints (e.g signin, signout) under /user:
const userRouter = express.Router();
mountUserEndpoints(userRouter);
app.use("/user", userRouter);

const marketplaceRouter = express.Router();
mountMarketplaceEndpoints(marketplaceRouter);
app.use("/marketplace", marketplaceRouter);

const adminRouter = express.Router();
mountAdminEndpoints(adminRouter);
app.use("/admin", adminRouter);

// Canonical auth endpoint matching FLOWS.md Authentication section.
app.post("/signin", handleSignIn);

// Notification endpoints under /notifications:
const notificationRouter = express.Router();
mountNotificationEndpoints(notificationRouter);
app.use("/notifications", notificationRouter);

const messageRouter = express.Router();
mountMessageEndpoints(messageRouter);
app.use("/messages", messageRouter);

const onboardingRouter = express.Router();
mountOnboardingEndpoints(onboardingRouter);
app.use("/onboarding", onboardingRouter);

const supportRouter = express.Router();
mountSupportEndpoints(supportRouter);
app.use("/support", supportRouter);

const uploadRouter = express.Router();
mountUploadEndpoints(uploadRouter);
app.use("/uploads", uploadRouter);

app.get("/health", async (_, res) => {
  const ready = Boolean(
    app.locals.userCollection &&
      app.locals.productCollection &&
      app.locals.marketplaceOrderCollection &&
      app.locals.notificationCollection,
  );

  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "starting",
    service: "smaj-pi-hub-backend",
    database: env.use_memory_db ? "memory" : "mongodb",
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: serviceStartedAt.toISOString(),
  });
});

// Hello World page to check everything works:
app.get("/", async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

// III. Boot up the app:

const start = async () => {
  try {
    if (env.use_memory_db) {
      Object.assign(app.locals, createMemoryCollections());
      console.warn("Using in-memory development database. Data resets when the backend stops.");
    } else {
      const client = await MongoClient.connect(mongoUri, mongoClientOptions);
      const db = client.db(dbName);
      app.locals.paymentCollection = db.collection("pi_payments");
      app.locals.marketplaceOrderCollection = db.collection("orders");
      app.locals.productCollection = db.collection("products");
      app.locals.userCollection = db.collection("users");
      app.locals.reportCollection = db.collection("reports");
      app.locals.favoriteCollection = db.collection("favorites");
      app.locals.reviewCollection = db.collection("reviews");
      app.locals.conversationCollection = db.collection("conversations");
      app.locals.messageCollection = db.collection("messages");
      app.locals.notificationCollection = db.collection("notifications");
      app.locals.onboardingCollection = db.collection("onboarding_applications");
      app.locals.supportCollection = db.collection("support_requests");
      app.locals.sessionCollection = db.collection("user_sessions");
      await Promise.all([
        app.locals.userCollection.createIndex({ uid: 1 }, { unique: true }),
        app.locals.userCollection.createIndex({ piUsername: 1 }),
        app.locals.productCollection.createIndex({ sellerId: 1, createdAt: -1 }),
        app.locals.productCollection.createIndex({ active: 1, approved: 1, reviewStatus: 1, hidden: 1, createdAt: -1 }),
        app.locals.productCollection.createIndex({ category: 1, active: 1, approved: 1, reviewStatus: 1 }),
        app.locals.marketplaceOrderCollection.createIndex({ buyerId: 1, createdAt: -1 }),
        app.locals.marketplaceOrderCollection.createIndex({ sellerId: 1, createdAt: -1 }),
        app.locals.conversationCollection.createIndex({ participants: 1, updatedAt: -1 }),
        app.locals.messageCollection.createIndex({ conversationId: 1, createdAt: 1 }),
        app.locals.notificationCollection.createIndex({ userId: 1, createdAt: -1 }),
        app.locals.sessionCollection.createIndex({ expires: 1 }, { expireAfterSeconds: 0 }),
      ]);
    }

    console.log(env.use_memory_db ? "Connected to in-memory development database" : `Connected to MongoDB on: ${maskMongoUri(mongoUri)}`);

    app.listen(env.port, () => {
      console.log(`SMAJ PI HUB backend listening on port ${env.port}!`);
      console.log(`CORS config: configured to respond to a frontend hosted on ${env.frontend_url}`);
    });
  } catch (err) {
    console.error("Connection to MongoDB failed: ", err);
    process.exit(1);
  }
};

start();
