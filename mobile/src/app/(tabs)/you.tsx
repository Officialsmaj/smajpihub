import { colors, radii, spacing } from "@smaj/design-tokens";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { config } from "@/constants/config";
import { useAuth } from "@/providers/auth-provider";

export default function YouScreen() {
  const router = useRouter();
  const { user, loading, signingIn, authError, beginPiSignIn, signOut } = useAuth();
  const displayName = user?.displayName || user?.username;

  return <Screen eyebrow="YOUR SMAJ ACCOUNT" title="You">
    <View style={styles.profile}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{displayName?.slice(0, 1).toUpperCase() || "Pi"}</Text></View>
      <Text style={styles.name}>{loading ? "Checking account..." : displayName || "Continue with Pi"}</Text>
      <Text style={styles.handle}>{user ? `@${user.piUsername || user.username}` : "One Pi identity across Android and Pi Browser"}</Text>
      {authError ? <Text accessibilityRole="alert" style={styles.error}>{authError}</Text> : null}
      {user
        ? <Pressable style={styles.secondary} onPress={() => void signOut()}><Text style={styles.secondaryText}>Sign out on this device</Text></Pressable>
        : <Pressable disabled={loading || signingIn} style={[styles.primary, (loading || signingIn) && styles.disabled]} onPress={() => void beginPiSignIn()}>
            {signingIn ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Continue with Pi</Text>}
          </Pressable>}
    </View>
    {user ? <Pressable style={styles.web} onPress={() => router.push("/notifications")}><Text>Notifications &gt;</Text></Pressable> : null}
    <View style={styles.info}>
      <Text style={styles.infoTitle}>Secure Pi sign-in</Text>
      <Text style={styles.infoText}>Your identity is verified by Pi and the existing SMAJ backend. The access token is stored only in this device&apos;s encrypted SecureStore.</Text>
    </View>
    <Pressable style={styles.web} onPress={() => void Linking.openURL(config.webBaseUrl)}><Text>Open SMAJ PI HUB website &gt;</Text></Pressable>
  </Screen>;
}

const styles = StyleSheet.create({
  profile: { padding: spacing.xl, alignItems: "center", gap: spacing.sm, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMuted },
  avatarText: { color: colors.primaryDark, fontSize: 24, fontWeight: "900" },
  name: { color: colors.text, fontSize: 22, fontWeight: "900" },
  handle: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
  primary: { minWidth: 190, minHeight: 48, marginTop: spacing.md, paddingHorizontal: 20, paddingVertical: 13, alignItems: "center", justifyContent: "center", borderRadius: radii.pill, backgroundColor: colors.primary },
  primaryText: { color: "#FFFFFF", fontWeight: "800" },
  disabled: { opacity: 0.6 },
  secondary: { marginTop: spacing.md, paddingHorizontal: 20, paddingVertical: 13, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  secondaryText: { color: colors.primaryDark, fontWeight: "800" },
  error: { marginTop: spacing.sm, color: colors.danger, fontSize: 12, lineHeight: 18, textAlign: "center" },
  info: { padding: spacing.lg, gap: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface },
  infoTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  infoText: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  web: { padding: spacing.lg, alignItems: "center", borderRadius: radii.md, backgroundColor: colors.surfaceMuted }
});