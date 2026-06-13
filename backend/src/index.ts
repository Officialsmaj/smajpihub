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
import mountAdminEndpoints from "./handlers/admin";
import mountMessageEndpoints from "./handlers/messages";

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
    app.locals.reportCollection = db.collection("reports");
    app.locals.favoriteCollection = db.collection("favorites");
    app.locals.reviewCollection = db.collection("reviews");
    app.locals.conversationCollection = db.collection("conversations");
    app.locals.messageCollection = db.collection("messages");
    app.locals.notificationCollection = db.collection("notifications");

    const demoSellerId = "smaj-demo-store";
    await app.locals.userCollection.updateOne({ uid: demoSellerId }, { $setOnInsert: { uid: demoSellerId, username: "smajmarket", piUsername: "smajmarket", displayName: "SMAJ Market", country: "Nigeria", contactPhone: "@smajmarket", role: "seller", roles: ["seller"], blocked: false, verificationLevel: "trusted_seller", settings: { theme: "light", language: "English", notifications: true }, createdAt: new Date("2025-01-15") } }, { upsert: true });
    const productCount = await app.locals.productCollection.countDocuments();
    if (productCount < 210) {
      const categories = ["Electronics", "Fashion", "Vehicles", "Home", "Property", "Phones", "Computers", "Beauty", "Services", "Others"];
      const names = ["Wireless Headphones", "Smart Watch", "Everyday Backpack", "Running Shoes", "Android Phone", "Office Laptop", "Home Blender", "Skincare Set", "City Bicycle", "Portable Speaker", "Desk Lamp", "Coffee Maker", "Phone Case", "Digital Service", "Modern Chair"];
      const locations = ["Lagos, Nigeria", "Abuja, Nigeria", "Accra, Ghana", "Nairobi, Kenya", "Cape Town, South Africa", "Online"];
      const needed = 210 - productCount;
      const products = Array.from({ length: needed }, (_, offset) => { const index = productCount + offset; const title = `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`; const image = `https://picsum.photos/seed/smaj-product-${index}/800/620`; const pricePi = Number((0.0005 + ((index * 137) % 145) / 10000).toFixed(4)); return { sellerId: demoSellerId, sellerName: "SMAJ Market", piUsername: "smajmarket", title, image, images: [image, `https://picsum.photos/seed/smaj-product-${index}-detail/800/620`], pricePi, description: `${title} offered by a trusted SMAJ PI HUB marketplace seller. Contact the seller for availability and delivery details.`, category: categories[index % categories.length], location: locations[index % locations.length], sellerContact: "@smajmarket", active: true, approved: true, hidden: false, createdAt: new Date(Date.now() - index * 3600000) }; });
      await app.locals.productCollection.insertMany(products);
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
