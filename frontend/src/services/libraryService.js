
import api from './api'

// Dostępne statusy gry w bibliotece
export const LIBRARY_STATUSES = {
  WISHLIST: 'wishlist',
  PLAYING: 'playing',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
}

// Pobieranie całej biblioteki użytkownika
export function getLibrary() {
  return api.get('/library')
}

// Dodawanie gry do biblioteki
export function addLibraryGame(gameId, status = 'wishlist') {
  return api.post('/library', {
    game_id: gameId,
    status
  })
}

// Pobieranie pojedynczego wpisu z biblioteki
export function getLibraryGame(gameId) {
  return api.get(`/library/${encodeURIComponent(gameId)}`)
}

// Aktualizacja statusu gry
export function updateLibraryGame(gameId, data) {
  return api.put(
    `/library/${encodeURIComponent(gameId)}`,
    data
  )
}

// Usuwanie gry z biblioteki
export function removeLibraryGame(gameId) {
  return api.delete(
    `/library/${encodeURIComponent(gameId)}`
  )
}
