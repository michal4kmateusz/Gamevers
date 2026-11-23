
import api from './api'

// Statusy obsługiwane przez bibliotekę.
export const LIBRARY_STATUSES = {
  WISHLIST: 'wishlist',
  PLAYING: 'playing',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
}

// Pobranie biblioteki zalogowanego użytkownika.
// Opcjonalnie można filtrować po statusie.
export async function getLibrary(params = {}) {
  const response = await api.get('/library', {
    params
  })

  return response.data
}

// Dodanie gry do biblioteki.
// Przykład: addToLibrary(1, 'wishlist')
export async function addToLibrary(gameId, status) {
  const response = await api.post('/library', {
    game_id: gameId,
    status
  })

  return response.data
}

// Zmiana statusu gry w bibliotece.
// Przykład: updateLibraryStatus(1, 'completed')
export async function updateLibraryStatus(gameId, status) {
  const response = await api.put(
    `/library/${gameId}`,
    { status }
  )

  return response.data
}

// Usunięcie gry z biblioteki.
export async function removeFromLibrary(gameId) {
  const response = await api.delete(
    `/library/${gameId}`
  )

  return response.data
}

// Sprawdzenie, czy gra znajduje się w bibliotece.
// Backend zwróci informację o statusie gry.
export async function getLibraryGame(gameId) {
  const response = await api.get(
    `/library/${gameId}`
  )

  return response.data
}
