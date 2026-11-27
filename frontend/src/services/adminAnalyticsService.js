import api from './api'

export async function getAnalyticsOverview() {
  const response = await api.get('/admin/analytics/overview')
  return response.data
}

export async function getAnalyticsActivity(days = 7) {
  const response = await api.get('/admin/analytics/activity', {
    params: { days }
  })
  return response.data
}

export async function getPopularGames() {
  const response = await api.get('/admin/analytics/popular-games')
  return response.data
}

export async function getLibraryStatuses() {
  const response = await api.get('/admin/analytics/library-statuses')
  return response.data
}

export async function getPopularCategories() {
  const response = await api.get('/admin/analytics/popular-categories')
  return response.data
}

export async function getRatingDistribution() {
  const response = await api.get('/admin/analytics/ratings')
  return response.data
}
