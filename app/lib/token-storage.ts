import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// SecureStore has no web implementation, so fall back to localStorage in the browser
const isWeb = Platform.OS === "web";

export const tokenStorage = {
  get: (key: string) =>
    isWeb ? Promise.resolve(localStorage.getItem(key)) : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    isWeb ? Promise.resolve(localStorage.setItem(key, value)) : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    isWeb ? Promise.resolve(localStorage.removeItem(key)) : SecureStore.deleteItemAsync(key),
};
