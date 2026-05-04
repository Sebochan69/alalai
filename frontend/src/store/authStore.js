import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),

  setAuth: ({ access_token, role, user_id, full_name }) => {
    const user = { role, user_id, full_name };
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token: access_token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
