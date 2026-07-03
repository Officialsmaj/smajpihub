import axios from "axios";
import env from "../environments";

// IMPORTANT:
// Pi Platform has endpoints that require *either*:
// - app authentication: Authorization: Key <PI_API_KEY>
// - user authentication: Authorization: Bearer <USER_ACCESS_TOKEN>
//
// Do NOT set a default Authorization header here, otherwise requests that
// override Authorization (e.g. /v2/me with Bearer token) may end up
// sending conflicting credentials.

const platformAPIClient = axios.create({
  baseURL: env.platform_api_url,
  timeout: 20000,
});

export const getUserPlatformAPIClient = (sandbox?: boolean) =>
  axios.create({
    baseURL: sandbox ? "https://api.sandbox.minepi.com" : env.platform_api_url,
    timeout: 20000,
  });

export const getAppPlatformAPIClient = (sandbox?: boolean) =>
  axios.create({
    baseURL: sandbox ? "https://api.sandbox.minepi.com" : env.platform_api_url,
    timeout: 20000,
    headers: { Authorization: `Key ${env.pi_api_key}` },
  });

export const platformAPIKeyClient = axios.create({
  baseURL: env.platform_api_url,
  timeout: 20000,
  headers: { Authorization: `Key ${env.pi_api_key}` },
});

export default platformAPIClient;
