
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import * as reviewsService from '../../services/reviewsService'

const props = defineProps({
  gameId: {
    type: [Number, String],
    required: true
  }
})

const route = useRoute()
const authStore = useAuthStore()

const reviews = ref([])
const loading = ref(false)
const submitting = ref(false)
const processingId = ref(null)

const error = ref('')
const formError = ref('')
const successMessage = ref('')
const actionError = ref('')

const rating = ref(0)
const content = ref('')

const editingId = ref(null)
const editRating = ref(0)
const editContent = ref('')

const ratingOptions = Array.from(
  { length: 10 },
  (_, index) => index + 1
)

const isAuthenticated = computed(
  () => authStore.isAuthenticated
)

const currentUserId = computed(
  () => authStore.user?.id
)

const ownReview = computed(() => {
  if (currentUserId.value == null) return null

  return reviews.value.find(
    (review) =>
      String(review.user_id ?? review.user?.id) ===
      String(currentUserId.value)
  ) || null
})

function isOwnReview(review) {
  if (currentUserId.value == null) return false

  return String(
    review.user_id ?? review.user?.id
  ) === String(currentUserId.value)
}

function getAuthor(review) {
  return review.user?.name || 'Użytkownik'
}

function getRating(review) {
  const value = Number(review.rating)
  return Number.isFinite(value) ? value : 0
}

function getContent(review) {
  return review.content || review.comment || ''
}

function formatDate(date) {
  if (!date) return ''

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString('pl-PL')
}

function extractReviews(response) {
  const payload = response.data

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return []
}

async function loadReviews() {
  if (!props.gameId) return

  loading.value = true
  error.value = ''

  try {
    const response = await reviewsService.getGameReviews(
      props.gameId
    )

    reviews.value = extractReviews(response)
  } catch (err) {
    error.value =
      'Nie udało się pobrać recenzji tej gry.'
    reviews.value = []
  } finally {
    loading.value = false
  }
}

function validateReview(value, text) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 10
  ) {
    return 'Wybierz ocenę od 1 do 10.'
  }

  if (text.length < 10) {
    return 'Recenzja musi mieć minimum 10 znaków.'
  }

  if (text.length > 2000) {
    return 'Recenzja może mieć maksymalnie 2000 znaków.'
  }

  return ''
}

function getRequestError(err, defaultMessage) {
  const status = err.response?.status

  if (status === 401) {
    return 'Sesja wygasła. Zaloguj się ponownie.'
  }

  if (status === 403) {
    return 'Nie masz uprawnień do tej operacji.'
  }

  if (status === 422) {
    return 'Sprawdź poprawność podanych danych.'
  }

  return defaultMessage
}

async function submitReview() {
  formError.value = ''
  successMessage.value = ''

  if (!isAuthenticated.value) {
    formError.value = 'Zaloguj się, aby dodać recenzję.'
    return
  }

  if (ownReview.value) {
    formError.value = 'Masz już recenzję tej gry.'
    return
  }

  const text = content.value.trim()
  const validation = validateReview(rating.value, text)

  if (validation) {
    formError.value = validation
    return
  }

  submitting.value = true

  try {
    await reviewsService.addGameReview(
      props.gameId,
      {
        rating: rating.value,
        content: text
      }
    )

    rating.value = 0
    content.value = ''

    successMessage.value =
      'Twoja recenzja została opublikowana.'

    await loadReviews()
  } catch (err) {
    formError.value =
      err.response?.status === 409
        ? 'Dodałeś już recenzję tej gry.'
        : getRequestError(
            err,
            'Nie udało się opublikować recenzji.'
          )
  } finally {
    submitting.value = false
  }
}

function startEditing(review) {
  editingId.value = review.id
  editRating.value = getRating(review)
  editContent.value = getContent(review)
  actionError.value = ''
  successMessage.value = ''
}

function cancelEditing() {
  editingId.value = null
  editRating.value = 0
  editContent.value = ''
  actionError.value = ''
}

async function saveEdit(review) {
  if (!isOwnReview(review)) return

  const text = editContent.value.trim()
  const validation = validateReview(
    editRating.value,
    text
  )

  if (validation) {
    actionError.value = validation
    return
  }

  processingId.value = review.id
  actionError.value = ''
  successMessage.value = ''

  try {
    await reviewsService.updateReview(
      review.id,
      {
        rating: editRating.value,
        content: text
      }
    )

    cancelEditing()

    successMessage.value =
      'Recenzja została zaktualizowana.'

    await loadReviews()
  } catch (err) {
    actionError.value = getRequestError(
      err,
      'Nie udało się zapisać zmian.'
    )
  } finally {
    processingId.value = null
  }
}

