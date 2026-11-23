
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import * as libraryService from '../services/libraryService'
import AppLoader from '../components/ui/AppLoader.vue'
import AppNotification from '../components/ui/AppNotification.vue'

const library = ref([])
const loading = ref(false)
const updatingId = ref(null)
const removingId = ref(null)

const activeFilter = ref('all')
const error = ref('')
const successMessage = ref('')

const statuses = [
  { value: 'wishlist', label: 'Chcę zagrać' },
  { value: 'playing', label: 'Gram obecnie' },
  { value: 'completed', label: 'Ukończone' },
  { value: 'dropped', label: 'Porzucone' }
]

const filters = [
  { value: 'all', label: 'Wszystkie' },
  ...statuses
]

const filteredLibrary = computed(() => {
  if (activeFilter.value === 'all') {
    return library.value
  }

  return library.value.filter(
    (item) => item.status === activeFilter.value
  )
})

const statusCounts = computed(() => {
  const counts = {
    all: library.value.length,
    wishlist: 0,
    playing: 0,
    completed: 0,
    dropped: 0
  }

  library.value.forEach((item) => {
    if (Object.hasOwn(counts, item.status)) {
      counts[item.status]++
    }
  })

  return counts
})

function extractLibrary(response) {
  const payload = response.data

  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

function getGame(item) {
  return item.game || {}
}

function getGameId(item) {
  return item.game_id ?? item.game?.id
}

function getGameTitle(item) {
  return getGame(item).title || 'Nieznana gra'
}

function getGameCover(item) {
  return getGame(item).cover_url || ''
}

function getStatusLabel(status) {
  return (
    statuses.find((item) => item.value === status)?.label ||
    'Nieznany status'
  )
}

async function loadLibrary() {
  loading.value = true
  error.value = ''

  try {
    const response = await libraryService.getLibrary()
    library.value = extractLibrary(response)
  } catch (err) {
    library.value = []

    error.value =
      err.response?.status === 401
        ? 'Sesja wygasła. Zaloguj się ponownie.'
        : 'Nie udało się pobrać biblioteki.'
  } finally {
    loading.value = false
  }
}

async function changeStatus(item, event) {
  const gameId = getGameId(item)
  const newStatus = event.target.value
  const previousStatus = item.status

  if (!gameId || newStatus === previousStatus) {
    return
  }

  updatingId.value = gameId
  error.value = ''
  successMessage.value = ''

  // Aktualizacja optymistyczna interfejsu.
  item.status = newStatus

  try {
    await libraryService.updateLibraryGame(
      gameId,
      { status: newStatus }
    )

    successMessage.value =
      `Zmieniono status gry "${getGameTitle(item)}" na "${getStatusLabel(newStatus)}".`
  } catch (err) {
    // Przy błędzie przywracamy poprzedni status.
    item.status = previousStatus

    error.value =
      'Nie udało się zmienić statusu gry.'
  } finally {
    updatingId.value = null
  }
}

async function removeGame(item) {
  const gameId = getGameId(item)

  if (!gameId) return

  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć "${getGameTitle(item)}" z biblioteki?`
  )

  if (!confirmed) return

  removingId.value = gameId
  error.value = ''
  successMessage.value = ''

  try {
    await libraryService.removeLibraryGame(gameId)

    library.value = library.value.filter(
      (entry) => getGameId(entry) !== gameId
    )

    successMessage.value =
      `Usunięto "${getGameTitle(item)}" z biblioteki.`
  } catch (err) {
    error.value =
      'Nie udało się usunąć gry z biblioteki.'
  } finally {
    removingId.value = null
  }
}

onMounted(loadLibrary)
</script>

<template>
  <main class="library-page">
    <div class="library-container">

      <!-- Nagłówek -->
      <header class="page-header">
        <div>
          <span class="eyebrow">
            TWOJA KOLEKCJA
          </span>

          <h1>Moja biblioteka</h1>

          <p>
            Organizuj swoje gry, śledź postępy
            i planuj kolejne przygody.
          </p>
        </div>

        <RouterLink
          to="/games"
          class="browse-button"
        >
          + Odkryj gry
        </RouterLink>
      </header>

      <!-- Statystyki -->
      <section class="stats-grid">
        <article class="stat-card">
          <span>Wszystkie gry</span>
          <strong>{{ statusCounts.all }}</strong>
        </article>

        <article class="stat-card">
          <span>Gram obecnie</span>
          <strong>{{ statusCounts.playing }}</strong>
        </article>

        <article class="stat-card">
          <span>Ukończone</span>
          <strong>{{ statusCounts.completed }}</strong>
        </article>

        <article class="stat-card">
          <span>Chcę zagrać</span>
          <strong>{{ statusCounts.wishlist }}</strong>
        </article>
      </section>

      <!-- Powiadomienia -->
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
      <section
        class="filters-section"
        aria-label="Filtrowanie biblioteki"
      >
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="filter-button"
          :class="{
            'filter-button--active':
              activeFilter === filter.value
          }"
          :aria-pressed="activeFilter === filter.value"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}

          <span class="filter-count">
            {{ statusCounts[filter.value] }}
          </span>
        </button>
      </section>

      <!-- Lista gier -->
      <section class="library-section">
        <div class="section-heading">
          <h2>Zapisane gry</h2>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="loadLibrary"
          >
            Odśwież
          </button>
        </div>

        <!-- Animowane ładowanie -->
        <AppLoader
          v-if="loading"
          size="large"
          message="Ładowanie biblioteki..."
          description="Pobieramy Twoje zapisane gry z Gamevers."
        />

        <div
          v-else-if="error && library.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">!</div>

          <h3>Nie można pobrać biblioteki</h3>

          <p>
            Spróbuj ponownie za chwilę.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="loadLibrary"
          >
            Spróbuj ponownie
          </button>
        </div>

        <div
          v-else-if="library.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">🎮</div>

          <h3>Twoja biblioteka jest pusta</h3>

          <p>
            Odkryj gry i dodaj pierwszą
            do swojej kolekcji.
          </p>

          <RouterLink
            to="/games"
            class="primary-button"
          >
            Przeglądaj gry
          </RouterLink>
        </div>

        <div
          v-else-if="filteredLibrary.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">⌕</div>

          <h3>Brak gier w tej kategorii</h3>

          <p>
            Wybierz inny status,
            aby zobaczyć zapisane gry.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="activeFilter = 'all'"
          >
            Pokaż wszystkie
          </button>
        </div>

        <div v-else class="library-grid">
          <article
            v-for="item in filteredLibrary"
            :key="getGameId(item)"
            class="library-card"
          >
            <RouterLink
              v-if="getGameId(item)"
              :to="`/games/${getGameId(item)}`"
              class="cover-link"
            >
              <img
                v-if="getGameCover(item)"
                :src="getGameCover(item)"
                :alt="`Okładka ${getGameTitle(item)}`"
                class="game-cover"
              />

              <div
                v-else
                class="cover-placeholder"
                aria-hidden="true"
              >
                🎮
              </div>
            </RouterLink>

            <div
              v-else
              class="cover-link"
            >
              <div class="cover-placeholder">
                🎮
              </div>
            </div>

            <div class="card-content">
              <h3>{{ getGameTitle(item) }}</h3>

              <span class="status-label">
                {{ getStatusLabel(item.status) }}
              </span>

              <label
                :for="`status-${getGameId(item)}`"
                class="select-label"
              >
                Status gry
              </label>

              <select
                :id="`status-${getGameId(item)}`"
                :value="item.status"
                :disabled="
                  updatingId !== null ||
                  removingId !== null
                "
                @change="changeStatus(item, $event)"
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
                :disabled="
                  updatingId !== null ||
                  removingId !== null
                "
                @click="removeGame(item)"
              >
                {{
                  removingId === getGameId(item)
                    ? 'Usuwanie...'
                    : 'Usuń z biblioteki'
                }}
              </button>
            </div>
          </article>
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.library-page {
  min-height: 80vh;
  padding: 55px 20px 90px;
  color: #F8FAFC;
}

.library-container {
  max-width: 1250px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-bottom: 35px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 12px 0;
  font-size: 38px;
}

.page-header p {
  margin: 0;
  color: #94A3B8;
  line-height: 1.7;
}

.browse-button,
.primary-button {
  display: inline-block;
  padding: 13px 19px;
  background: #8B5CF6;
  border: none;
  border-radius: 9px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.browse-button:hover,
.primary-button:hover {
  background: #7C3AED;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 23px;
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
  margin-bottom: 22px;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #94A3B8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.filter-button--active {
  background: #31234F;
  border-color: #8B5CF6;
  color: #E9D5FF;
}

.filter-count {
  padding: 3px 7px;
  background: #293244;
  border-radius: 6px;
  font-size: 11px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 0;
  font-size: 24px;
}

.refresh-button {
  padding: 11px 16px;
  background: #24203C;
  border: 1px solid #443B73;
  border-radius: 9px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.refresh-button:disabled,
.remove-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.library-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.library-card {
  min-width: 0;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.cover-link {
  display: block;
  height: 220px;
  background: #24203C;
}

.game-cover,
.cover-placeholder {
  width: 100%;
  height: 100%;
}

.game-cover {
  display: block;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 18px;
}

.card-content h3 {
  margin: 0;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.status-label {
  align-self: flex-start;
  padding: 6px 9px;
  background: #31234F;
  border-radius: 6px;
  color: #C4B5FD;
  font-size: 11px;
  font-weight: 700;
}

.select-label {
  color: #94A3B8;
  font-size: 12px;
}

.card-content select {
  width: 100%;
  padding: 11px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #F8FAFC;
  font: inherit;
  font-size: 13px;
}

.card-content select:focus {
  outline: none;
  border-color: #8B5CF6;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 65px 25px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 15px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  background: #24203C;
  border-radius: 16px;
  color: #C4B5FD;
  font-size: 30px;
}

.empty-state h3 {
  margin: 0;
  font-size: 21px;
}

.empty-state p {
  max-width: 390px;
  margin: 0;
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 1050px) {
  .library-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 750px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .library-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .library-page {
    padding: 35px 16px 70px;
  }

  .page-header h1 {
    font-size: 29px;
  }

  .stat-card {
    padding: 17px;
  }

  .stat-card strong {
    font-size: 24px;
  }

  .library-grid {
    gap: 12px;
  }

  .cover-link {
    height: 165px;
  }

  .card-content {
    padding: 13px;
  }

  .card-content h3 {
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .library-grid {
    grid-template-columns: 1fr;
  }
}
</style>
