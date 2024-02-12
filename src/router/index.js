import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import AuthLayout from "../views/AuthLayout.vue";
import Register from "../views/Register.vue";
import Main from "../views/Main.vue";
import Test from "../views/Test.vue";
import Play from "../views/Play.vue";
import CreateJoinRoom from "../views/CreateJoinRoom.vue";
import Welcome from "../views/Welcome.vue";
import Party from "../views/Party.vue";
import RoomsList from "../views/RoomsList.vue";
import GoogleLoginSuccess from "../components/GoogleLoginSuccess.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "Auth",
      path: "/",
      redirect: "/login",
      component: AuthLayout,
      meta: { requiresAuth: false },
      children: [
        {
          name: "Login",
          path: "/login",
          component: Login,
        },
        {
          path: "/login/success/:token",
          component: GoogleLoginSuccess,
        },
        {
          name: "Register",
          path: "/register",
          component: Register,
        },
      ],
    },
    {
      name: "Main",
      path: "/main",
      redirect: "/play",
      component: Main,
      meta: { requiresAuth: true },
      children: [
        {
          name: "Test",
          path: "/test",
          component: Test,
        },
        {
          name: "Play",
          path: "/play",
          redirect: "/play/main",
          component: Play,
          children: [
            {
              name: "Welcome",
              path: "/play/main",
              component: Welcome,
            },
            {
              name: "CreateJoinRoom",
              path: "/play/join",
              component: CreateJoinRoom,
            },
            {
              name: "CreateJoinRoom",
              path: "/play/join",
              component: CreateJoinRoom,
            },
            {
              name: "RoomsList",
              path: "/play/rooms",
              component: RoomsList,
            },
          ],
        },
        {
          name: "Party",
          path: "/party/:code",
          component: Party,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (!to.meta.requiresAuth && token) {
    next({ name: "Main" });
  } else if (to.meta.requiresAuth && !token) {
    next({ name: "Login" });
  } else {
    next();
  }
});

export default router;
