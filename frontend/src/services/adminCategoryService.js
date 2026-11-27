
import api from './api'

// POBIERANIE LISTY KATEGORII

export async function getAdminCategories(params = {}) {
  const response = await api.get('/admin/categories', {
    params
  })

  return response.data
}

// POBIERANIE STATYSTYK

export async function getAdminCategoryStats() {
  const response = await api.get('/admin/categories/stats')

  return response.data
}

// POBIERANIE JEDNEJ KATEGORII

export async function getAdminCategory(categoryId) {
  const response = await api.get(
    `/admin/categories/${categoryId}`
  )

  return response.data
}

// DODAWANIE KATEGORII

export async function createAdminCategory(categoryData) {
  const response = await api.post(
    '/admin/categories',
    categoryData
  )

  return response.data
}

// EDYTOWANIE KATEGORII

export async function updateAdminCategory(
  categoryId,
  categoryData
) {
  const response = await api.patch(
    `/admin/categories/${categoryId}`,
    categoryData
  )

  return response.data
}

// USUWANIE KATEGORII

export async function deleteAdminCategory(categoryId) {
  const response = await api.delete(
    `/admin/categories/${categoryId}`
  )

  return response.data
}
