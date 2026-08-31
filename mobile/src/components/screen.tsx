import { colors, spacing } from "@smaj/design-tokens";
import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ children, title, eyebrow, action }: PropsWithChildren<{ title: string; eyebrow?: string; action?: ReactNode }>) {
  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <View style={styles.header}><View style={styles.heading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text></View>{action}</View>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 74, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  heading: { flex: 1 }, eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg }
});