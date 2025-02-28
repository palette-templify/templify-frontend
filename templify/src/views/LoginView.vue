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
import apiService from "@/services/apiService";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      valid: false,
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      ],
      passwordRules: [(v) => !!v || "Password is required"],
    };
  },
  methods: {
    async login() {
      if (this.$refs.form.validate()) {
        console.log("Logging in with", this.email);
        const payload = {
          email: this.email,
          password: this.password,
        };
        try {
          const response = await apiService.post("/api/auth/login", payload);
          sessionStorage.setItem("accessToken", response.data.data.accessToken);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        } catch (error) {
          console.error("Login error: ", error);
        }
      }
    },
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
