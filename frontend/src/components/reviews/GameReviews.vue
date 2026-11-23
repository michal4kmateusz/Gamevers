
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
const error = ref('')
const formError = ref('')
const successMessage = ref('')

const rating = ref(0)
const content = ref('')

const ratingOptions = Array.from(
  { length: 10 },
  (_, index) => index + 1
)

const isAuthenticated = computed(
  () => authStore.isAuthenticated
)

function getReviewId(review) {
  return review.id
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

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleDateString('pl-PL')
}

async function loadReviews() {
  if (!props.gameId) return

  loading.value = true
  error.value = ''

  try {
    const response = await reviewsService.getGameReviews(
      props.gameId
    )

    const payload = response.data

    reviews.value = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : []
  } catch (err) {
    error.value =
      'Nie udało się pobrać recenzji tej gry.'
    reviews.value = []
  } finally {
    loading.value = false
  }
}

async function submitReview() {
  formError.value = ''
  successMessage.value = ''

  if (!isAuthenticated.value) {
    formError.value =
      'Musisz się zalogować, aby dodać recenzję.'
    return
  }

  if (rating.value < 1 || rating.value > 10) {
    formError.value =
      'Wybierz ocenę od 1 do 10.'
    return
  }

  const text = content.value.trim()

  if (text.length < 10) {
    formError.value =
      'Recenzja musi mieć minimum 10 znaków.'
    return
  }

  if (text.length > 2000) {
    formError.value =
      'Recenzja może mieć maksymalnie 2000 znaków.'
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
    if (err.response?.status === 409) {
      formError.value =
        'Dodałeś już recenzję tej gry.'
    } else if (err.response?.status === 422) {
      formError.value =
        'Sprawdź poprawność recenzji.'
    } else if (err.response?.status === 401) {
      formError.value =
        'Sesja wygasła. Zaloguj się ponownie.'
    } else {
      formError.value =
        'Nie udało się opublikować recenzji.'
    }
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.gameId,
  () => {
    reviews.value = []
    rating.value = 0
    content.value = ''
    successMessage.value = ''
    formError.value = ''
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

    <!-- Formularz dodawania recenzji -->
    <div class="review-form-card">
      <h3>Oceń tę grę</h3>

      <template v-if="isAuthenticated">
        <form @submit.prevent="submitReview">
          <fieldset class="rating-fieldset">
            <legend>Twoja ocena</legend>

            <div class="rating-options">
              <label
                v-for="option in ratingOptions"
                :key="option"
                class="rating-option"
                :class="{ selected: rating === option }"
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

            <p class="rating-help">
              Wybierz ocenę od 1 do 10.
            </p>
          </fieldset>

          <label
            for="review-content"
            class="content-label"
          >
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

          <p
            v-if="successMessage"
            class="feedback success"
            role="status"
          >
            {{ successMessage }}
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
        <p>
          Ta gra nie ma jeszcze recenzji.
          Bądź pierwszą osobą, która ją oceni!
        </p>
      </div>

      <article
        v-for="review in !loading && !error ? reviews : []"
        :key="getReviewId(review)"
        class="review-card"
      >
        <div class="review-header">
          <div class="author">
            <div class="author-avatar">
              {{ getAuthor(review).charAt(0).toUpperCase() }}
            </div>

            <div>
              <strong>{{ getAuthor(review) }}</strong>
              <span>{{ formatDate(review.created_at) }}</span>
            </div>
          </div>

          <span class="review-rating">
            ★ {{ getRating(review) }}/10
          </span>
        </div>

        <p class="review-content">
          {{ getContent(review) }}
        </p>
      </article>
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

.rating-help {
  margin-top: 10px;
  color: #94A3B8;
  font-size: 12px;
}

.review-form-card textarea {
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

.review-form-card textarea:focus {
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

.submit-button:hover:not(:disabled),
.login-button:hover {
  background: #7C3AED;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin: 16px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.feedback.error {
  color: #FCA5A5;
}

.feedback.success {
  color: #6EE7B7;
}

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
