
import api from './api'

// POBIERANIE LISTY UZYTKOWNIKOW

export async function getAdminUsers(params = {}) {
  const response = await api.get('/admin/users', {
    params
  })

  return response.data
}

// POBIERANIE STATYSTYK

export async function getAdminUserStats() {
  const response = await api.get('/admin/users/stats')

  return response.data
}

// POBIERANIE KONKRETNEGO UZYTKOWNIKA

export async function getAdminUser(userId) {
  const response = await api.get(
    `/admin/users/${userId}`
  )

  return response.data
}

// ZMIANA ROLI UZYTKOWNIKA

export async function updateAdminUserRole(userId, role) {
  const response = await api.patch(
    `/admin/users/${userId}/role`,
    {
      role
    }
  )

  return response.data
}
