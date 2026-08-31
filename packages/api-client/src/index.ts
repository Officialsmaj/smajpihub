import type { ApiErrorBody, HealthResponse, PiAuthResult, SmajUser } from "@smaj/shared-types";

export type TokenProvider = () => Promise<string | null> | string | null;
export type ApiClientOptions = { baseUrl: string; getAccessToken?: TokenProvider };
export class SmajApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(body.message || `SMAJ API request failed (${status})`);
  }
}

export const createSmajApiClient = ({ baseUrl, getAccessToken }: ApiClientOptions) => {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const accessToken = await getAccessToken?.();
    const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}`, "X-SMAJ-Access-Token": accessToken } : {}),
        ...init.headers
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new SmajApiError(response.status, body as ApiErrorBody);
    return body as T;
  };

  return {
    request,
    health: () => request<HealthResponse>("/health"),
    currentUser: () => request<{ user: SmajUser | null }>("/user"),
    signInWithPi: (authResult: PiAuthResult) => request<{ user: SmajUser }>("/user/signin", {
      method: "POST",
      body: JSON.stringify({ authResult })
    }),
    products: () => request<{ products: unknown[] }>("/marketplace/products"),
    conversations: () => request<{ conversations: unknown[] }>("/messages"),
    notifications: () => request<{ notifications: unknown[] }>("/notifications")
  };
};