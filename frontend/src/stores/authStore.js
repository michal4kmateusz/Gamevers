
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getCurrentUser
} from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // Dane aktualnie zalogowanego użytkownika.
  const user = ref(null)

  // Stan pobierania danych.
  const loading = ref(false)

  // Informacja, czy sprawdzono już sesję.
  const initialized = ref(false)

  // Komunikat błędu.
  const error = ref(null)

  // Czy użytkownik jest zalogowany?
  const isAuthenticated = computed(() => {
    return user.value !== null
  })

  // Czy użytkownik jest administratorem?
  // Backend musi zwracać pole role.
  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  // Pobranie użytkownika na podstawie sesji.
  async function fetchUser() {
    loading.value = true
    error.value = null

    try {
      user.value = await getCurrentUser()
      return user.value
    } catch (err) {
      user.value = null

      if (err.response?.status !== 401) {
        error.value = 'Nie udało się pobrać danych użytkownika.'
      }

      return null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  // Logowanie użytkownika.
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
      error.value = 'Nie udało się zalogować.'

      throw err
    } finally {
      loading.value = false
    }
  }

  // Rejestracja użytkownika.
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
      error.value = 'Nie udało się utworzyć konta.'

      throw err
    } finally {
      loading.value = false
    }
  }

  // Wylogowanie użytkownika.
  async function logout() {
    loading.value = true
    error.value = null

    try {
      await logoutRequest()
      user.value = null
      initialized.value = true
    } catch (err) {
      error.value = 'Nie udało się wylogować.'
      throw err
    } finally {
      loading.value = false
    }
  }

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
