
import api from './api'

// Pobranie recenzji konkretnej gry.
export async function getGameReviews(gameId, params = {}) {
  const response = await api.get(
    `/games/${gameId}/reviews`,
    { params }
  )

  return response.data
}

// Dodanie recenzji do gry.
// Wymaga zalogowanego użytkownika.
export async function createReview(gameId, reviewData) {
  const response = await api.post(
    `/games/${gameId}/reviews`,
    reviewData
  )

  return response.data
}

// Edycja własnej recenzji.
export async function updateReview(reviewId, reviewData) {
  const response = await api.put(
    `/reviews/${reviewId}`,
    reviewData
  )

  return response.data
}

// Usunięcie własnej recenzji.
export async function deleteReview(reviewId) {
  const response = await api.delete(
    `/reviews/${reviewId}`
  )

  return response.data
}

// Pobranie wszystkich recenzji dla administratora.
export async function getAdminReviews(params = {}) {
  const response = await api.get(
    '/admin/reviews',
    { params }
  )

  return response.data
}

// Usunięcie recenzji przez administratora.
export async function deleteAdminReview(reviewId) {
  const response = await api.delete(
    `/admin/reviews/${reviewId}`
  )

  return response.data
}
