import axios, { type AxiosRequestConfig } from "axios";

const PRODUCTION_API_BASE_URL = "https://smajpihub.onrender.com";
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

axiosClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  return config;
});

export const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}) =>
  fetch(input, {
    ...init,
    credentials: "include",
  });
