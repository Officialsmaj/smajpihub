const test = require("node:test");
const assert = require("node:assert/strict");
const { findKnowledgeResponse, knowledgeDocument } = require("../src/knowledge");
const { responses } = require("../src/responses");

test("loads editable SMAJ PI HUB knowledge", () => {
  assert.match(knowledgeDocument, /SMAJ PI HUB/);
});

test("matches common FAQ questions", () => {
  assert.equal(findKnowledgeResponse("What is SMAJ PI HUB?"), responses.about);
  assert.equal(findKnowledgeResponse("How do I sell?"), responses.seller);
  assert.equal(findKnowledgeResponse("Can I make a Pi payment?"), responses.piPayment);
  assert.equal(findKnowledgeResponse("Show me the white paper"), responses.whitepaper);
});

test("returns null for unknown questions", () => {
  assert.equal(findKnowledgeResponse("Tell me about an unrelated subject"), null);
});