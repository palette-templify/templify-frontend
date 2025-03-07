<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-4">
          <v-card-title class="justify-center">
            <span class="headline">Templify</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="passwordRules"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="login" :disabled="!valid">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "LoginView",
  setup() {
    const email = ref("");
    const password = ref("");
    const valid = ref(false);
    const form = ref(null);
    const router = useRouter();
    const authStore = useAuthStore();

    const emailRules = [
      (v) => !!v || "Email is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ];
    const passwordRules = [(v) => !!v || "Password is required"];

    const login = async () => {
      if (form.value.validate()) {
        console.log("Logging in with", email.value);
        const payload = {
          email: email.value,
          password: password.value,
        };
        try {
          const response = await apiService.post("/api/auth/login", payload);
          authStore.login(response.data);
          router.push("/write");
        } catch (error) {
          console.error("Login error: ", error);
        }
      }
    };

    return {
      email,
      password,
      valid,
      form,
      emailRules,
      passwordRules,
      login,
    };
  },
};
</script>

<style scoped>
.headline {
  font-weight: bold;
  font-size: 24px;
  color: var(--v-primary-base);
  text-transform: uppercase;
}
</style>
