
<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/authStore'
import { useLibraryStore } from '../stores/libraryStore'

import {
  getMyReviews,
  updateReview,
  deleteReview
} from '../services/reviewService'

const router = useRouter()
const authStore = useAuthStore()
const libraryStore = useLibraryStore()

/* DANE UZYTKOWNIKA */

const user = computed(() => authStore.user)

const username = computed(() => {
  return user.value?.name || 'Użytkownik'
})

const email = computed(() => {
  return user.value?.email || 'Brak adresu e-mail'
})

const avatarLetter = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  return authStore.isAdmin
    ? 'Administrator Gamevers'
    : 'Użytkownik Gamevers'
})

/* STATYSTYKI */

const gamesCount = computed(() => {
  return libraryStore.library?.length || 0
})

const reviewsCount = ref(null)

/* RECENZJE */

const reviews = ref([])
const loading = ref(false)
const saving = ref(false)

const error = ref('')
const success = ref('')

const currentPage = ref(1)
const lastPage = ref(1)

let requestVersion = 0

/* EDYCJA RECENZJI */

const editingId = ref(null)
const editRating = ref(8)
const editComment = ref('')

/* OBRAZKI */

const failedImages = ref({})

function markImageFailed(id) {
  failedImages.value[id] = true
}

/* OBSLUGA BLEDOW */

function getErrorMessage(err) {
  const data = err.response?.data

  if (data?.errors) {
    return Object.values(data.errors)
      .flat()
      .join(' ')
  }

  return data?.message ||
    'Wystąpił błąd. Spróbuj ponownie.'
}

/* POBIERANIE RECENZJI */

async function loadReviews(page = 1) {
  const version = ++requestVersion

  if (!authStore.isAuthenticated) {
    reviews.value = []
    reviewsCount.value = null
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await getMyReviews(page)

    if (version !== requestVersion) return

    reviews.value = data.data || []

    reviewsCount.value = Number(data.total || 0)

    currentPage.value = data.current_page || 1
    lastPage.value = data.last_page || 1

    failedImages.value = {}

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

/* ROZPOCZECIE EDYCJI */

function startEditing(review) {
  if (saving.value || loading.value) return

  editingId.value = review.id
  editRating.value = Number(review.rating)
  editComment.value = review.comment || ''

  error.value = ''
  success.value = ''
}

/* ANULOWANIE EDYCJI */

function cancelEditing() {
  editingId.value = null
  editRating.value = 8
  editComment.value = ''
}

/* ZAPIS ZMIAN */

async function saveReview() {
  if (
    saving.value ||
    editingId.value === null ||
    !authStore.isAuthenticated
  ) return

  if (
    !Number.isInteger(editRating.value) ||
    editRating.value < 1 ||
    editRating.value > 10
  ) {
    error.value = 'Ocena musi wynosić od 1 do 10.'
    return
  }

  const userId = user.value?.id

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await updateReview(
      editingId.value,
      editRating.value,
      editComment.value
    )

    if (userId !== user.value?.id) return

    cancelEditing()

    success.value = 'Recenzja została zaktualizowana.'

    await loadReviews(1)

  } catch (err) {
    if (userId === user.value?.id) {
      error.value = getErrorMessage(err)
    }
  } finally {
    saving.value = false
  }
}

/* USUWANIE RECENZJI */

async function removeReview(review) {
  if (
    saving.value ||
    loading.value ||
    !authStore.isAuthenticated
  ) return

  const confirmed = window.confirm(
    `Usunąć recenzję gry ${review.game?.title || ''}?`
  )

  if (!confirmed) return

  const userId = user.value?.id

  saving.value = true
  error.value = ''
  success.value = ''

  try {
    await deleteReview(review.id)

    if (userId !== user.value?.id) return

    cancelEditing()

    const page =
      reviews.value.length === 1 &&
      currentPage.value > 1
        ? currentPage.value - 1
        : currentPage.value

    success.value = 'Recenzja została usunięta.'

    await loadReviews(page)

  } catch (err) {
    if (userId === user.value?.id) {
      error.value = getErrorMessage(err)
    }
  } finally {
    saving.value = false
  }
}

/* PAGINACJA */

function changePage(page) {
  if (
    page < 1 ||
    page > lastPage.value ||
    loading.value ||
    saving.value
  ) return

  cancelEditing()
  loadReviews(page)
}

/* FORMATOWANIE DATY */

function formatDate(date) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/* WYLOGOWANIE */

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/')
  } catch {
    error.value = 'Nie udało się wylogować.'
  }
}

