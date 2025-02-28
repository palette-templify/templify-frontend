import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loggedIn: false,
  }),
  actions: {
    login(userData) {
      sessionStorage.setItem("accessToken", userData.data.accessToken);
      localStorage.setItem("refreshToken", userData.data.refreshToken);
      this.loggedIn = true;
    },
    logout() {
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      this.loggedIn = false;
    },
  },
});
