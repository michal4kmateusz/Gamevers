
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import * as gamesService from '../services/gamesService'
import * as libraryService from '../services/libraryService'

const route = useRoute()
const authStore = useAuthStore()

const game = ref(null)
const loading = ref(true)
const error = ref('')

const selectedStatus = ref('wishlist')
const adding = ref(false)
const successMessage = ref('')
const actionError = ref('')

const statuses = [
  { value: 'wishlist', label: 'Chcę zagrać' },
  { value: 'playing', label: 'Gram' },
  { value: 'completed', label: 'Ukończone' },
  { value: 'dropped', label: 'Porzucone' }
]

const gameId = computed(() => route.params.id)

const genres = computed(() => {
  const value = game.value?.genres

  if (!Array.isArray(value)) return []

  return value.map((genre) =>
    typeof genre === 'string'
      ? genre
      : genre.name
  ).filter(Boolean)
})

const platforms = computed(() => {
  const value = game.value?.platforms

  if (!Array.isArray(value)) return []

  return value.map((platform) =>
    typeof platform === 'string'
      ? platform
      : platform.name
  ).filter(Boolean)
})

const rating = computed(() => {
  const value = game.value?.average_rating

  if (value === null || value === undefined) {
    return 'Brak ocen'
  }

  const number = Number(value)

  return Number.isFinite(number)
    ? number.toFixed(1) + '/10'
    : 'Brak ocen'
})

async function loadGame() {
  loading.value = true
  error.value = ''
  game.value = null
  successMessage.value = ''
  actionError.value = ''

  try {
    const response = await gamesService.getGame(
      gameId.value
    )

    game.value = response.data?.data ?? response.data
  } catch (err) {
    error.value = 'Nie udało się pobrać szczegółów gry.'
  } finally {
    loading.value = false
  }
}

async function addToLibrary() {
  if (!authStore.isAuthenticated || !game.value) {
    return
  }

  adding.value = true
  successMessage.value = ''
  actionError.value = ''

  try {
    await libraryService.addLibraryGame(
      game.value.id,
      selectedStatus.value
    )

    successMessage.value =
      'Gra została dodana do Twojej biblioteki.'
  } catch (err) {
    if (err.response?.status === 409 ||
        err.response?.status === 422) {
      actionError.value =
        'Nie udało się dodać gry. Możliwe, że jest już w bibliotece.'
    } else {
      actionError.value =
        'Nie udało się dodać gry do biblioteki.'
    }
  } finally {
    adding.value = false
  }
}

watch(gameId, loadGame, { immediate: true })
</script>

<template>
  <main class="details-page">
    <div class="details-container">

      <div v-if="loading" class="state-message">
        Ładowanie szczegółów gry...
      </div>

      <div
        v-else-if="error"
        class="state-message error"
        role="alert"
      >
        <p>{{ error }}</p>
        <button type="button" @click="loadGame">
          Spróbuj ponownie
        </button>
      </div>

      <template v-else-if="game">
        <RouterLink to="/games" class="back-link">
          ← Wróć do katalogu
        </RouterLink>

        <div class="game-layout">
          <div class="game-main">

            <div class="cover-container">
              <img
                v-if="game.cover_url"
                :src="game.cover_url"
                :alt="`Okładka gry ${game.title}`"
                class="game-cover"
              />

              <div v-else class="cover-placeholder">
                🎮
              </div>
            </div>

            <div class="game-information">
              <span class="eyebrow">
                SZCZEGÓŁY GRY
              </span>

              <h1>{{ game.title }}</h1>

              <div class="tags">
                <span
                  v-for="genre in genres"
                  :key="genre"
                  class="tag"
                >
                  {{ genre }}
                </span>
              </div>

              <p class="description">
                {{
                  game.description ||
                  'Opis tej gry nie jest jeszcze dostępny.'
                }}
              </p>

              <div class="metadata">
                <div class="metadata-row">
                  <span>Ocena społeczności</span>
                  <strong>{{ rating }}</strong>
                </div>

                <div class="metadata-row">
                  <span>Data premiery</span>
                  <strong>
                    {{ game.release_date || 'Brak danych' }}
                  </strong>
                </div>

                <div class="metadata-row">
                  <span>Producent</span>
                  <strong>
                    {{ game.developer || 'Brak danych' }}
                  </strong>
                </div>

                <div class="metadata-row">
                  <span>Wydawca</span>
                  <strong>
                    {{ game.publisher || 'Brak danych' }}
                  </strong>
                </div>

                <div class="metadata-row">
                  <span>Platformy</span>
                  <strong>
                    {{
                      platforms.length
                        ? platforms.join(', ')
                        : 'Brak danych'
                    }}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel biblioteki -->
          <aside class="library-panel">
            <h2>Twoja biblioteka</h2>

            <p>
              Zapisz grę i śledź swój postęp.
            </p>

            <template v-if="authStore.isAuthenticated">
              <label for="game-status">
                Wybierz status
              </label>

              <select
                id="game-status"
                v-model="selectedStatus"
                :disabled="adding"
              >
                <option
                  v-for="status in statuses"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>

              <button
                type="button"
                class="primary-button"
                :disabled="adding"
                @click="addToLibrary"
              >
                {{
                  adding
                    ? 'Dodawanie...'
                    : 'Dodaj do biblioteki'
                }}
              </button>

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

              <RouterLink
                to="/library"
                class="library-link"
              >
                Przejdź do mojej biblioteki
              </RouterLink>
            </template>

            <template v-else>
              <p class="login-notice">
                Zaloguj się, aby dodawać gry
                do własnej kolekcji.
              </p>

              <RouterLink
                :to="{
                  name: 'login',
                  query: { redirect: route.fullPath }
                }"
                class="primary-button"
              >
                Zaloguj się
              </RouterLink>
            </template>
          </aside>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.details-page {
  min-height: 80vh;
  padding: 50px 20px 90px;
  color: #F8FAFC;
}

