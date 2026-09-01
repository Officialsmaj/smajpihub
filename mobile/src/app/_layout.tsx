import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/providers/auth-provider";

export default function RootLayout() {
  return <AuthProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="service/[slug]" options={{ presentation: "card" }} />
      <Stack.Screen name="store/index" />
      <Stack.Screen name="store/product/[id]" />
      <Stack.Screen name="store/orders" />
      <Stack.Screen name="signin/callback" options={{ presentation: "card" }} />
    </Stack>
  </AuthProvider>;
}