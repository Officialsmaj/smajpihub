import { colors, radii, spacing } from "@smaj/design-tokens";
import type { HealthResponse } from "@smaj/shared-types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { StatusPill } from "@/components/status-pill";
import { api } from "@/lib/api";
import { services } from "@/lib/services";

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  useEffect(() => { api.health().then(setHealth).catch(() => setHealth(null)); }, []);
  return <Screen eyebrow="SMAJ PI HUB" title="Everything you need. One place.">
    <View style={styles.hero}><Text style={styles.heroKicker}>POWERED BY PI</Text><Text style={styles.heroTitle}>One account for commerce, work, learning and daily life.</Text><Text style={styles.heroText}>The Android app and Pi Browser connect to the same SMAJ platform.</Text><Pressable style={styles.heroButton} onPress={() => router.navigate("/services")}><Text>Explore services -&gt;</Text></Pressable></View>
    <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>Live now</Text><Text style={styles.muted}>Connected to the same production backend</Text></View><Text style={[styles.connection, health?.status === "ok" ? styles.online : styles.starting]}>{health?.status === "ok" ? "ONLINE" : "CHECKING"}</Text></View>
    <View style={styles.liveGrid}>{services.slice(0, 3).map(service => <Pressable key={service.slug} style={styles.liveCard} onPress={() => router.push({ pathname: "/service/[slug]", params: { slug: service.slug } })}><Text style={styles.icon}>{service.icon}</Text><StatusPill status={service.status}/><Text style={styles.cardTitle}>{service.shortName}</Text><Text numberOfLines={2} style={styles.muted}>{service.description}</Text></Pressable>)}</View>
    <View style={styles.notice}><Text style={styles.noticeTitle}>One shared platform</Text><Text style={styles.muted}>Products, orders, jobs, courses, profiles and messages remain synchronized through the existing SMAJ backend and MongoDB.</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({
  hero:{padding:spacing.xl,borderRadius:radii.lg,backgroundColor:colors.primary,gap:spacing.md},heroKicker:{color:"#F5D87A",fontWeight:"900",fontSize:11,letterSpacing:1.2},heroTitle:{color:"#FFF",fontWeight:"900",fontSize:25,lineHeight:30},heroText:{color:"#E9E2FF",fontSize:14,lineHeight:21},heroButton:{alignSelf:"flex-start",paddingHorizontal:16,paddingVertical:11,borderRadius:radii.pill,backgroundColor:"#FFF"},
  sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sectionTitle:{color:colors.text,fontSize:20,fontWeight:"900"},muted:{color:colors.textMuted,fontSize:12,lineHeight:17},connection:{fontSize:9,fontWeight:"900",paddingHorizontal:8,paddingVertical:5,borderRadius:radii.pill,overflow:"hidden"},online:{color:colors.success,backgroundColor:"#DFF7EC"},starting:{color:colors.warning,backgroundColor:"#FFF0CE"},
  liveGrid:{flexDirection:"row",gap:spacing.sm},liveCard:{flex:1,minHeight:165,padding:spacing.md,borderRadius:radii.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,gap:spacing.sm},icon:{fontSize:38},cardTitle:{color:colors.text,fontWeight:"900",fontSize:15},notice:{padding:spacing.lg,borderRadius:radii.md,backgroundColor:colors.surfaceMuted,gap:spacing.sm},noticeTitle:{fontSize:18,fontWeight:"900",color:colors.primaryDark}
});