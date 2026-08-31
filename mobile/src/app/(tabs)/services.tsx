import { colors, radii, spacing } from "@smaj/design-tokens";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { StatusPill } from "@/components/status-pill";
import { services } from "@/lib/services";
export default function ServicesScreen(){return <Screen eyebrow="15 CONNECTED SERVICES" title="Services"><View style={styles.grid}>{services.map(service=><Pressable key={service.slug} style={styles.card} onPress={()=>router.push({pathname:"/service/[slug]",params:{slug:service.slug}})}><View style={styles.top}><Text style={styles.icon}>{service.icon}</Text><StatusPill status={service.status}/></View><Text style={styles.name}>{service.shortName}</Text><Text numberOfLines={2} style={styles.description}>{service.description}</Text></Pressable>)}</View></Screen>}
const styles=StyleSheet.create({grid:{flexDirection:"row",flexWrap:"wrap",gap:spacing.md},card:{width:"47.8%",minHeight:164,padding:spacing.md,borderRadius:radii.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,gap:spacing.sm},top:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between"},icon:{fontSize:38},name:{color:colors.text,fontSize:16,fontWeight:"900"},description:{color:colors.textMuted,fontSize:12,lineHeight:17}});