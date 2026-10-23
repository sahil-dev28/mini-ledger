import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const TOKEN_KEY = "token";

type AuthState = {
  token: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hydrated: false,
  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ token, hydrated: true });
  },
  setToken: async (token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null });
  },
}));
