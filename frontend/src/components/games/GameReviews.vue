
<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

import {
  getReviews,
  getMyReview,
  addReview,
  updateReview,
  deleteReview
} from '../../services/reviewService'

const props = defineProps({
  gameId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['updated'])

const authStore = useAuthStore()

const reviews = ref([])
const averageRating = ref(null)
const reviewsCount = ref(0)

const loading = ref(false)
const saving = ref(false)

const error = ref('')
const success = ref('')

const rating = ref(8)
const comment = ref('')
const editingId = ref(null)

const currentPage = ref(1)
const lastPage = ref(1)

let requestVersion = 0

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated
})

function isOwner(review) {
  return authStore.user != null &&
    Number(review.user_id) === Number(authStore.user.id)
}

const ownReview = ref(null)
const ownReviewLoading = ref(false)
const ownReviewError = ref('')

let ownRequestVersion = 0

async function loadOwnReview() {
  const version = ++ownRequestVersion

  ownReview.value = null
  ownReviewError.value = ''
  ownReviewLoading.value = false

  if (!authStore.isAuthenticated) return

  ownReviewLoading.value = true

  try {
    const result = await getMyReview(props.gameId)

    if (version !== ownRequestVersion) return

    ownReview.value = result

  } catch (err) {
    if (version === ownRequestVersion) {
      ownReviewError.value = getErrorMessage(err)
    }
  } finally {
    if (version === ownRequestVersion) {
      ownReviewLoading.value = false
    }
  }
}

function resetForm() {
  rating.value = 8
  comment.value = ''
  editingId.value = null
}

function getErrorMessage(err) {
  const data = err.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || 'Wystapil blad. Sprobuj ponownie.'
}

async function loadReviews(page = 1) {
  const version = ++requestVersion

  loading.value = true
  error.value = ''

  try {
    const data = await getReviews(props.gameId, page)

    if (version !== requestVersion) return

    reviews.value = data.reviews?.data || []

    averageRating.value =
      data.average_rating != null
        ? Number(data.average_rating)
        : null

    reviewsCount.value = Number(data.reviews_count || 0)

    currentPage.value = data.reviews?.current_page || 1
    lastPage.value = data.reviews?.last_page || 1

  } catch (err) {
    if (version === requestVersion) {
      error.value = getErrorMessage(err)
    }
  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

async function submitReview() {
  if (
    !isAuthenticated.value ||
    saving.value ||
    ownReviewLoading.value ||
    ownReviewError.value
  ) return

  if (ownReview.value && editingId.value === null) return

  if (rating.value < 1 || rating.value > 10) {
    error.value = 'Ocena musi wynosic od 1 do 10.'
    return
  }

  const gameId = props.gameId

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    if (editingId.value !== null) {
      await updateReview(
        editingId.value,
        rating.value,
        comment.value
      )
    } else {
      await addReview(
        gameId,
        rating.value,
        comment.value
      )
    }

    if (gameId !== props.gameId) return

    success.value = editingId.value !== null
      ? 'Recenzja zostala zaktualizowana.'
      : 'Recenzja zostala dodana.'

    resetForm()

    await Promise.all([loadReviews(1), loadOwnReview()])

    emit('updated', gameId)

  } catch (err) {
    if (gameId === props.gameId) {
      error.value = getErrorMessage(err)
    }
  } finally {
    saving.value = false
  }
}

function startEditing(review) {
  if (!isOwner(review) || saving.value) return

  editingId.value = review.id
  rating.value = Number(review.rating)
  comment.value = review.comment || ''

  error.value = ''
  success.value = ''
}

async function removeReview(review) {
  if (!isOwner(review) || saving.value) return

  if (!window.confirm('Czy na pewno usunac recenzje?')) {
    return
  }

  const gameId = props.gameId

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await deleteReview(review.id)

    if (gameId !== props.gameId) return

    resetForm()

    await Promise.all([loadReviews(1), loadOwnReview()])

    success.value = 'Recenzja zostala usunieta.'

    emit('updated', gameId)

  } catch (err) {
    if (gameId === props.gameId) {
      error.value = getErrorMessage(err)
    }
  } finally {
    saving.value = false
  }
}

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString('pl-PL')
}

watch(
  () => props.gameId,
  () => {
    resetForm()
    reviews.value = []
    averageRating.value = null
    reviewsCount.value = 0
    success.value = ''
    loadReviews(1)
    loadOwnReview()
  },
  { immediate: true }
)

watch(
  () => authStore.user?.id,
  () => {
    resetForm()
    error.value = ''
    success.value = ''
    loadOwnReview()
  }
)
</script>

