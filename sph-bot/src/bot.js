const { Telegraf } = require("telegraf");
const { registerCommands, commandDefinitions } = require("./commands");
const { findKnowledgeResponse } = require("./knowledge");
const { responses } = require("./responses");

const createBot = (token) => {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required.");
  const bot = new Telegraf(token);

  bot.use(async (ctx, next) => {
    const startedAt = Date.now();
    try {
      await next();
    } finally {
      console.info("[telegram]", {
        updateId: ctx.update.update_id,
        type: ctx.updateType,
        userId: ctx.from?.id,
        durationMs: Date.now() - startedAt,
      });
    }
  });

  registerCommands(bot);
  bot.on("text", (ctx) => {
    const answer = findKnowledgeResponse(ctx.message.text) || responses.unknown;
    return ctx.reply(answer, { disable_web_page_preview: true });
  });
  bot.catch((error, ctx) => {
    console.error("[telegram:error]", { updateId: ctx.update.update_id, error });
  });

  bot.telegram.setMyCommands(
    commandDefinitions.map(([command, description]) => ({ command, description }))
  ).catch((error) => console.error("[telegram:commands]", error));

  return bot;
};

module.exports = { createBot };