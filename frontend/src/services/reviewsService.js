
import api from './api'

// ========================================
// RECENZJE GRY - PUBLICZNE
// ========================================

// Pobieranie recenzji konkretnej gry
export function getGameReviews(gameId) {
  return api.get(
    `/games/${encodeURIComponent(gameId)}/reviews`
  )
}

// ========================================
// RECENZJE - ZALOGOWANY UŻYTKOWNIK
// ========================================

// Dodawanie recenzji do wybranej gry
export function addGameReview(gameId, data) {
  return api.post(
    `/games/${encodeURIComponent(gameId)}/reviews`,
    data
  )
}

// Edytowanie własnej recenzji
export function updateReview(reviewId, data) {
  return api.put(
    `/reviews/${encodeURIComponent(reviewId)}`,
    data
  )
}

// Usuwanie własnej recenzji
export function deleteReview(reviewId) {
  return api.delete(
    `/reviews/${encodeURIComponent(reviewId)}`
  )
}

// ========================================
// PANEL ADMINISTRATORA
// ========================================

// Pobieranie wszystkich recenzji
export function getAdminReviews() {
  return api.get('/admin/reviews')
}

// Usuwanie recenzji przez administratora
export function deleteAdminReview(reviewId) {
  return api.delete(
    `/admin/reviews/${encodeURIComponent(reviewId)}`
  )
}
