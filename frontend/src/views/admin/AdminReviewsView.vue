
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import * as reviewsService from '../../services/reviewsService'
import AppNotification from '../../components/ui/AppNotification.vue'

const reviews = ref([])
const loading = ref(false)
const deletingId = ref(null)

const error = ref('')
const successMessage = ref('')
const search = ref('')
const ratingFilter = ref('all')

const totalReviews = ref(null)
const hasMorePages = ref(false)

const filteredReviews = computed(() => {
  const query = search.value.trim().toLowerCase()

  return reviews.value.filter((review) => {
    const author = String(
      review.user?.name || ''
    ).toLowerCase()

    const gameTitle = String(
      review.game?.title || ''
    ).toLowerCase()

    const content = String(
      review.content || review.comment || ''
    ).toLowerCase()

    const matchesSearch =
      !query ||
      author.includes(query) ||
      gameTitle.includes(query) ||
      content.includes(query)

    const score = Number(review.rating)

    let matchesRating = true

    if (ratingFilter.value === 'high') {
      matchesRating = score >= 8
    } else if (ratingFilter.value === 'medium') {
      matchesRating = score >= 5 && score < 8
    } else if (ratingFilter.value === 'low') {
      matchesRating = score >= 1 && score < 5
    }

    return matchesSearch && matchesRating
  })
})

const averageRating = computed(() => {
  const ratings = reviews.value
    .map((review) => Number(review.rating))
    .filter((value) =>
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 10
    )

  if (ratings.length === 0) return null

  const sum = ratings.reduce(
    (total, value) => total + value,
    0
  )

  return (sum / ratings.length).toFixed(1)
})

function getAuthor(review) {
  return review.user?.name || 'Nieznany użytkownik'
}

function getGameTitle(review) {
  return review.game?.title || 'Nieznana gra'
}

function getContent(review) {
  return review.content || review.comment || ''
}

function formatDate(value) {
  if (!value) return 'Brak daty'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Brak daty'
  }

  return date.toLocaleDateString('pl-PL')
}

function extractReviews(response) {
  const payload = response.data

  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      hasMore: false
    }
  }

  const items = Array.isArray(payload?.data)
    ? payload.data
    : []

  const totalValue =
    payload?.meta?.total ?? payload?.total

  const total =
    totalValue !== undefined &&
    totalValue !== null &&
    Number.isFinite(Number(totalValue))
      ? Number(totalValue)
      : null

  const lastPage = Number(
    payload?.meta?.last_page ??
    payload?.last_page
  )

  const currentPage = Number(
    payload?.meta?.current_page ??
    payload?.current_page ??
    1
  )

  const hasMore =
    Number.isFinite(lastPage) &&
    lastPage > currentPage

  return { items, total, hasMore }
}

async function loadReviews() {
  loading.value = true
  error.value = ''

  try {
    const response =
      await reviewsService.getAdminReviews()

    const result = extractReviews(response)

    reviews.value = result.items
    totalReviews.value = result.total
    hasMorePages.value = result.hasMore
  } catch (err) {
    reviews.value = []
    totalReviews.value = null
    hasMorePages.value = false

    error.value =
      err.response?.status === 403
        ? 'Nie masz uprawnień do przeglądania recenzji.'
        : 'Nie udało się pobrać recenzji.'
  } finally {
    loading.value = false
  }
}

