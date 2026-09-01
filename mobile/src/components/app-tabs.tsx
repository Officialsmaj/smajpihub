import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors } from "@smaj/design-tokens";

const homeIcon = require("@/assets/images/tabIcons/home.png");
const servicesIcon = require("@/assets/images/tabIcons/services.png");
const searchIcon = require("@/assets/images/tabIcons/search.png");
const messagesIcon = require("@/assets/images/tabIcons/messages.png");
const youIcon = require("@/assets/images/tabIcons/you.png");
export default function AppTabs() {
  return <NativeTabs backgroundColor={colors.surface} indicatorColor={colors.surfaceMuted} labelStyle={{ selected: { color: colors.primary } }} tintColor={colors.primary}>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="services"><NativeTabs.Trigger.Label>Services</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={servicesIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="search"><NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={searchIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="messages"><NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={messagesIcon} renderingMode="template" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="you"><NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon src={youIcon} renderingMode="template" /></NativeTabs.Trigger>
  </NativeTabs>;
}