import axios, { type AxiosRequestConfig } from "axios";
import { showFeedback } from "./feedback";

const PRODUCTION_API_BASE_URL = "https://smajpihub.onrender.com";
const PI_USER_STORAGE_KEY = "smaj_pi_user";
const API_CREDENTIALS_CONFIG: Pick<AxiosRequestConfig, "withCredentials"> = {
  withCredentials: true,
};

const isConfiguredURL = (url?: string) => Boolean(url && url !== "$$BACKEND_URL$$" && url !== "$$API_BASE_URL$$");

export const getBaseURL = () => {
  const runtimeURL = typeof window !== "undefined" ? window.__ENV?.apiBaseURL || window.__ENV?.backendURL : undefined;

  if (isConfiguredURL(runtimeURL)) {
    return runtimeURL;
  }

  const buildURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (isConfiguredURL(buildURL)) {
    return buildURL;
  }

  return PRODUCTION_API_BASE_URL;
};

axios.defaults.withCredentials = true;

export const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 20_000,
  ...API_CREDENTIALS_CONFIG,
});

axiosClient.defaults.withCredentials = true;

const getStoredAccessToken = () => {
  try {
    const stored = window.localStorage.getItem(PI_USER_STORAGE_KEY);
    if (!stored) return "";
    const user = JSON.parse(stored) as { accessToken?: string };
    return user.accessToken || "";
  } catch {
    return "";
  }
};

axiosClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  const accessToken = getStoredAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    (config.headers as Record<string, string>)["X-SMAJ-Access-Token"] = accessToken;
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (typeof window !== "undefined") {
      const status = Number(error?.response?.status || 0);
      const backendMessage = error?.response?.data?.message;
      const message = typeof backendMessage === "string" && backendMessage.trim()
        ? backendMessage
        : status === 401
          ? "Your session has expired. Please sign in again."
          : status === 403
            ? "You do not have permission to complete this action."
            : error?.code === "ECONNABORTED"
              ? "The request took too long. Please try again."
              : !error?.response
                ? "The service could not be reached. Check your connection and try again."
                : "Something went wrong. Please try again.";
      showFeedback(message, "error");
    }
    return Promise.reject(error);
  },
);

const resolveFetchInput = (input: RequestInfo | URL) => {
  if (typeof input !== "string") return input;
  if (!input.startsWith("/")) return input;
  return `${getBaseURL().replace(/\/+$/, "")}${input}`;
};

export const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}) =>
  fetch(resolveFetchInput(input), {
    ...init,
    credentials: "include",
  });
