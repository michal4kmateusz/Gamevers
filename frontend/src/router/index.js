
import {
  createRouter,
  createWebHistory
} from 'vue-router'

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
    meta: {
      title: 'Szczegóły gry'
    }
  },
  {
    path: '/library',
    name: 'library',
    component: LibraryView,
    meta: {
      title: 'Moja biblioteka'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Logowanie'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Rejestracja'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Mój profil'
    }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboardView,
    meta: {
      title: 'Panel administratora'
    }
  },
  {
    path: '/admin/games',
    name: 'admin-games',
    component: AdminGamesView,
    meta: {
      title: 'Zarządzanie grami'
    }
  },
  {
    path: '/admin/reviews',
    name: 'admin-reviews',
    component: AdminReviewsView,
    meta: {
      title: 'Moderacja recenzji'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Gamevers'} | Gamevers`
})

export default router