.details-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 28px;
  color: #A78BFA;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 28px;
  align-items: start;
}

.game-main {
  min-width: 0;
}

.cover-container {
  width: 100%;
  max-height: 460px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.game-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 70px;
}

.game-information {
  padding-top: 30px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.game-information h1 {
  margin: 12px 0 18px;
  font-size: 36px;
  line-height: 1.2;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 24px;
}

.tag {
  padding: 8px 12px;
  background: #22203A;
  border: 1px solid #443B73;
  border-radius: 7px;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
}

.description {
  color: #CBD5E1;
  line-height: 1.8;
  margin-bottom: 30px;
  white-space: pre-line;
}

.metadata {
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  padding: 10px 22px;
}

.metadata-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #293244;
}

.metadata-row:last-child {
  border-bottom: none;
}

.metadata-row span {
  color: #94A3B8;
  font-size: 14px;
}

.metadata-row strong {
  text-align: right;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.library-panel {
  position: sticky;
  top: 100px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.library-panel h2 {
  margin: 0 0 10px;
  font-size: 21px;
}

.library-panel > p {
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.library-panel label {
  display: block;
  margin: 24px 0 9px;
  color: #CBD5E1;
  font-size: 13px;
  font-weight: 600;
}

.library-panel select {
  width: 100%;
  padding: 12px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font-size: 13px;
}

.primary-button {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 14px 12px;
  box-sizing: border-box;
  background: #8B5CF6;
  border: none;
  border-radius: 9px;
  color: #FFFFFF;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:hover:not(:disabled) {
  background: #7C3AED;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.library-link {
  display: block;
  margin-top: 18px;
  color: #A78BFA;
  text-align: center;
  font-size: 13px;
  text-decoration: none;
}

.login-notice {
  margin-top: 22px;
}

.feedback {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.6;
}

.feedback.success {
  color: #6EE7B7;
}

.feedback.error {
  color: #FCA5A5;
}

.state-message {
  padding: 60px 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  color: #94A3B8;
  text-align: center;
}

.state-message.error {
  color: #FCA5A5;
}

.state-message button {
  margin-top: 15px;
  padding: 12px 20px;
  background: #8B5CF6;
  border: none;
  border-radius: 8px;
  color: #FFFFFF;
  cursor: pointer;
}

@media (max-width: 900px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .library-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .details-page {
    padding: 35px 16px 70px;
  }

  .game-information h1 {
    font-size: 28px;
  }

  .cover-container {
    aspect-ratio: 4 / 3;
  }

  .metadata-row {
    flex-direction: column;
    gap: 7px;
  }

  .metadata-row strong {
    text-align: left;
  }
}
</style>
