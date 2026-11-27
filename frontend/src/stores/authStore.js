import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLibraryStore } from './libraryStore'

import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getCurrentUser
} from '../services/authService'

export const useAuthStore = defineStore('auth', () => {

  /* STAN */

  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref(null)

  const libraryStore = useLibraryStore()

  /* UPRAWNIENIA */

  const isAuthenticated = computed(() => {
    return user.value !== null
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  /* SYNCHRONIZACJA BIBLIOTEKI */

  watch(
    () => user.value?.id ?? null,
    async (userId) => {

      libraryStore.clearLibrary()

      if (userId !== null) {
        await libraryStore.fetchLibrary()
      }

    },
    { flush: 'sync' }
  )

  /* POBIERANIE UZYTKOWNIKA */

  async function fetchUser() {
    loading.value = true
    error.value = null

    try {
      user.value = await getCurrentUser()

      return user.value

    } catch (err) {
      user.value = null

      libraryStore.clearLibrary()

      if (err.response?.status !== 401) {
        error.value =
          'Nie udało się pobrać danych użytkownika.'
      }

      return null

    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /* LOGOWANIE */

  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      await loginRequest(credentials)

      const currentUser = await getCurrentUser()

      user.value = currentUser
      initialized.value = true

      return currentUser

    } catch (err) {
      user.value = null
      libraryStore.clearLibrary()

      error.value =
        'Nie udało się zalogować.'

      throw err

    } finally {
      loading.value = false
    }
  }

  /* REJESTRACJA */

  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      await registerRequest(userData)

      const currentUser = await getCurrentUser()

      user.value = currentUser
      initialized.value = true

      return currentUser

    } catch (err) {
      user.value = null
      libraryStore.clearLibrary()

      error.value =
        'Nie udało się utworzyć konta.'

      throw err

    } finally {
      loading.value = false
    }
  }

  /* WYLOGOWANIE */

  async function logout() {
    loading.value = true
    error.value = null

    try {
      await logoutRequest()

      user.value = null
      initialized.value = true

      libraryStore.clearLibrary()

    } catch (err) {
      error.value =
        'Nie udało się wylogować.'

      throw err

    } finally {
      loading.value = false
    }
  }

  /* EKSPORT */

  return {
    user,
    loading,
    initialized,
    error,

    isAuthenticated,
    isAdmin,

    fetchUser,
    login,
    register,
    logout
  }
})
