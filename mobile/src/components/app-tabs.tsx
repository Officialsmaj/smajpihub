import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@smaj/design-tokens";

const homeIcon = require("@/assets/images/tabIcons/home.png");
const exploreIcon = require("@/assets/images/tabIcons/explore.png");
export default function AppTabs() {
  return <NativeTabs backgroundColor={colors.surface} indicatorColor={colors.surfaceMuted} labelStyle={{ selected: { color: colors.primary } }} tintColor={colors.primary}>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="services"><NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={exploreIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="search"><NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={exploreIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="messages"><NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={exploreIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="you"><NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" /></NativeTabs.Trigger>
  </NativeTabs>;
}