const fs = require("node:fs");
const path = require("node:path");
const { responses } = require("./responses");

const knowledgePath = path.join(__dirname, "..", "knowledge", "smaj-pi-hub.md");
const knowledgeDocument = fs.readFileSync(knowledgePath, "utf8");

const normalize = (value) => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9π\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const faq = [
  { phrases: ["what is smaj pi hub", "about smaj pi hub", "smaj pi hub"], response: responses.about },
  { phrases: ["how do i sell", "how to sell", "become seller", "seller verification", "verify seller", "seller"], response: responses.seller },
  { phrases: ["how do i buy", "how to buy", "buy product", "buying"], response: responses.buying },
  { phrases: ["what is smaj store", "smaj store", "store", "marketplace"], response: responses.store },
  { phrases: ["how to use testnet", "testnet", "test net"], response: responses.testnet },
  { phrases: ["pi payment", "pay with pi", "payment with pi"], response: responses.piPayment },
  { phrases: ["gcv", "global consensus value"], response: responses.gcv },
  { phrases: ["white paper", "whitepaper"], response: responses.whitepaper },
  { phrases: ["community", "telegram group", "telegram channel"], response: responses.community },
  { phrases: ["support", "help me", "contact support"], response: responses.support },
  { phrases: ["services", "what services"], response: responses.services },
  { phrases: ["official links", "website", "social media"], response: responses.links },
];

const findKnowledgeResponse = (input) => {
  const question = normalize(input);
  if (!question) return null;
  let best = null;
  for (const entry of faq) {
    for (const phrase of entry.phrases) {
      const normalizedPhrase = normalize(phrase);
      if (!question.includes(normalizedPhrase)) continue;
      const score = normalizedPhrase.length;
      if (!best || score > best.score) best = { score, response: entry.response };
    }
  }
  return best?.response || null;
};

module.exports = { faq, findKnowledgeResponse, knowledgeDocument, knowledgePath, normalize };