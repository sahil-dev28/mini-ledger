import { create } from "zustand";

import { queryClient } from "./query-client";
import { tokenStorage } from "./token-storage";

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
    const token = await tokenStorage.get(TOKEN_KEY);
    set({ token, hydrated: true });
  },
  setToken: async (token) => {
    await tokenStorage.set(TOKEN_KEY, token);
    set({ token });
  },
  logout: async () => {
    await tokenStorage.remove(TOKEN_KEY);
    // drop cached loans so the next account never sees this one's data
    queryClient.clear();
    set({ token: null });
  },
}));