async function removeReview(review) {
  if (!isOwnReview(review)) return

  const confirmed = window.confirm(
    'Czy na pewno chcesz usunąć swoją recenzję?'
  )

  if (!confirmed) return

  processingId.value = review.id
  actionError.value = ''
  successMessage.value = ''

  try {
    await reviewsService.deleteReview(review.id)

    if (editingId.value === review.id) {
      cancelEditing()
    }

    successMessage.value =
      'Recenzja została usunięta.'

    await loadReviews()
  } catch (err) {
    actionError.value = getRequestError(
      err,
      'Nie udało się usunąć recenzji.'
    )
  } finally {
    processingId.value = null
  }
}

watch(
  () => props.gameId,
  () => {
    reviews.value = []
    rating.value = 0
    content.value = ''
    editingId.value = null
    successMessage.value = ''
    formError.value = ''
    actionError.value = ''
    loadReviews()
  },
  { immediate: true }
)
</script>

<template>
  <section class="reviews-section">
    <div class="section-heading">
      <div>
        <span class="eyebrow">OPINIE SPOŁECZNOŚCI</span>
        <h2>Recenzje graczy</h2>
      </div>

      <span class="reviews-count">
        {{ reviews.length }} recenzji
      </span>
    </div>

    <!-- Komunikaty operacji -->
    <p
      v-if="successMessage"
      class="feedback success"
      role="status"
    >
      {{ successMessage }}
    </p>

    <p
      v-if="actionError"
      class="feedback error"
      role="alert"
    >
      {{ actionError }}
    </p>

    <!-- Formularz dodawania -->
    <div class="review-form-card">
      <h3>Oceń tę grę</h3>

      <template v-if="isAuthenticated">
        <p v-if="ownReview" class="info-message">
          Masz już recenzję tej gry.
          Możesz ją edytować lub usunąć poniżej.
        </p>

        <form v-else @submit.prevent="submitReview">
          <fieldset class="rating-fieldset">
            <legend>Twoja ocena</legend>

            <div class="rating-options">
              <label
                v-for="option in ratingOptions"
                :key="option"
                class="rating-option"
              >
                <input
                  v-model.number="rating"
                  type="radio"
                  name="game-rating"
                  :value="option"
                  :disabled="submitting"
                />

                <span>{{ option }}</span>
              </label>
            </div>
          </fieldset>

          <label for="review-content" class="content-label">
            Twoja recenzja
          </label>

          <textarea
            id="review-content"
            v-model="content"
            rows="5"
            minlength="10"
            maxlength="2000"
            placeholder="Co sądzisz o tej grze?"
            :disabled="submitting"
            required
          ></textarea>

          <div class="form-footer">
            <span class="character-count">
              {{ content.length }}/2000
            </span>

            <button
              type="submit"
              class="submit-button"
              :disabled="submitting"
            >
              {{
                submitting
                  ? 'Publikowanie...'
                  : 'Opublikuj recenzję'
              }}
            </button>
          </div>

          <p
            v-if="formError"
            class="feedback error"
            role="alert"
          >
            {{ formError }}
          </p>
        </form>
      </template>

      <div v-else class="login-notice">
        <p>
          Zaloguj się, aby wystawić ocenę
          i napisać własną recenzję.
        </p>

        <RouterLink
          :to="{
            name: 'login',
            query: { redirect: route.fullPath }
          }"
          class="login-button"
        >
          Zaloguj się
        </RouterLink>
      </div>
    </div>

    <!-- Lista recenzji -->
    <div class="reviews-list">
      <div v-if="loading" class="state-message">
        Ładowanie recenzji...
      </div>

      <div
        v-else-if="error"
        class="state-message error"
        role="alert"
      >
        <p>{{ error }}</p>

        <button type="button" @click="loadReviews">
          Spróbuj ponownie
        </button>
      </div>

      <div
        v-else-if="reviews.length === 0"
        class="state-message"
      >
        Ta gra nie ma jeszcze recenzji.
      </div>

      <template v-else>
        <article
          v-for="review in reviews"
          :key="review.id"
          class="review-card"
        >
          <div class="review-header">
            <div class="author">
              <div class="author-avatar">
                {{
                  getAuthor(review)
                    .charAt(0)
                    .toUpperCase()
                }}
              </div>

              <div>
                <strong>{{ getAuthor(review) }}</strong>
                <span>
                  {{ formatDate(review.created_at) }}
                </span>
              </div>
            </div>

            <span class="review-rating">
              ★ {{ getRating(review) }}/10
            </span>
          </div>

          <!-- Tryb edycji -->
          <form
            v-if="editingId === review.id"
            class="edit-form"
            @submit.prevent="saveEdit(review)"
          >
            <fieldset class="rating-fieldset">
              <legend>Zmień ocenę</legend>

              <div class="rating-options">
                <label
                  v-for="option in ratingOptions"
                  :key="option"
                  class="rating-option"
                >
                  <input
                    v-model.number="editRating"
                    type="radio"
                    name="edit-rating"
                    :value="option"
                    :disabled="processingId !== null"
                  />

                  <span>{{ option }}</span>
                </label>
              </div>
            </fieldset>

            <label
              for="edit-content"
              class="content-label"
            >
              Edytuj recenzję
            </label>

            <textarea
              id="edit-content"
              v-model="editContent"
              rows="5"
              minlength="10"
              maxlength="2000"
              :disabled="processingId !== null"
              required
            ></textarea>

            <div class="review-actions">
              <button
                type="submit"
                class="submit-button"
                :disabled="processingId !== null"
              >
                Zapisz zmiany
              </button>

              <button
                type="button"
                class="secondary-button"
                :disabled="processingId !== null"
                @click="cancelEditing"
              >
                Anuluj
              </button>
            </div>
          </form>

          <!-- Zwykły widok recenzji -->
          <template v-else>
            <p class="review-content">
              {{ getContent(review) }}
            </p>

            <div
              v-if="isOwnReview(review)"
              class="review-actions"
            >
              <button
                type="button"
                class="secondary-button"
                :disabled="processingId !== null"
                @click="startEditing(review)"
              >
                Edytuj
              </button>

              <button
                type="button"
                class="delete-button"
                :disabled="processingId !== null"
                @click="removeReview(review)"
              >
                Usuń
              </button>
            </div>
          </template>
        </article>
      </template>
    </div>
  </section>
