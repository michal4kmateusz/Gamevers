
import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import { useAuthStore } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import GamesView from '../views/GamesView.vue'
import GameDetailsView from '../views/GameDetailsView.vue'
import LibraryView from '../views/LibraryView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'

import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminGamesView from '../views/admin/AdminGamesView.vue'
import AdminReviewsView from '../views/admin/AdminReviewsView.vue'

/* TRASY APLIKACJI */

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Strona główna'
    }
  },

  {
    path: '/games',
    name: 'games',
    component: GamesView,
    meta: {
      title: 'Katalog gier'
    }
  },

  {
    path: '/games/:id',
    name: 'game-details',
    component: GameDetailsView,
    props: true,
    meta: {
      title: 'Szczegóły gry'
    }
  },

  /* BIBLIOTEKA DEMONSTRACYJNA */

  {
    path: '/library',
    name: 'library',
    component: LibraryView,
    meta: {
      title: 'Moja biblioteka'
    }
  },

  /* LOGOWANIE */

  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Logowanie',
      guestOnly: true
    }
  },

  /* REJESTRACJA */

  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Rejestracja',
      guestOnly: true
    }
  },

  /* PROFIL UZYTKOWNIKA */

  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Mój profil',
      requiresAuth: true
    }
  },

  /* PANEL ADMINISTRATORA */

  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: {
      title: 'Panel administratora',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  {
    path: '/admin/games',
    name: 'admin-games',
    component: AdminGamesView,
    meta: {
      title: 'Zarządzanie grami',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  {
    path: '/admin/reviews',
    name: 'admin-reviews',
    component: AdminReviewsView,
    meta: {
      title: 'Zarządzanie recenzjami',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  /* NIEPRAWIDLOWY ADRES */

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/* KONFIGURACJA ROUTERA */

const router = createRouter({
  history: createWebHashHistory(
    import.meta.env.BASE_URL
  ),

  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.path === from.path) {
      return false
    }

    return {
      top: 0,
      left: 0,
      behavior: 'auto'
    }
  }
})

/* KONTROLA DOSTEPU */

router.beforeEach((to) => {
  const authStore = useAuthStore()

  /* STRONY WYMAGAJACE LOGOWANIA */

  if (
    to.meta.requiresAuth &&
    !authStore.isAuthenticated
  ) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  /* PANEL ADMINISTRATORA */

  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: 'home'
    }
  }

  /* STRONY DLA NIEZALOGOWANYCH */

  if (
    to.meta.guestOnly &&
    authStore.isAuthenticated
  ) {
    return {
      name: 'profile'
    }
  }

  return true
})

/* TYTUL STRONY */

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | Gamevers`
    : 'Gamevers — Twój świat gier'
})

export default router