async function removeReview(review) {
  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć recenzję użytkownika "${getAuthor(review)}"?`
  )

  if (!confirmed) return

  deletingId.value = review.id
  error.value = ''
  successMessage.value = ''

  try {
    await reviewsService.deleteAdminReview(
      review.id
    )

    successMessage.value =
      'Recenzja została usunięta.'

    await loadReviews()
  } catch (err) {
    if (err.response?.status === 403) {
      error.value =
        'Nie masz uprawnień do usunięcia recenzji.'
    } else if (err.response?.status === 401) {
      error.value =
        'Sesja wygasła. Zaloguj się ponownie.'
    } else {
      error.value =
        'Nie udało się usunąć recenzji.'
    }
  } finally {
    deletingId.value = null
  }
}

onMounted(loadReviews)
</script>

<template>
  <main class="admin-reviews-page">
    <div class="admin-container">

      <RouterLink to="/admin" class="back-link">
        ← Panel administratora
      </RouterLink>

      <header class="page-header">
        <div>
          <span class="eyebrow">
            GAMEVERS ADMIN
          </span>

          <h1>Moderacja recenzji</h1>

          <p>
            Przeglądaj opinie użytkowników
            i zarządzaj treściami społeczności.
          </p>
        </div>

        <button
          type="button"
          class="refresh-button"
          :disabled="loading"
          @click="loadReviews"
        >
          {{
            loading
              ? 'Odświeżanie...'
              : 'Odśwież'
          }}
        </button>
      </header>

      <!-- Statystyki -->
      <section class="stats-grid">
        <article class="stat-card">
          <span>Łącznie recenzji</span>

          <strong>
            {{
              totalReviews === null
                ? '—'
                : totalReviews
            }}
          </strong>
        </article>

        <article class="stat-card">
          <span>Średnia ocena pobranych recenzji</span>

          <strong>
            {{
              averageRating === null
                ? '—'
                : `${averageRating}/10`
            }}
          </strong>
        </article>
      </section>

      <!-- Nowe powiadomienia -->
      <div
        v-if="successMessage"
        class="notification-wrapper"
      >
        <AppNotification
          type="success"
          :message="successMessage"
          @close="successMessage = ''"
        />
      </div>

      <div
        v-if="error"
        class="notification-wrapper"
      >
        <AppNotification
          type="error"
          :message="error"
          @close="error = ''"
        />
      </div>

      <!-- Filtry -->
      <section class="filters-panel">
        <div class="filter-field search-field">
          <label for="review-search">
            Wyszukaj recenzję
          </label>

          <input
            id="review-search"
            v-model="search"
            type="search"
            placeholder="Autor, gra lub treść..."
          />
        </div>

        <div class="filter-field">
          <label for="rating-filter">
            Ocena
          </label>

          <select
            id="rating-filter"
            v-model="ratingFilter"
          >
            <option value="all">
              Wszystkie oceny
            </option>

            <option value="high">
              Wysokie (8–10)
            </option>

            <option value="medium">
              Średnie (5–7)
            </option>

            <option value="low">
              Niskie (1–4)
            </option>
          </select>
        </div>
      </section>

      <!-- Lista recenzji -->
      <section class="reviews-section">
        <div class="section-heading">
          <h2>Lista recenzji</h2>

          <span>
            Wyświetlane: {{ filteredReviews.length }}
          </span>
        </div>

        <div
          v-if="loading"
          class="state-message"
        >
          Ładowanie recenzji...
        </div>

        <div
          v-else-if="error"
          class="state-message"
        >
          Nie można wyświetlić listy recenzji.
        </div>

        <div
          v-else-if="reviews.length === 0"
          class="state-message"
        >
          Nie ma jeszcze recenzji do moderacji.
        </div>

        <div
          v-else-if="filteredReviews.length === 0"
          class="state-message"
        >
          Brak recenzji pasujących do filtrów.
        </div>

        <div v-else class="reviews-list">
          <article
            v-for="review in filteredReviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-top">
              <div class="review-author">
                <div
                  class="author-avatar"
                  aria-hidden="true"
                >
                  {{
                    getAuthor(review)
                      .charAt(0)
                      .toUpperCase()
                  }}
                </div>

                <div>
                  <h3>{{ getAuthor(review) }}</h3>

                  <p>
                    {{ getGameTitle(review) }}
                  </p>
                </div>
              </div>

              <span class="rating-badge">
                ★ {{ review.rating }}/10
              </span>
            </div>

            <p class="review-content">
              {{ getContent(review) }}
            </p>

            <div class="review-footer">
              <span class="review-date">
                {{ formatDate(review.created_at) }}
              </span>

              <div class="review-actions">
                <RouterLink
                  v-if="review.game?.id"
                  :to="`/games/${review.game.id}`"
                  class="view-link"
                >
                  Zobacz grę
                </RouterLink>

                <button
                  type="button"
                  class="delete-button"
                  :disabled="deletingId !== null"
                  @click="removeReview(review)"
                >
                  {{
                    deletingId === review.id
                      ? 'Usuwanie...'
                      : 'Usuń recenzję'
                  }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <p
          v-if="hasMorePages"
          class="pagination-notice"
        >
          API zwróciło tylko część recenzji.
          Obsługę kolejnych stron dodamy
          podczas integracji paginacji.
        </p>
      </section>

    </div>
  </main>
</template>

<style scoped>
.admin-reviews-page {
  min-height: 80vh;
  padding: 50px 20px 90px;
  color: #F8FAFC;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 28px;
  color: #A78BFA;
  font-size: 14px;
  text-decoration: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 12px 0;
  font-size: 34px;
}

.page-header p {
  color: #94A3B8;
  line-height: 1.7;
}

.refresh-button {
  padding: 12px 18px;
  background: #24203C;
  border: 1px solid #443B73;
  border-radius: 9px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.stat-card span {
  color: #94A3B8;
  font-size: 13px;
}

.stat-card strong {
  font-size: 29px;
}

.notification-wrapper {
  margin-bottom: 20px;
}

.filters-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 18px;
  padding: 24px;
  margin-bottom: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-field label {
  color: #CBD5E1;
  font-size: 13px;
  font-weight: 600;
}

.filter-field input,
.filter-field select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 14px;
}

.filter-field input:focus,
.filter-field select:focus {
  outline: none;
  border-color: #8B5CF6;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: 23px;
}

.section-heading span {
  color: #94A3B8;
  font-size: 13px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  padding: 25px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.review-top,
.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 13px;
}

.author-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: #8B5CF6;
  border-radius: 12px;
  font-weight: 800;
}

.review-author h3 {
  margin: 0 0 7px;
  font-size: 15px;
}

.review-author p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
}

.rating-badge {
  color: #FBBF24;
  font-size: 16px;
  font-weight: 800;
  white-space: nowrap;
}

.review-content {
  margin: 24px 0;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.review-footer {
  padding-top: 18px;
  border-top: 1px solid #293244;
}

.review-date {
  color: #94A3B8;
  font-size: 12px;
}

.review-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.view-link {
  color: #22D3EE;
  font-size: 13px;
  text-decoration: none;
}

.delete-button {
  padding: 11px 16px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 8px;
  color: #FCA5A5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state-message {
  padding: 35px 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #94A3B8;
  text-align: center;
}

.pagination-notice {
  margin-top: 20px;
  color: #FBBF24;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 800px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters-panel {
    grid-template-columns: 1fr;
  }

  .review-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .admin-reviews-page {
    padding: 35px 16px 70px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-panel,
  .review-card {
    padding: 18px;
  }

  .review-top {
    align-items: flex-start;
  }
}
</style>
