<template>
  <div>
    <v-app-bar color="primary" dark app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <div class="logo-container" @click="goToWrite">
        <img
          src="@/assets/templify-logo.png"
          alt="Templify Logo"
          class="mr-2"
          height="32"
        />
        <v-toolbar-title>Templify</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>
      <v-btn text v-if="!authStore.loggedIn" to="/">Login</v-btn>
      <v-btn text v-else @click="handleLogout">Logout</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <!-- Items shown when not logged in -->
        <template v-if="!authStore.loggedIn">
          <v-list-item to="/">
            <template v-slot:prepend>
              <v-icon>mdi-login</v-icon>
            </template>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>
        </template>

        <!-- Items shown when logged in -->
        <template v-else>
          <v-list-item to="/write">
            <template v-slot:prepend>
              <v-icon>mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Write</v-list-item-title>
          </v-list-item>

          <v-list-item to="/history">
            <template v-slot:prepend>
              <v-icon>mdi-history</v-icon>
            </template>
            <v-list-item-title>History</v-list-item-title>
          </v-list-item>
        </template>
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

    const goToWrite = () => {
      // Only navigate if user is logged in
      if (authStore.loggedIn) {
        router.push("/write");
      } else {
        // If not logged in, go to login page
        router.push("/");
      }
    };

    return {
      authStore,
      drawer,
      handleLogout,
      goToWrite,
    };
  },
};
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-container:hover {
  opacity: 0.9;
}
</style>