<template>
  <section class="game-reviews">

    <div class="reviews-header">
      <div>
        <span class="section-label">SPOŁECZNOŚĆ</span>
        <h2>Oceny i recenzje</h2>
        <p>Sprawdź opinie innych graczy.</p>
      </div>

      <div class="rating-summary">
        <span class="star">★</span>

        <div>
          <strong>
            {{
              averageRating !== null
                ? averageRating.toFixed(1) + '/10'
                : 'Brak ocen'
            }}
          </strong>

          <small>
            Liczba recenzji: {{ reviewsCount }}
          </small>
        </div>
      </div>
    </div>

    <div v-if="error" class="message error" role="alert">
      {{ error }}
    </div>

    <div v-if="success" class="message success" role="status">
      {{ success }}
    </div>

    <div v-if="ownReviewLoading" class="empty-state">
      Pobieranie Twojej recenzji...
    </div>

    <div v-else-if="ownReviewError" class="message error">
      {{ ownReviewError }}

      <button
        type="button"
        class="secondary-button"
        @click="loadOwnReview"
      >
        Sprobuj ponownie
      </button>
    </div>

    <!-- Formularz recenzji -->

    <form
      v-else-if="isAuthenticated && (!ownReview || editingId !== null)"
      class="review-form"
      @submit.prevent="submitReview"
    >
      <h3>
        {{ editingId !== null
          ? 'Edytuj recenzję'
          : 'Oceń tę grę' }}
      </h3>

      <p>Wybierz ocenę od 1 do 10.</p>

      <div class="rating-options">
        <button
          v-for="number in 10"
          :key="number"
          type="button"
          class="rating-button"
          :class="{ active: rating === number }"
          :aria-pressed="rating === number"
          :disabled="saving"
          @click="rating = number"
        >
          {{ number }}
        </button>
      </div>

      <div class="selected-rating">
        Twoja ocena:
        <strong>{{ rating }}/10</strong>
      </div>

      <textarea
        v-model="comment"
        placeholder="Napisz swoją opinię o grze..."
        aria-label="Treść recenzji"
        maxlength="2000"
        rows="5"
        :disabled="saving"
      ></textarea>

      <div class="character-count">
        {{ comment.length }}/2000
      </div>

      <div class="form-actions">
        <button
          class="primary-button"
          type="submit"
          :disabled="saving || loading"
        >
          {{
            saving
              ? 'Zapisywanie...'
              : editingId !== null
                ? 'Zapisz zmiany'
                : 'Dodaj recenzję'
          }}
        </button>

        <button
          v-if="editingId !== null"
          type="button"
          class="secondary-button"
          :disabled="saving"
          @click="resetForm"
        >
          Anuluj
        </button>
      </div>
    </form>

    <!-- Informacja dla niezalogowanych -->

    <div v-else-if="!isAuthenticated" class="login-notice">
      <h3>Dołącz do społeczności Gamevers</h3>

      <p>
        Zaloguj się, aby wystawić ocenę
        i podzielić się swoją opinią.
      </p>

      <RouterLink to="/login" class="primary-button">
        Zaloguj się
      </RouterLink>
    </div>

    <div v-else-if="ownReview" class="own-review-panel">

      <span class="section-label">TWOJA RECENZJA</span>

      <div class="review-top">
        <h3>Twoja opinia o grze</h3>

        <strong class="review-rating">
          ★ {{ ownReview.rating }}/10
        </strong>
      </div>

      <p class="review-comment">
        {{ ownReview.comment || 'Ocena bez komentarza.' }}
      </p>

      <small>
        {{ formatDate(ownReview.created_at) }}
      </small>

      <div class="review-actions">

        <button
          type="button"
          class="edit-button"
          :disabled="saving"
          @click="startEditing(ownReview)"
        >
          Edytuj
        </button>

        <button
          type="button"
          class="delete-button"
          :disabled="saving"
          @click="removeReview(ownReview)"
        >
          Usuń
        </button>

      </div>
    </div>

    <!-- Lista recenzji -->

    <div class="reviews-list">

      <h3>Opinie graczy ({{ reviewsCount }})</h3>

      <div v-if="loading" class="empty-state">
        Ładowanie recenzji...
      </div>

      <div v-else-if="reviews.length === 0" class="empty-state">
        <span class="empty-icon">☆</span>
        <h3>Brak recenzji</h3>
        <p>Bądź pierwszą osobą, która oceni tę grę.</p>
      </div>

      <article
        v-for="review in reviews"
        v-else
        :key="review.id"
        class="review-card"
      >
        <div class="review-top">

          <div class="review-author">

            <div class="avatar">
              {{ review.user?.name?.charAt(0)?.toUpperCase() || 'G' }}
            </div>

            <div>
              <strong>
                {{ review.user?.name || 'Gracz' }}
              </strong>

              <span v-if="isOwner(review)" class="own-label">
                Ty
              </span>

              <small>
                {{ formatDate(review.created_at) }}
              </small>
            </div>

          </div>

          <div class="review-rating">
            ★ {{ review.rating }}/10
          </div>

        </div>

        <p v-if="review.comment" class="review-comment">
          {{ review.comment }}
        </p>

        <div v-if="isOwner(review)" class="review-actions">

          <button
            class="edit-button"
            :disabled="saving"
            @click="startEditing(review)"
          >
            Edytuj
          </button>

          <button
            class="delete-button"
            :disabled="saving"
            @click="removeReview(review)"
          >
            Usuń
          </button>

        </div>

      </article>

    </div>

    <!-- Paginacja -->

    <div v-if="lastPage > 1" class="pagination">

      <button
        :disabled="currentPage <= 1 || loading || saving"
        @click="loadReviews(currentPage - 1)"
      >
        ← Poprzednia
      </button>

      <span>{{ currentPage }} / {{ lastPage }}</span>

      <button
        :disabled="currentPage >= lastPage || loading || saving"
        @click="loadReviews(currentPage + 1)"
      >
        Następna →
      </button>

    </div>

  </section>
