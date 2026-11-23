
import api from './api'

// Pobranie listy gier.
// params może zawierać np. search, genre, sort.
export async function getGames(params = {}) {
  const response = await api.get('/games', {
    params
  })

  return response.data
}

// Pobranie szczegółów pojedynczej gry.
export async function getGameById(id) {
  const response = await api.get(`/games/${id}`)

  return response.data
}

// Dodanie nowej gry przez administratora.
export async function createGame(gameData) {
  const response = await api.post('/admin/games', gameData)

  return response.data
}

// Edycja istniejącej gry.
export async function updateGame(id, gameData) {
  const response = await api.put(
    `/admin/games/${id}`,
    gameData
  )

  return response.data
}

// Usunięcie gry.
export async function deleteGame(id) {
  const response = await api.delete(
    `/admin/games/${id}`
  )

  return response.data
}
