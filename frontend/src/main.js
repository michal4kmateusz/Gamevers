
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

import './assets/styles/main.css'

async function initializeApp() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const authStore = useAuthStore(pinia)

  // Sprawdzenie sesji użytkownika przy starcie
  try {
    await authStore.fetchUser()
  } catch (error) {
    // Brak dostępnego backendu nie powinien
    // blokować wyświetlenia aplikacji.
    console.warn(
      'Nie udało się sprawdzić sesji użytkownika.',
      error
    )
  }

  app.mount('#app')
}

initializeApp()
