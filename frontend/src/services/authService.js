
import axios from 'axios'
import api from './api'

// Osobny klient do sesyjnego logowania Laravel Sanctum.
// Wymaga poprawnej konfiguracji CORS i cookies.
const authApi = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    'http://localhost:8000',

  withCredentials: true,

  withXSRFToken: true,

  headers: {
    Accept: 'application/json'
  },

  timeout: 10000
})

// Pobranie ciasteczka CSRF przed logowaniem.
export async function initializeCsrf() {
  await authApi.get('/sanctum/csrf-cookie')
}

// Rejestracja nowego użytkownika.
export async function register(userData) {
  await initializeCsrf()

  const response = await authApi.post(
    '/register',
    userData
  )

  return response.data
}

// Logowanie użytkownika.
export async function login(credentials) {
  await initializeCsrf()

  const response = await authApi.post(
    '/login',
    credentials
  )

  return response.data
}

// Wylogowanie użytkownika.
export async function logout() {
  const response = await authApi.post('/logout')

  return response.data
}

// Pobranie danych zalogowanego użytkownika.
export async function getCurrentUser() {
  const response = await authApi.get('/api/user')

  return response.data
}
