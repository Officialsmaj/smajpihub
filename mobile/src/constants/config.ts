export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://smajpihub.onrender.com",
  webBaseUrl: process.env.EXPO_PUBLIC_WEB_BASE_URL || "https://smajpihub.com",
  piOAuthClientId: process.env.EXPO_PUBLIC_PI_OAUTH_CLIENT_ID || "mveckL8y1XtNQBfnUKSwTFo5Q_u3mL8vQGlpRAT6COQ",
  piOAuthRedirectUri: process.env.EXPO_PUBLIC_PI_OAUTH_REDIRECT_URI || "https://smajpihub.com/oauth/pi"
} as const;
