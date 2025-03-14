import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import WriteView from "@/views/WriteView.vue";
import { useAuthStore } from "@/stores/auth";
import HistoryView from "@/views/HistoryView.vue";
import HistoryDetailsView from "@/views/HistoryDetailsView.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/write",
    name: "Write",
    component: WriteView,
    meta: { requiresAuth: true },
  },
  {
    path: "/history",
    name: "History",
    component: HistoryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/history/:id",
    name: "HistoryDetails",
    component: HistoryDetailsView,
    meta: { requiresAuth: true },
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.loggedIn) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
