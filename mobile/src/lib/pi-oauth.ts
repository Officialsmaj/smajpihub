export const PI_AUTHORIZE_URL = "https://accounts.pinet.com/oauth/authorize";
export const PI_OAUTH_SCOPES = ["username", "wallet_address"] as const;

export type PiOAuthCallback = {
  accessToken: string;
  expiresIn?: number;
  state: string;
  tokenType: "Bearer";
};

export function buildPiAuthorizeUrl(options: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: readonly string[];
}) {
  if (!options.clientId.trim()) throw new Error("Pi OAuth Client ID is missing.");
  if (options.state.length < 32) throw new Error("OAuth state must contain at least 32 characters.");

  const url = new URL(PI_AUTHORIZE_URL);
  url.searchParams.set("response_type", "token");
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("scope", (options.scopes || PI_OAUTH_SCOPES).join(" "));
  url.searchParams.set("state", options.state);
  return url.toString();
}

export function isPiOAuthCallbackUrl(candidateUrl: string, redirectUri: string) {
  try {
    const candidate = new URL(candidateUrl);
    const redirect = new URL(redirectUri);
    return candidate.origin === redirect.origin && candidate.pathname === redirect.pathname;
  } catch {
    return false;
  }
}
export function parsePiOAuthCallback(callbackUrl: string, redirectUri: string, expectedState: string): PiOAuthCallback {
  const callback = new URL(callbackUrl);
  const redirect = new URL(redirectUri);
  if (callback.origin !== redirect.origin || callback.pathname !== redirect.pathname) {
    throw new Error("OAuth callback URI does not match the configured redirect.");
  }

  const fragment = new URLSearchParams(callback.hash.replace(/^#/, ""));
  const returnedState = fragment.get("state") || "";
  if (!expectedState || returnedState !== expectedState) {
    throw new Error("OAuth state validation failed. Please try signing in again.");
  }

  const oauthError = fragment.get("error");
  if (oauthError) {
    throw new Error(fragment.get("error_description") || `Pi authorization failed: ${oauthError}`);
  }

  const accessToken = fragment.get("access_token") || "";
  if (!accessToken) throw new Error("Pi authorization did not return an access token.");
  const tokenType = fragment.get("token_type") || "Bearer";
  if (tokenType.toLowerCase() !== "bearer") throw new Error("Unsupported Pi OAuth token type.");
  const rawExpiry = fragment.get("expires_in");
  const expiresIn = rawExpiry && /^\d+$/.test(rawExpiry) ? Number(rawExpiry) : undefined;
  return { accessToken, expiresIn, state: returnedState, tokenType: "Bearer" };
}