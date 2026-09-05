require("dotenv").config();
const express = require("express");
const { createBot } = require("./src/bot");

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const port = Number(process.env.PORT) || 3000;
if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Copy .env.example to .env and add your BotFather token.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.get("/", (_req, res) => res.type("text/plain").send("SPH Bot is running"));

const bot = createBot(token);
const server = app.listen(port, () => console.info(`[health] SPH Bot listening on port ${port}`));
bot.launch({ dropPendingUpdates: false })
  .then(() => console.info("[telegram] SPH Bot long polling started"))
  .catch((error) => {
    console.error("[telegram:launch]", error);
    server.close(() => process.exit(1));
  });

const shutdown = (signal) => {
  console.info(`[shutdown] ${signal}`);
  bot.stop(signal);
  server.close(() => process.exit(0));
};
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => console.error("[unhandledRejection]", error));
process.on("uncaughtException", (error) => {
  console.error("[uncaughtException]", error);
  shutdown("uncaughtException");
});