/* ZMIANA UZYTKOWNIKA */

watch(
  () => user.value?.id,
  () => {
    reviews.value = []
    reviewsCount.value = null

    currentPage.value = 1
    lastPage.value = 1

    error.value = ''
    success.value = ''

    cancelEditing()
    loadReviews(1)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  requestVersion++
})
</script>

<template>
  <main class="profile-page">
    <div class="profile-container">

      <!-- NAGLOWEK -->

      <div class="page-heading">
        <span class="eyebrow">TWOJE KONTO</span>

        <h1>Mój profil</h1>

        <p>
          Zarządzaj swoim kontem i odkrywaj
          możliwości Gamevers.
        </p>
      </div>

      <!-- KARTA UZYTKOWNIKA -->

      <section class="profile-card">

        <div class="profile-header">

          <div class="avatar">
            {{ avatarLetter }}
          </div>

          <div class="user-info">
            <h2>{{ username }}</h2>

            <p class="user-email">
              {{ email }}
            </p>

            <span class="role-label">
              {{ userRole }}
            </span>
          </div>

        </div>

        <!-- STATYSTYKI -->

        <div class="profile-stats">

          <div class="stat-card">
            <span class="stat-icon">🎮</span>

            <strong>
              {{ libraryStore.loading ? '—' : gamesCount }}
            </strong>

            <span>Gry w bibliotece</span>
          </div>

          <div class="stat-card">
            <span class="stat-icon">⭐</span>

            <strong>
              {{ reviewsCount ?? '—' }}
            </strong>

            <span>Opublikowane recenzje</span>
          </div>

        </div>

      </section>

      <!-- MOJE KONTO -->

      <section class="profile-section">

        <h2>Moje konto</h2>

        <div class="action-grid">

          <RouterLink
            to="/library"
            class="action-card"
          >
            <span class="action-icon">🎮</span>

            <div>
              <h3>Moja biblioteka</h3>
              <p>
                Przeglądaj zapisane gry
                i zarządzaj ich statusami.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            to="/games"
            class="action-card"
          >
            <span class="action-icon">🔍</span>

            <div>
              <h3>Odkrywaj gry</h3>
              <p>
                Znajdź nowe tytuły
                i dodaj je do biblioteki.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="action-card"
          >
            <span class="action-icon">⚙️</span>

            <div>
              <h3>Panel administratora</h3>
              <p>
                Zarządzaj grami,
                użytkownikami i recenzjami.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

        </div>
      </section>

      <!-- MOJE RECENZJE -->

      <section class="profile-section">

        <div class="section-heading">

          <div>
            <span class="eyebrow">TWOJA AKTYWNOŚĆ</span>

            <h2>Moje recenzje</h2>

            <p class="section-description">
              Przeglądaj i zarządzaj swoimi opiniami.
            </p>
          </div>

          <span class="count-label">
            {{ reviewsCount ?? '—' }} recenzji
          </span>

        </div>

        <!-- KOMUNIKATY -->

        <div
          v-if="error"
          class="message error"
          role="alert"
        >
          {{ error }}

          <button
            type="button"
            class="secondary-button"
            :disabled="loading || saving"
            @click="loadReviews(currentPage)"
          >
            Odśwież listę
          </button>
        </div>

        <div
          v-if="success"
          class="message success"
          role="status"
        >
          {{ success }}
        </div>

        <!-- LADOWANIE -->

        <div v-if="loading" class="empty-state">
          Wczytywanie recenzji...
        </div>

        <!-- BRAK RECENZJI -->

        <div
          v-else-if="!reviews.length && !error"
          class="empty-state"
        >
          <span class="empty-icon">☆</span>

          <h3>Nie masz jeszcze recenzji</h3>

          <p>
            Wybierz grę z katalogu
            i podziel się swoją opinią.
          </p>

          <RouterLink
            to="/games"
            class="primary-button"
          >
            Przeglądaj gry →
          </RouterLink>
        </div>

        <!-- LISTA RECENZJI -->

        <div v-else class="reviews-list">

          <article
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >

            <div class="review-main">

              <!-- OKLADKA -->

              <div class="review-cover">

                <img
                  v-if="
                    review.game?.thumbnail &&
                    !failedImages[review.id]
                  "
                  :src="review.game.thumbnail"
                  :alt="review.game.title"
                  @error="markImageFailed(review.id)"
                />

                <div v-else class="cover-placeholder">
                  GAMEVERS
                </div>

              </div>

              <!-- INFORMACJE -->

              <div class="review-content">

                <div class="review-heading">

                  <h3>
                    {{ review.game?.title || 'Nieznana gra' }}
                  </h3>

                  <span class="review-rating">
                    ★ {{ review.rating }}/10
                  </span>

                </div>

                <span class="review-date">
                  {{ formatDate(review.updated_at) }}
                </span>

                <p class="review-comment">
                  {{ review.comment || 'Ocena bez komentarza.' }}
                </p>

                <RouterLink
                  v-if="
                    review.game?.slug &&
                    Number(review.game?.is_active)
                  "
                  :to="`/games/${review.game.slug}`"
                  class="game-link"
                >
                  Zobacz grę →
                </RouterLink>

                <span v-else class="inactive-label">
                  Gra niedostępna w katalogu
                </span>

              </div>

            </div>

            <!-- PRZYCISKI -->

            <div
              v-if="editingId !== review.id"
              class="review-actions"
            >

              <button
                type="button"
                class="edit-button"
                :disabled="saving"
                @click="startEditing(review)"
              >
                Edytuj recenzję
              </button>

              <button
                type="button"
                class="delete-button"
                :disabled="saving"
                @click="removeReview(review)"
              >
                Usuń
              </button>

            </div>

            <!-- FORMULARZ EDYCJI -->

            <form
              v-else
              class="edit-form"
              @submit.prevent="saveReview"
            >

              <h3>Edytuj swoją recenzję</h3>

              <div class="rating-options">

                <button
                  v-for="number in 10"
                  :key="number"
                  type="button"
                  class="rating-button"
                  :class="{
                    active: editRating === number
                  }"
                  :aria-pressed="editRating === number"
                  :disabled="saving"
                  @click="editRating = number"
                >
                  {{ number }}
                </button>

              </div>

              <p class="selected-rating">
                Twoja ocena:
                <strong>{{ editRating }}/10</strong>
              </p>

              <textarea
                v-model="editComment"
                maxlength="2000"
                rows="5"
                placeholder="Twoja opinia o grze..."
                aria-label="Treść recenzji"
                :disabled="saving"
              ></textarea>

              <div class="character-count">
                {{ editComment.length }}/2000
              </div>

              <div class="review-actions">

                <button
                  type="submit"
                  class="primary-button"
                  :disabled="saving"
                >
                  {{
                    saving
                      ? 'Zapisywanie...'
                      : 'Zapisz zmiany'
                  }}
                </button>

                <button
                  type="button"
                  class="secondary-button"
                  :disabled="saving"
                  @click="cancelEditing"
                >
                  Anuluj
                </button>

              </div>

            </form>

          </article>

        </div>

        <!-- PAGINACJA -->

        <div v-if="lastPage > 1" class="pagination">

          <button
            type="button"
            :disabled="
              currentPage <= 1 ||
              loading ||
              saving
            "
            @click="changePage(currentPage - 1)"
          >
            ← Poprzednia
          </button>

          <span>
            {{ currentPage }} / {{ lastPage }}
          </span>

          <button
            type="button"
            :disabled="
              currentPage >= lastPage ||
              loading ||
              saving
            "
            @click="changePage(currentPage + 1)"
          >
            Następna →
          </button>

        </div>

      </section>

      <!-- INFORMACJE O KONCIE -->

      <section class="account-section">

        <h2>Informacje o koncie</h2>

        <div class="account-details">

          <div class="detail-row">
            <span>Nazwa użytkownika</span>
            <strong>{{ username }}</strong>
          </div>

          <div class="detail-row">
            <span>Adres e-mail</span>
            <strong>{{ email }}</strong>
          </div>

          <div class="detail-row">
            <span>Rola</span>
            <strong>{{ userRole }}</strong>
          </div>

        </div>

      </section>

      <!-- WYLOGOWANIE -->

      <button
        type="button"
        class="logout-button"
        :disabled="authStore.loading || saving"
        @click="handleLogout"
      >
        {{
          authStore.loading
            ? 'Wylogowywanie...'
            : 'Wyloguj się'
        }}
      </button>

    </div>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: 80vh;
  padding: 60px 20px 90px;
  color: #F8FAFC;
}

