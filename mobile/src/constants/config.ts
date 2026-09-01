export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://smajpihub.onrender.com",
  webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL || "https://smajpihub.com",
  piOAuthClientId: process.env.EXPO_PUBLIC_PI_OAUTH_CLIENT_ID || "",
  piOAuthRedirectUri: process.env.EXPO_PUBLIC_PI_OAUTH_REDIRECT_URI || "https://smajpihub.com/signin/callback"
} as const;
