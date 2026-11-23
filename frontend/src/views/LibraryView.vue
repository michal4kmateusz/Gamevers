
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import * as libraryService from '../services/libraryService'

const games = ref([])
const loading = ref(true)
const error = ref('')
const actionError = ref('')
const activeFilter = ref('all')
const processingId = ref(null)

const filters = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'wishlist', label: 'Chcę zagrać' },
  { value: 'playing', label: 'Gram' },
  { value: 'completed', label: 'Ukończone' },
  { value: 'dropped', label: 'Porzucone' }
]

const statuses = filters.filter(
  (filter) => filter.value !== 'all'
)

const filteredGames = computed(() => {
  if (activeFilter.value === 'all') {
    return games.value
  }

  return games.value.filter(
    (item) => item.status === activeFilter.value
  )
})

function getStatusLabel(status) {
  return statuses.find(
    (item) => item.value === status
  )?.label || 'Nieznany'
}

function getGame(item) {
  return item.game || {}
}

function getGameTitle(item) {
  return getGame(item).title || 'Nieznana gra'
}

function getGameCover(item) {
  return getGame(item).cover_url || ''
}

function getGameId(item) {
  return item.game_id ?? getGame(item).id
}

async function loadLibrary() {
  loading.value = true
  error.value = ''

  try {
    const response = await libraryService.getLibrary()

    const payload = response.data

    games.value = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : []
  } catch (err) {
    error.value =
      'Nie udało się pobrać biblioteki gier.'
    games.value = []
  } finally {
    loading.value = false
  }
}

async function updateStatus(item, newStatus) {
  const gameId = getGameId(item)

  if (!gameId || processingId.value !== null) {
    return
  }

  const oldStatus = item.status

  if (oldStatus === newStatus) {
    return
  }

  processingId.value = gameId
  actionError.value = ''

  try {
    await libraryService.updateLibraryGame(
      gameId,
      { status: newStatus }
    )

    item.status = newStatus
  } catch (err) {
    actionError.value =
      'Nie udało się zmienić statusu gry.'
  } finally {
    processingId.value = null
  }
}

