import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("amdox_token") : null,
  setToken: (token: string) => {
    localStorage.setItem("amdox_token", token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("amdox_token");
    set({ token: null });
  },
}));