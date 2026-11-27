import api from './api'

// Pobieranie biblioteki użytkownika.
export async function getFavorites() {
  const response = await api.get('/favorites')
  return response.data
}

// Dodawanie gry do biblioteki.
export async function addFavorite(gameId, status = 'wishlist') {
  const response = await api.post(`/favorites/${gameId}`, {
    status
  })

  return response.data
}

// Aktualizacja statusu gry.
export async function updateFavorite(gameId, status) {
  const response = await api.patch(`/favorites/${gameId}`, {
    status
  })

  return response.data
}

// Usuwanie gry z biblioteki.
export async function removeFavorite(gameId) {
  const response = await api.delete(`/favorites/${gameId}`)
  return response.data
}

