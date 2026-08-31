import * as Crypto from "expo-crypto";
import type { PiAuthResult } from "@smaj/shared-types";
import { buildPiAuthorizeUrl } from "@/lib/pi-oauth";
import { config } from "@/constants/config";

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");

export async function createPiOAuthRequest() {
  const state = bytesToHex(await Crypto.getRandomBytesAsync(32));
  return {
    state,
    authorizeUrl: buildPiAuthorizeUrl({
      clientId: config.piOAuthClientId,
      redirectUri: config.piOAuthRedirectUri,
      state
    })
  };
}

export async function createVerifiedPiAuthResult(accessToken: string): Promise<PiAuthResult> {
  const response = await fetch("https://api.minepi.com/v2/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error("Pi could not verify this sign-in. Please try again.");
  const user = await response.json() as { uid?: string; username?: string; wallet_address?: string };
  if (!user.uid || !user.username) throw new Error("Pi returned an incomplete user identity.");
  return {
    accessToken,
    user: {
      uid: user.uid,
      username: user.username,
      wallet_address: user.wallet_address
    }
  };
}