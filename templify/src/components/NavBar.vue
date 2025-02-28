<template>
  <div>
    <v-app-bar color="primary" dark app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Templify</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/about">About</v-btn>
      <v-btn text to="/contact">Contact</v-btn>
      <v-btn text v-if="!authStore.loggedIn" to="/">Login</v-btn>
      <v-btn text v-else @click="handleLogout">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item to="/">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>
        <v-list-item to="/about">
          <v-list-item-title>About</v-list-item-title>
        </v-list-item>
        <v-list-item to="/contact">
          <v-list-item-title>Contact</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

export default {
  name: "NavBar",
  setup() {
    const authStore = useAuthStore();
    const drawer = ref(false);
    const router = useRouter();

    const handleLogout = () => {
      authStore.logout();
      router.push("/");
    };

    return {
      authStore,
      drawer,
      handleLogout,
    };
  },
};
</script>

<style scoped>
/* Optional additional styling */
</style>
