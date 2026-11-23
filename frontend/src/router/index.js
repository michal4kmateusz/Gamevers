
import {
  createRouter,
  createWebHistory
} from 'vue-router'

import HomeView from '../views/HomeView.vue'
import GamesView from '../views/GamesView.vue'
import GameDetailsView from '../views/GameDetailsView.vue'
import LibraryView from '../views/LibraryView.vue'
import LoginView from '../views/LoginView.vue'

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
