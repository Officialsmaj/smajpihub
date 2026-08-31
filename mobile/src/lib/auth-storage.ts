import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "smaj_mobile_access_token";
export const authStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (value: string) => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  }),
  clear: () => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
};