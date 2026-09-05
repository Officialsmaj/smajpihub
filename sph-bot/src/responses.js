const links = Object.freeze({
  website: "https://smajpihub.com",
  whitePaper: "https://smajpihub.com/white-paper",
  telegramChannel: "https://t.me/smajpihub",
  telegramCommunity: "https://t.me/smajpihubCommunity",
  x: "https://x.com/smajpihub",
});

const responses = Object.freeze({
  start: `SPH Bot | SMAJ PI HUB 💜π

Welcome! I help you learn about SMAJ PI HUB, its services, marketplace, Pi utility, sellers, Testnet, community, and White Paper.

Use /help to see all available topics.`,
  help: `SPH Bot commands

/start - Welcome and introduction
/about - About SMAJ PI HUB
/services - Explore ecosystem services
/store - Learn about SMAJ Store
/seller - Seller tools and verification
/testnet - Testnet information
/whitepaper - Official White Paper
/community - Official communities
/links - All official links
/support - Get support`,
  about: `SMAJ PI HUB connects multiple digital services through one SMAJ account. Learn more on the official website:
${links.website}`,
  services: `SMAJ PI HUB services include Store, Stream, Sports, Jobs, Education, Food, Health, Transport, Events, Wallet, and more.

Check current availability: ${links.website}/app/services`,
  store: `SMAJ Store is the marketplace area for discovering products and sellers. Use the platform's current listing, order, safety, and payment instructions.

Open SMAJ PI HUB: ${links.website}`,
  seller: `Seller tools and seller verification are managed inside SMAJ PI HUB. Verification appears only after the applicable review is approved. Never share a private key or wallet passphrase.

Open seller tools: ${links.website}`,
  testnet: `Testnet is for testing and is not Mainnet value. Follow the latest instructions displayed in SMAJ PI HUB and official Pi Network products.`,
  whitepaper: `Read the official SMAJ PI HUB White Paper:
${links.whitePaper}`,
  community: `Official SMAJ PI HUB communities

Channel: ${links.telegramChannel}
Community: ${links.telegramCommunity}
X: ${links.x}`,
  links: `Official SMAJ PI HUB links

Website: ${links.website}
White Paper: ${links.whitePaper}
Telegram Channel: ${links.telegramChannel}
Telegram Community: ${links.telegramCommunity}
X: ${links.x}`,
  support: `For SMAJ PI HUB help, ask in the official community:
${links.telegramCommunity}

You can also visit: ${links.website}`,
  buying: `To buy, open SMAJ Store, review the product and seller information, and follow the checkout instructions shown by SMAJ PI HUB.
${links.website}`,
  piPayment: `Pi payment availability and instructions are shown inside the relevant SMAJ PI HUB service. Confirm every payment in the official Pi interface and never share your wallet passphrase.`,
  gcv: `SPH Bot does not provide or guarantee a GCV valuation. Please use official SMAJ PI HUB and Pi Network information and avoid treating community claims as guaranteed value.

White Paper: ${links.whitePaper}`,
  unknown: `🤖 I couldn't find an exact answer for that yet.

Try /help to see available topics or ask your question in the SMAJ PI HUB Community:
${links.telegramCommunity}`,
});

module.exports = { links, responses };