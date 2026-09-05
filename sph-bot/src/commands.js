const { responses } = require("./responses");

const commandDefinitions = Object.freeze([
  ["start", "Start SPH Bot"],
  ["help", "View available topics"],
  ["about", "About SMAJ PI HUB"],
  ["services", "Explore SMAJ services"],
  ["store", "Learn about SMAJ Store"],
  ["seller", "Seller and verification help"],
  ["testnet", "Understand Testnet"],
  ["whitepaper", "Open the White Paper"],
  ["community", "Join official communities"],
  ["links", "View official links"],
  ["support", "Get support"],
]);

const registerCommands = (bot) => {
  for (const [command] of commandDefinitions) {
    bot.command(command, (ctx) => ctx.reply(responses[command], { disable_web_page_preview: true }));
  }
};

module.exports = { commandDefinitions, registerCommands };