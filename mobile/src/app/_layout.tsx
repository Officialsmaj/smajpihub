import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
  return <AuthProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="service/[slug]" options={{ presentation: "card" }} />
      <Stack.Screen name="oauth/pi" options={{ presentation: "card" }} />
    </Stack>
  </AuthProvider>;
}