.profile-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-heading {
  margin-bottom: 32px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 12px 0;
  font-size: 36px;
}

.page-heading p,
.section-description {
  color: #94A3B8;
  line-height: 1.7;
}

.profile-card {
  padding: 32px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
  margin-bottom: 36px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #8B5CF6;
  color: #FFFFFF;
  font-size: 34px;
  font-weight: 800;
}

.user-info {
  min-width: 0;
}

.user-info h2 {
  margin: 0 0 8px;
  font-size: 25px;
  overflow-wrap: anywhere;
}

.user-email {
  color: #94A3B8;
  margin: 0 0 10px;
  overflow-wrap: anywhere;
}

.role-label {
  color: #A78BFA;
  font-size: 13px;
  font-weight: 700;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: center;
}

.stat-icon {
  font-size: 25px;
}

.stat-card strong {
  font-size: 28px;
}

.stat-card span:last-child {
  color: #94A3B8;
  font-size: 13px;
}

.profile-section,
.account-section {
  margin-bottom: 36px;
}

.profile-section h2,
.account-section h2 {
  margin-bottom: 20px;
  font-size: 23px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  color: #F8FAFC;
  text-decoration: none;
  transition: border-color 0.2s;
}

.action-card:hover {
  border-color: #8B5CF6;
}

