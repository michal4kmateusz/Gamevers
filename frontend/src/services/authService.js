
import { http } from './api'

export async function getCsrfCookie() {
  await http.get('/sanctum/csrf-cookie')
}

export async function login(credentials) {
  await getCsrfCookie()

  const response = await http.post(
    '/login',
    credentials
  )

  return response.data
}

export async function register(userData) {
  await getCsrfCookie()

  const response = await http.post(
    '/register',
    userData
  )

  return response.data
}

export async function getCurrentUser() {
  const response = await http.get('/api/user')

  return response.data
}

export async function logout() {
  await getCsrfCookie()

  const response = await http.post('/logout')

  return response.data
}