async function removeGame(item) {
  const gameId = getGameId(item)

  if (!gameId || processingId.value !== null) {
    return
  }

  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć "${getGameTitle(item)}" z biblioteki?`
  )

  if (!confirmed) {
    return
  }

  processingId.value = gameId
  actionError.value = ''

  try {
    await libraryService.removeLibraryGame(gameId)

    games.value = games.value.filter(
      (game) => getGameId(game) !== gameId
    )
  } catch (err) {
    actionError.value =
      'Nie udało się usunąć gry z biblioteki.'
  } finally {
    processingId.value = null
  }
}

onMounted(loadLibrary)
</script>

<template>
  <main class="library-page">
    <div class="library-container">

      <div class="page-heading">
        <span class="eyebrow">TWOJA KOLEKCJA</span>
        <h1>Moja biblioteka</h1>
        <p>
          Organizuj swoje gry, śledź postępy
          i zarządzaj własną kolekcją.
        </p>
      </div>

      <!-- Filtry -->
      <div class="filters" aria-label="Filtry biblioteki">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter-button"
          :class="{
            active: activeFilter === filter.value
          }"
          :aria-pressed="activeFilter === filter.value"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Błąd pobierania -->
      <div v-if="error" class="message error" role="alert">
        <p>{{ error }}</p>

        <button type="button" @click="loadLibrary">
          Spróbuj ponownie
        </button>
      </div>

      <!-- Ładowanie -->
      <div v-else-if="loading" class="message">
        <p>Ładowanie Twojej biblioteki...</p>
      </div>

      <template v-else>
        <div
          v-if="actionError"
          class="message error"
          role="alert"
        >
          {{ actionError }}
        </div>

        <!-- Pusta biblioteka -->
        <div
          v-if="games.length === 0"
          class="empty-state"
        >
          <span class="empty-icon">🎮</span>
          <h2>Twoja biblioteka jest pusta</h2>
          <p>
            Odkrywaj gry i dodawaj je do swojej kolekcji.
          </p>

          <RouterLink to="/games" class="primary-link">
            Przeglądaj gry
          </RouterLink>
        </div>

        <!-- Brak wyników filtra -->
        <div
          v-else-if="filteredGames.length === 0"
          class="empty-state"
        >
          <span class="empty-icon">🔍</span>
          <h2>Brak gier w tej kategorii</h2>
          <p>
            Wybierz inny status, aby zobaczyć swoje gry.
          </p>
        </div>

        <!-- Lista gier -->
        <div v-else class="games-grid">
          <article
            v-for="item in filteredGames"
            :key="getGameId(item)"
            class="game-card"
          >
            <RouterLink
              :to="`/games/${getGameId(item)}`"
              class="cover-link"
            >
              <img
                v-if="getGameCover(item)"
                :src="getGameCover(item)"
                :alt="`Okładka gry ${getGameTitle(item)}`"
                class="game-cover"
                loading="lazy"
              />

              <div v-else class="cover-placeholder">
                🎮
              </div>
            </RouterLink>

            <div class="game-content">
              <RouterLink
                :to="`/games/${getGameId(item)}`"
                class="game-title"
              >
                {{ getGameTitle(item) }}
              </RouterLink>

              <span class="status-label">
                {{ getStatusLabel(item.status) }}
              </span>

              <label
                class="select-label"
                :for="`status-${getGameId(item)}`"
              >
                Status gry
              </label>

              <select
                :id="`status-${getGameId(item)}`"
                :value="item.status"
                :disabled="processingId !== null"
                @change="updateStatus(item, $event.target.value)"
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
                class="remove-button"
                :disabled="processingId !== null"
                @click="removeGame(item)"
              >
                {{
                  processingId === getGameId(item)
                    ? 'Przetwarzanie...'
                    : 'Usuń z biblioteki'
                }}
              </button>
            </div>
          </article>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.library-page {
  min-height: 80vh;
  padding: 60px 20px 90px;
  color: #F8FAFC;
}

.library-container {
  max-width: 1200px;
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

.page-heading p {
  color: #94A3B8;
  line-height: 1.7;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.filter-button {
  padding: 11px 17px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #CBD5E1;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.filter-button:hover {
  border-color: #8B5CF6;
}

.filter-button.active {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: #FFFFFF;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.game-card {
  min-width: 0;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.cover-link {
  display: block;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #111827;
}

.game-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.cover-link:hover .game-cover {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
}

.game-title {
  color: #F8FAFC;
  font-size: 17px;
  font-weight: 700;
  text-decoration: none;
}

.game-title:hover {
  color: #A78BFA;
}

.status-label {
  color: #22D3EE;
  font-size: 13px;
  font-weight: 600;
}

.select-label {
  color: #94A3B8;
  font-size: 12px;
}

.game-content select {
  width: 100%;
  padding: 11px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 13px;
  cursor: pointer;
}

.remove-button {
  padding: 11px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 8px;
  color: #FCA5A5;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.remove-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message,
.empty-state {
  padding: 48px 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  text-align: center;
  color: #94A3B8;
}

.message.error {
  border-color: #7F1D1D;
  color: #FCA5A5;
  margin-bottom: 20px;
}

.message button,
.primary-link {
  display: inline-block;
  margin-top: 18px;
  padding: 12px 20px;
  background: #8B5CF6;
  border: none;
  border-radius: 9px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.empty-icon {
  display: block;
  font-size: 44px;
  margin-bottom: 16px;
}

.empty-state h2 {
  color: #F8FAFC;
  margin-bottom: 12px;
}

.empty-state p {
  line-height: 1.6;
}

@media (max-width: 1000px) {
  .games-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .library-page {
    padding: 40px 16px 70px;
  }

  .page-heading h1 {
    font-size: 29px;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .game-content {
    padding: 12px;
  }

  .game-title {
    font-size: 14px;
  }
}

@media (max-width: 380px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