.action-icon {
  font-size: 28px;
}

.action-card div {
  flex: 1;
}

.action-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.action-card p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.action-arrow {
  color: #A78BFA;
  font-size: 22px;
}

/* RECENZJE */

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 8px 0;
}

.section-description {
  margin: 0;
  font-size: 13px;
}

.count-label {
  padding: 8px 14px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 8px;
  color: #C4B5FD;
  font-size: 13px;
}

.reviews-list {
  display: grid;
  gap: 18px;
}

.review-card {
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.review-main {
  display: flex;
  align-items: flex-start;
  gap: 22px;
}

.review-cover {
  width: 200px;
  aspect-ratio: 460 / 215;
  flex-shrink: 0;
  background: #201B36;
  border-radius: 10px;
  overflow: hidden;
}

.review-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.review-content {
  flex: 1;
  min-width: 0;
}

.review-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.review-heading h3 {
  margin: 0;
  font-size: 20px;
  overflow-wrap: anywhere;
}

.review-rating {
  padding: 6px 10px;
  background: #30291A;
  border-radius: 7px;
  color: #FACC15;
  font-weight: 800;
  white-space: nowrap;
}

.review-date {
  display: block;
  margin-top: 10px;
  color: #94A3B8;
  font-size: 12px;
}

.review-comment {
  color: #CBD5E1;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.game-link {
  color: #C4B5FD;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.game-link:hover {
  text-decoration: underline;
}

.inactive-label {
  color: #94A3B8;
  font-size: 12px;
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

/* PRZYCISKI */

.primary-button,
.secondary-button,
.edit-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background: #7C3AED;
  color: #FFFFFF;
}

.primary-button:hover {
  background: #6D28D9;
}

.secondary-button {
  background: #263247;
  color: #E2E8F0;
}

.edit-button {
  background: #30234E;
  color: #C4B5FD;
  border-color: #44306B;
}

.delete-button {
  background: #451A24;
  color: #FCA5A5;
  border-color: #7F1D1D;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* FORMULARZ EDYCJI */

.edit-form {
  margin-top: 24px;
  padding: 22px;
  background: #0B0F19;
  border: 1px solid #44306B;
  border-radius: 12px;
}

.edit-form h3 {
  margin: 0 0 18px;
}

.rating-options {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 8px;
}

.rating-button {
  padding: 12px 0;
  background: #1E293B;
  border: 1px solid #34405A;
  border-radius: 8px;
  color: #CBD5E1;
  font-weight: 700;
  cursor: pointer;
}

.rating-button.active,
.rating-button:hover {
  background: #7C3AED;
  border-color: #A78BFA;
  color: #FFFFFF;
}

.selected-rating {
  color: #94A3B8;
  font-size: 13px;
}

.selected-rating strong {
  color: #FACC15;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  background: #111827;
  border: 1px solid #34405A;
  border-radius: 10px;
  color: #F8FAFC;
  resize: vertical;
  font: inherit;
}

textarea:focus {
  outline: 2px solid #8B5CF6;
}

.character-count {
  margin-top: 8px;
  color: #94A3B8;
  font-size: 12px;
  text-align: right;
}

/* KOMUNIKATY */

.message {
  padding: 15px;
  margin-bottom: 18px;
  border-radius: 10px;
}

.message .secondary-button {
  margin-top: 10px;
}

.message.error {
  background: #451A24;
  color: #FCA5A5;
}

.message.success {
  background: #123524;
  color: #86EFAC;
}

.empty-state {
  padding: 40px 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  text-align: center;
  color: #94A3B8;
}

.empty-icon {
  font-size: 50px;
  color: #A78BFA;
}

.empty-state h3 {
  color: #F8FAFC;
}

.empty-state .primary-button {
  margin-top: 15px;
}

/* PAGINACJA */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 24px;
}

.pagination button {
  padding: 10px 14px;
  background: #151B2B;
  border: 1px solid #34405A;
  border-radius: 8px;
  color: #F8FAFC;
  cursor: pointer;
}

/* INFORMACJE O KONCIE */

.account-details {
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  padding: 10px 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid #293244;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: #94A3B8;
}

.detail-row strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.logout-button {
  padding: 14px 24px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 10px;
  color: #FCA5A5;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.logout-button:hover:not(:disabled) {
  background: #4C1D2A;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #A78BFA;
  outline-offset: 3px;
}

/* TELEFONY */

@media (max-width: 700px) {
  .profile-page {
    padding: 40px 16px 70px;
  }

  .page-heading h1 {
    font-size: 29px;
  }

  .profile-card {
    padding: 22px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    gap: 6px;
  }

  .detail-row strong {
    text-align: left;
  }

  .review-card {
    padding: 16px;
  }

  .review-main {
    flex-direction: column;
    gap: 16px;
  }

  .review-cover {
    width: 100%;
  }

  .review-content {
    width: 100%;
  }

  .rating-options {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .edit-form {
    padding: 15px;
  }

  .stat-card {
    padding: 16px;
  }
}

@media (max-width: 380px) {
  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
