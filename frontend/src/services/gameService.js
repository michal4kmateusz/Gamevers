
import api from './api'
import { normalizeGame } from '../utils/gameMapper'

export async function getGames(params = {}) {
  const response = await api.get('/games', {
    params
  })

  const result = response.data

  return {
    ...result,
    data: result.data.map(normalizeGame)
  }
}

export async function getGame(slug) {
  const response = await api.get(
    `/games/${encodeURIComponent(slug)}`
  )

  const game = response.data.data ?? response.data

  return normalizeGame(game)
}

