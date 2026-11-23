
import api from './api'

// ========================================
// PUBLICZNY KATALOG GIER
// ========================================

/**
 * Pobiera listę gier.
 *
 * Możliwe parametry:
 * search - wyszukiwanie po tytule
 * genre - filtrowanie po gatunku
 * platform - filtrowanie po platformie
 * sort - sortowanie
 * page - numer strony
 * per_page - liczba wyników
 *
 * Przykład:
 * getGames({
 *   search: 'Minecraft',
 *   sort: 'title',
 *   page: 1
 * })
 */
export function getGames(params = {}) {
  return api.get('/games', {
    params
  })
}

/**
 * Pobiera szczegóły jednej gry.
 *
 * Przykład:
 * getGame(15)
 */
export function getGame(gameId) {
  return api.get(
    `/games/${encodeURIComponent(gameId)}`
  )
}

// ========================================
// PANEL ADMINISTRATORA
// ========================================

/**
 * Dodaje nową grę.
 *
 * Wymaga uprawnień administratora.
 */
export function createGame(data) {
  return api.post('/admin/games', data)
}

/**
 * Aktualizuje istniejącą grę.
 *
 * Wymaga uprawnień administratora.
 */
export function updateGame(gameId, data) {
  return api.put(
    `/admin/games/${encodeURIComponent(gameId)}`,
    data
  )
}

/**
 * Usuwa grę z katalogu.
 *
 * Wymaga uprawnień administratora.
 */
export function deleteGame(gameId) {
  return api.delete(
    `/admin/games/${encodeURIComponent(gameId)}`
  )
}
