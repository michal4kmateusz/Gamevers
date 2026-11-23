
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import { useAuthStore } from '../stores/authStore'

// Widoki publiczne
import HomeView from '../views/HomeView.vue'
import GamesView from '../views/GamesView.vue'
import GameDetailsView from '../views/GameDetailsView.vue'

// Widoki użytkownika
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import LibraryView from '../views/LibraryView.vue'

// Widoki administratora
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminGamesView from '../views/admin/AdminGamesView.vue'
import AdminReviewsView from '../views/admin/AdminReviewsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/games',
    name: 'games',
    component: GamesView
  },
  {
    path: '/games/:id',
    name: 'game-details',
    component: GameDetailsView,
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      guestOnly: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      guestOnly: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/library',
    name: 'library',
    component: LibraryView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/games',
    name: 'admin-games',
    component: AdminGamesView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/reviews',
    name: 'admin-reviews',
    component: AdminReviewsView,
    meta: {
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
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Ochrona tras
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Strony wymagające zalogowania
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  // Strony tylko dla administratora
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return {
      name: 'home'
    }
  }

  // Zalogowany użytkownik nie musi
  // ponownie otwierać logowania lub rejestracji
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return {
      name: 'profile'
    }
  }

  return true
})

export default router
