import fs from "fs";
import path from "path";
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

const dbName = env.mongo_db_name;
const mongoUri = `mongodb://${env.mongo_host}/${dbName}`;
const mongoClientOptions = {
  authSource: "admin",
  auth: {
    username: env.mongo_user,
    password: env.mongo_password,
  },
};

//
// I. Initialize and set up the express app and various middlewares and packages:
//

const app: express.Application = express();

// Log requests to the console in a compact format:
app.use(logger("dev"));

// Full log of all requests to /log/access.log:
app.use(
  logger("common", {
    stream: fs.createWriteStream(path.join(__dirname, "..", "log", "access.log"), { flags: "a" }),
  }),
);

// Enable response bodies to be sent as JSON:
app.use(express.json({ limit: "5mb" }));

// Handle CORS:
const allowedOrigins = new Set(
  (env.frontend_url || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin server requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      // Primary configured frontend origin(s).
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      // Allow Codespaces preview hosts and Pi Sandbox host for testnet app wrapper.
      if (origin.endsWith(".app.github.dev") || origin === "https://sandbox.minepi.com") {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Handle cookies 🍪
app.use(cookieParser());

// Use sessions:
app.use(
  session({
    secret: env.session_secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      mongoOptions: mongoClientOptions,
      dbName: dbName,
      collectionName: "user_sessions",
    }),
  }) as unknown as express.RequestHandler,
);

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

// Canonical auth endpoint matching FLOWS.md Authentication section.
app.post("/signin", handleSignIn);

// Notification endpoints under /notifications:
const notificationRouter = express.Router();
mountNotificationEndpoints(notificationRouter);
app.use("/notifications", notificationRouter);

// Hello World page to check everything works:
app.get("/", async (_, res) => {
  res.status(200).send({ message: "Hello, World!" });
});

// III. Boot up the app:

const start = async () => {
  try {
    const client = await MongoClient.connect(mongoUri, mongoClientOptions);
    const db = client.db(dbName);
    app.locals.paymentCollection = db.collection("pi_payments");
    app.locals.marketplaceOrderCollection = db.collection("orders");
    app.locals.productCollection = db.collection("products");
    app.locals.userCollection = db.collection("users");

    if ((await app.locals.productCollection.countDocuments()) === 0) {
      await app.locals.productCollection.insertMany([
        {
          sellerId: "smaj-demo-store",
          sellerName: "SMAJ Market",
          piUsername: "smajmarket",
          title: "SMAJ Creator Headphones",
          image: "/smaj-hero.png",
          pricePi: 18,
          description: "Comfortable wireless headphones for work, learning, and entertainment.",
          category: "Electronics",
          location: "Lagos, Nigeria",
          sellerContact: "@smajmarket",
          active: true,
          createdAt: new Date(),
        },
        {
          sellerId: "smaj-demo-store",
          sellerName: "SMAJ Market",
          piUsername: "smajmarket",
          title: "Purple Everyday Backpack",
          image: "/smaj_ecosystem_logo.png",
          pricePi: 12.5,
          description: "A practical everyday backpack with space for devices and essentials.",
          category: "Fashion",
          location: "Accra, Ghana",
          sellerContact: "@smajmarket",
          active: true,
          createdAt: new Date(),
        },
        {
          sellerId: "smaj-demo-store",
          sellerName: "SMAJ Market",
          piUsername: "smajmarket",
          title: "Digital Business Starter Pack",
          image: "/logo.png",
          pricePi: 7,
          description: "A downloadable starter collection for small online businesses.",
          category: "Digital",
          location: "Online",
          sellerContact: "@smajmarket",
          active: true,
          createdAt: new Date(),
        },
      ]);
    }
    console.log("Connected to MongoDB on: ", mongoUri);

    app.listen(env.port, () => {
      console.log(`App platform demo app - Backend listening on port ${env.port}!`);
      console.log(`CORS config: configured to respond to a frontend hosted on ${env.frontend_url}`);
    });
  } catch (err) {
    console.error("Connection to MongoDB failed: ", err);
    process.exit(1);
  }
};

start();
