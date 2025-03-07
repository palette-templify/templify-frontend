<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script>
import AppFooter from "./components/AppFooter.vue";
import NavBar from "./components/NavBar.vue";

export default {
  name: "App",
  components: { NavBar, AppFooter },
};
</script>

<style></style>