</template>

<style scoped>
.reviews-section {
  margin-top: 60px;
  color: #F8FAFC;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.section-heading h2 {
  margin: 10px 0 0;
  font-size: 28px;
}

.reviews-count {
  color: #94A3B8;
  font-size: 13px;
}

.review-form-card,
.review-card {
  padding: 26px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.review-form-card {
  margin-bottom: 28px;
}

.review-form-card h3 {
  margin: 0 0 22px;
  font-size: 20px;
}

.rating-fieldset {
  padding: 0;
  margin: 0 0 24px;
  border: none;
}

.rating-fieldset legend,
.content-label {
  display: block;
  margin-bottom: 12px;
  color: #CBD5E1;
  font-size: 14px;
  font-weight: 600;
}

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rating-option {
  position: relative;
  cursor: pointer;
}

.rating-option input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.rating-option span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #CBD5E1;
  font-size: 14px;
  font-weight: 700;
}

.rating-option input:checked + span {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: #FFFFFF;
}

.rating-option input:focus-visible + span {
  outline: 2px solid #22D3EE;
  outline-offset: 3px;
}

.review-form-card textarea,
.edit-form textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 15px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
}

.review-form-card textarea:focus,
.edit-form textarea:focus {
  outline: none;
  border-color: #8B5CF6;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
}

.character-count {
  color: #94A3B8;
  font-size: 12px;
}

.submit-button,
.login-button {
  display: inline-block;
  padding: 13px 20px;
  background: #8B5CF6;
  border: none;
  border-radius: 9px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button,
.delete-button {
  padding: 11px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.secondary-button {
  background: #24203C;
  border: 1px solid #443B73;
  color: #C4B5FD;
}

.delete-button {
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  color: #FCA5A5;
}

.secondary-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.feedback {
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.6;
}

.feedback.error {
  color: #FCA5A5;
}

.feedback.success {
  color: #6EE7B7;
}

.info-message,
.login-notice p {
  color: #94A3B8;
  line-height: 1.7;
}

.login-button {
  margin-top: 12px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: #8B5CF6;
  border-radius: 12px;
  color: #FFFFFF;
  font-weight: 800;
}

.author strong,
.author span {
  display: block;
}

.author strong {
  font-size: 14px;
}

.author span {
  margin-top: 5px;
  color: #94A3B8;
  font-size: 12px;
}

.review-rating {
  color: #FBBF24;
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
}

.review-content {
  margin: 18px 0 0;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.edit-form {
  margin-top: 22px;
}

.state-message {
  padding: 36px 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #94A3B8;
  text-align: center;
}

.state-message.error {
  color: #FCA5A5;
  border-color: #7F1D1D;
}

.state-message button {
  margin-top: 12px;
  padding: 10px 16px;
  background: #8B5CF6;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
}

@media (max-width: 600px) {
  .reviews-section {
    margin-top: 40px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading h2 {
    font-size: 24px;
  }

  .review-form-card,
  .review-card {
    padding: 18px;
  }

  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-button {
    width: 100%;
  }

  .review-header {
    align-items: flex-start;
  }
}
</style>
