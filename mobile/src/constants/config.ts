export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://smajpihub.onrender.com",
  webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL || "https://smajpihub.com"
} as const;