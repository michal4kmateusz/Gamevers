import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

import './assets/styles/main.css'

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  // Uruchomienie Pinia
  app.use(pinia)

  // Pobranie magazynu uwierzytelniania
  const authStore = useAuthStore(pinia)

  // Przywrócenie sesji użytkownika
  try {
    await authStore.fetchUser()
  } catch (error) {
    console.warn(
      'Nie udało się sprawdzić sesji użytkownika.',
      error
    )
  }

  // Uruchomienie routera po sprawdzeniu sesji
  app.use(router)

  // Oczekiwanie na gotowość routera
  await router.isReady()

  // Wyświetlenie aplikacji
  app.mount('#app')
}

initializeApp()
