import axios from "axios";

const PRODUCTION_API_BASE_URL = "https://smajpihub.onrender.com";

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

  if (import.meta.env.DEV) {
    return PRODUCTION_API_BASE_URL;
  }

  return PRODUCTION_API_BASE_URL;
};

export const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 20_000,
  withCredentials: true,
});
