import axios, { type AxiosRequestConfig } from "axios";

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
