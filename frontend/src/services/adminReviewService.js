import api from './api'

// Pobieranie wszystkich recenzji
export async function getAdminReviews(params = {}) {
  const response = await api.get(
    '/admin/reviews',
    { params }
  )

  return response.data
}

// Pobieranie statystyk
export async function getAdminReviewStats() {
  const response = await api.get(
    '/admin/reviews/stats'
  )

  return response.data
}

// Usuwanie recenzji
export async function deleteAdminReview(reviewId) {
  const response = await api.delete(
    `/admin/reviews/${reviewId}`
  )

  return response.data
}
