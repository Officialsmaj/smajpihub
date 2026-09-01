import assert from "node:assert/strict";
import test from "node:test";
import { buildPiAuthorizeUrl, isPiOAuthCallbackUrl, parsePiOAuthCallback } from "../src/lib/pi-oauth.ts";

const clientId = "test-client";
const redirectUri = "https://smajpihub.com/signin/callback";
const state = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

test("builds the documented Pi implicit authorization request", () => {
  const url = new URL(buildPiAuthorizeUrl({ clientId, redirectUri, state }));
  assert.equal(url.origin + url.pathname, "https://accounts.pinet.com/oauth/authorize");
  assert.equal(url.searchParams.get("response_type"), "token");
  assert.equal(url.searchParams.get("client_id"), clientId);
  assert.equal(url.searchParams.get("redirect_uri"), redirectUri);
  assert.equal(url.searchParams.get("scope"), "username wallet_address");
  assert.equal(url.searchParams.get("state"), state);
});

test("accepts a valid callback fragment", () => {
  const result = parsePiOAuthCallback(`${redirectUri}#access_token=token-123&token_type=Bearer&expires_in=3600&state=${state}`, redirectUri, state);
  assert.deepEqual(result, { accessToken: "token-123", tokenType: "Bearer", expiresIn: 3600, state });
});

test("rejects a callback with the wrong state", () => {
  assert.throws(() => parsePiOAuthCallback(`${redirectUri}#access_token=token-123&state=wrong`, redirectUri, state), /state validation failed/);
});

test("rejects a callback on another origin", () => {
  assert.throws(() => parsePiOAuthCallback(`https://evil.example/signin/callback#access_token=token-123&state=${state}`, redirectUri, state), /does not match/);
});

test("rejects callbacks without an access token", () => {
  assert.throws(() => parsePiOAuthCallback(`${redirectUri}#state=${state}`, redirectUri, state), /did not return an access token/);
});
test("recognizes only the configured HTTPS callback", () => {
  assert.equal(isPiOAuthCallbackUrl(`${redirectUri}#state=${state}`, redirectUri), true);
  assert.equal(isPiOAuthCallbackUrl("smajpihub://signin/callback#state=test", redirectUri), false);
  assert.equal(isPiOAuthCallbackUrl("not a URL", redirectUri), false);
});

test("returns a provider error only after state validation", () => {
  assert.throws(() => parsePiOAuthCallback(`${redirectUri}#error=access_denied&error_description=User%20cancelled&state=${state}`, redirectUri, state), /User cancelled/);
  assert.throws(() => parsePiOAuthCallback(`${redirectUri}#error=access_denied&state=wrong`, redirectUri, state), /state validation failed/);
});