import api from './api'

// Pobieranie listy gier
export async function getAdminGames(params = {}) {
  const response = await api.get(
    '/admin/games',
    { params }
  )

  return response.data
}

// Pobieranie statystyk katalogu
export async function getAdminGameStats() {
  const response = await api.get(
    '/admin/games/stats'
  )

  return response.data
}

// Pobieranie szczegółów gry
export async function getAdminGame(gameId) {
  const response = await api.get(
    `/admin/games/${gameId}`
  )

  return response.data
}

// Dodawanie nowej gry
export async function createAdminGame(gameData) {
  const response = await api.post(
    '/admin/games',
    gameData
  )

  return response.data
}

// Edytowanie istniejącej gry
export async function updateAdminGame(gameId, gameData) {
  const response = await api.patch(
    `/admin/games/${gameId}`,
    gameData
  )

  return response.data
}

// Aktywowanie i dezaktywowanie gry
export async function updateAdminGameStatus(gameId, isActive) {
  const response = await api.patch(
    `/admin/games/${gameId}/status`,
    {
      is_active: isActive
    }
  )

  return response.data
}
