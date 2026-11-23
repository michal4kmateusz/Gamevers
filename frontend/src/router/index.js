
import {
  createRouter,
  createWebHistory
} from 'vue-router'

const HomeView = {
  template: `
    <main class="home-page">
      <h1>Witaj w Gamevers!</h1>
      <p>Odkrywaj, oceniaj i zapisuj swoje ulubione gry.</p>
    </main>
  `
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
