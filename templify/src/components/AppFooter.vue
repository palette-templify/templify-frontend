<!-- src/components/AppFooter.vue -->
<template>
  <v-footer color="primary" dark app>
    <v-col class="text-center white--text" cols="12">
      <span>&copy; {{ currentYear }} Templify. All rights reserved.</span>
    </v-col>
  </v-footer>
</template>

<script>
export default {
  name: "AppFooter",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
/* Add any footer-specific styles here */
</style>
