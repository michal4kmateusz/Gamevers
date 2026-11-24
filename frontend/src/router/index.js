
import {
  createRouter,
  createWebHashHistory
} from 'vue-router'

import { useAuthStore } from '../stores/authStore'

import HomeView from '../views/HomeView.vue'
import GamesView from '../views/GamesView.vue'
import GameDetailsView from '../views/GameDetailsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import LibraryView from '../views/LibraryView.vue'

import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminGamesView from '../views/admin/AdminGamesView.vue'
import AdminReviewsView from '../views/admin/AdminReviewsView.vue'

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

  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Logowanie',
      guestOnly: true
    }
  },

  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Rejestracja',
      guestOnly: true
    }
  },

  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Mój profil',
      requiresAuth: true
    }
  },

  {
    path: '/library',
    name: 'library',
    component: LibraryView,
    meta: {
      title: 'Moja biblioteka',
      requiresAuth: true
    }
  },

  {
    path: '/admin',
    name: 'admin',
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
      title: 'Moderacja recenzji',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return {
      top: 0,
      left: 0
    }
  }
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

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

  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: 'home'
    }
  }

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

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | Gamevers`
    : 'Gamevers'
})

export default router