</template>

<style scoped>

.own-review-panel {
  padding: 24px;
  margin-bottom: 28px;
  background: #201B36;
  border: 1px solid #8B5CF6;
  border-radius: 16px;
}

.own-review-panel small {
  color: #94A3B8;
}

.own-review-panel .review-actions {
  margin-top: 20px;
}

@media (max-width: 600px) {
  .own-review-panel {
    padding: 16px;
  }
}

.game-reviews {
  margin: 32px 0;
  padding: 28px;
  background: #111827;
  border: 1px solid #253047;
  border-radius: 20px;
  color: #f8fafc;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 28px;
}

.section-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #a78bfa;
}

h2 {
  margin: 8px 0;
  font-size: 28px;
}

h3 {
  margin: 0 0 12px;
}

p {
  color: #94a3b8;
  line-height: 1.6;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  background: #1b2335;
  border-radius: 14px;
}

.star {
  color: #facc15;
  font-size: 36px;
}

.rating-summary strong {
  display: block;
  font-size: 25px;
  color: #facc15;
}

.rating-summary small,
.review-author small {
  display: block;
  color: #94a3b8;
  margin-top: 5px;
}

.review-form,
.login-notice {
  padding: 24px;
  background: #151b2b;
  border: 1px solid #29334a;
  border-radius: 16px;
  margin-bottom: 30px;
}

.rating-options {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 8px;
  margin: 20px 0;
}

.rating-button {
  padding: 14px 0;
  border: 1px solid #34405a;
  background: #1e293b;
  color: #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.rating-button:hover,
.rating-button.active {
  background: #7c3aed;
  border-color: #a78bfa;
  color: white;
}

.selected-rating {
  margin-bottom: 16px;
  color: #94a3b8;
}

.selected-rating strong {
  color: #facc15;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 120px;
  padding: 16px;
  background: #0b0f19;
  border: 1px solid #34405a;
  border-radius: 12px;
  color: #f8fafc;
  font: inherit;
}

textarea:focus {
  outline: 2px solid #8b5cf6;
}

.character-count {
  margin: 8px 0 18px;
  color: #94a3b8;
  font-size: 12px;
  text-align: right;
}

.form-actions,
.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

.primary-button {
  background: #7c3aed;
  color: white;
}

.primary-button:hover {
  background: #6d28d9;
}

.secondary-button {
  background: #263247;
  color: #e2e8f0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 18px;
}

.error {
  background: #451a24;
  color: #fca5a5;
}

.success {
  background: #123524;
  color: #86efac;
}

.already-reviewed {
  padding: 16px;
  margin-bottom: 24px;
  background: #241b40;
  border-radius: 10px;
  color: #c4b5fd;
}

.reviews-list {
  display: grid;
  gap: 16px;
}

.review-card {
  padding: 22px;
  background: #151b2b;
  border: 1px solid #29334a;
  border-radius: 14px;
}

.review-top,
.review-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-top {
  justify-content: space-between;
  flex-wrap: wrap;
}

.review-author {
  min-width: 0;
  overflow-wrap: anywhere;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: #7c3aed;
  border-radius: 50%;
  font-weight: 800;
  color: white;
}

.own-label {
  margin-left: 8px;
  color: #a78bfa;
  font-size: 12px;
}

.review-rating {
  color: #facc15;
  font-size: 18px;
  font-weight: 800;
}

.review-comment {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: #cbd5e1;
  margin: 20px 0;
}

.review-actions {
  margin-top: 16px;
}

.edit-button,
.delete-button {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.edit-button {
  background: #30234e;
  color: #c4b5fd;
}

.delete-button {
  background: #451a24;
  color: #fca5a5;
}

.empty-state {
  text-align: center;
  padding: 36px 16px;
  color: #94a3b8;
}

.empty-icon {
  display: block;
  font-size: 48px;
  color: #8b5cf6;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #34405a;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .game-reviews {
    padding: 16px;
    border-radius: 14px;
  }

  .review-form,
  .review-card,
  .login-notice {
    padding: 16px;
  }

  .rating-options {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .rating-summary {
    width: 100%;
    box-sizing: border-box;
  }

  h2 {
    font-size: 23px;
  }
}
</style>
