
import api from './api'

// Wszystkie recenzje konkretnej gry
export async function getReviews(gameId, page = 1) {
  const response = await api.get(
    `/games/${gameId}/reviews`,
    {
      params: { page }
    }
  )

  return response.data
}

// Wlasna recenzja konkretnej gry
export async function getMyReview(gameId) {
  const response = await api.get(
    `/games/${gameId}/reviews/mine`
  )

  return response.data.review
}

// Wszystkie recenzje zalogowanego uzytkownika
export async function getMyReviews(page = 1) {
  const response = await api.get(
    '/my-reviews',
    {
      params: { page }
    }
  )

  return response.data
}

// Dodawanie recenzji
export async function addReview(
  gameId,
  rating,
  comment = ''
) {
  const response = await api.post(
    `/games/${gameId}/reviews`,
    { rating, comment }
  )

  return response.data
}

// Edytowanie recenzji
export async function updateReview(
  reviewId,
  rating,
  comment = ''
) {
  const response = await api.patch(
    `/reviews/${reviewId}`,
    { rating, comment }
  )

  return response.data
}

// Usuwanie recenzji
export async function deleteReview(reviewId) {
  const response = await api.delete(
    `/reviews/${reviewId}`
  )

  return response.data
}


