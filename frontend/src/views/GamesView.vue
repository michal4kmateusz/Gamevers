
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import * as gamesService from '../services/gamesService'
import AppLoader from '../components/ui/AppLoader.vue'
import AppNotification from '../components/ui/AppNotification.vue'
import GameCard from '../components/games/GameCard.vue'

const games = ref([])
const loading = ref(false)
const error = ref('')

const search = ref('')
const selectedGenre = ref('all')
const sortBy = ref('title-asc')

const genres = computed(() => {
  const uniqueGenres = new Set()

  games.value.forEach((game) => {
    const values = Array.isArray(game.genres)
      ? game.genres
      : game.genre
        ? [game.genre]
        : []

    values.forEach((genre) => {
      const name = typeof genre === 'string'
        ? genre
        : genre?.name

      if (name) uniqueGenres.add(name)
    })
  })

  return [...uniqueGenres].sort((a, b) =>
    a.localeCompare(b, 'pl')
  )
})

function getGenreNames(game) {
  const values = Array.isArray(game.genres)
    ? game.genres
    : game.genre
      ? [game.genre]
      : []

  return values
    .map((genre) =>
      typeof genre === 'string'
        ? genre
        : genre?.name
    )
    .filter(Boolean)
}

function getReleaseTime(game) {
  if (!game.release_date) return 0

  const time = new Date(game.release_date).getTime()

  return Number.isFinite(time) ? time : 0
}

const filteredGames = computed(() => {
  const query = search.value.trim().toLowerCase()

  const result = games.value.filter((game) => {
    const title = String(game.title || '')
      .toLowerCase()

    const description = String(game.description || '')
      .toLowerCase()

    const matchesSearch =
      !query ||
      title.includes(query) ||
      description.includes(query)

    const matchesGenre =
      selectedGenre.value === 'all' ||
      getGenreNames(game).includes(
        selectedGenre.value
      )

    return matchesSearch && matchesGenre
  })

  return [...result].sort((a, b) => {
    if (sortBy.value === 'title-desc') {
      return String(b.title || '').localeCompare(
        String(a.title || ''),
        'pl'
      )
    }

    if (sortBy.value === 'newest') {
      return getReleaseTime(b) - getReleaseTime(a)
    }

    if (sortBy.value === 'oldest') {
      return getReleaseTime(a) - getReleaseTime(b)
    }

    return String(a.title || '').localeCompare(
      String(b.title || ''),
      'pl'
    )
  })
})

function extractGames(response) {
  const payload = response.data

  if (Array.isArray(payload)) return payload

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  return []
}

async function loadGames() {
  loading.value = true
  error.value = ''

  try {
    const response = await gamesService.getGames()
    games.value = extractGames(response)
  } catch (err) {
    games.value = []

    error.value =
      'Nie udało się pobrać katalogu gier. Spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  search.value = ''
  selectedGenre.value = 'all'
  sortBy.value = 'title-asc'
}

onMounted(loadGames)
</script>

<template>
  <main class="games-page">
    <div class="games-container">

      <!-- Nagłówek -->
      <header class="page-header">
        <div>
          <span class="eyebrow">
            ODKRYWAJ NOWE ŚWIATY
          </span>

          <h1>Katalog gier</h1>

          <p>
            Przeglądaj gry, odkrywaj nowe tytuły
            i znajdź coś dla siebie.
          </p>
        </div>

        <RouterLink
          to="/"
          class="home-link"
        >
          ← Strona główna
        </RouterLink>
      </header>

      <!-- Panel wyszukiwania -->
      <section
        class="filters-panel"
        aria-label="Wyszukiwanie i filtrowanie gier"
      >
        <div class="filter-field search-field">
          <label for="game-search">
            Szukaj gry
          </label>

          <input
            id="game-search"
            v-model="search"
            type="search"
            placeholder="Wpisz tytuł lub opis gry..."
          />
        </div>

        <div class="filter-field">
          <label for="genre-filter">
            Gatunek
          </label>

          <select
            id="genre-filter"
            v-model="selectedGenre"
          >
            <option value="all">
              Wszystkie gatunki
            </option>

            <option
              v-for="genre in genres"
              :key="genre"
              :value="genre"
            >
              {{ genre }}
            </option>
          </select>
        </div>

        <div class="filter-field">
          <label for="sort-filter">
            Sortowanie
          </label>

          <select
            id="sort-filter"
            v-model="sortBy"
          >
            <option value="title-asc">
              Nazwa A–Z
            </option>

            <option value="title-desc">
              Nazwa Z–A
            </option>

            <option value="newest">
              Najnowsze premiery
            </option>

            <option value="oldest">
              Najstarsze premiery
            </option>
          </select>
        </div>

        <button
          type="button"
          class="clear-button"
          @click="clearFilters"
        >
          Wyczyść filtry
        </button>
      </section>

      <!-- Komunikat błędu -->
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

      <!-- Lista gier -->
      <section class="games-section">
        <div class="section-heading">
          <div>
            <h2>Odkryj gry</h2>

            <p>
              Znaleziono:
              <strong>{{ filteredGames.length }}</strong>
            </p>
          </div>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="loadGames"
          >
            Odśwież
          </button>
        </div>

        <!-- NOWOŚĆ: animowany loader -->
        <AppLoader
          v-if="loading"
          size="large"
          message="Ładowanie katalogu gier..."
          description="Przygotowujemy dla Ciebie listę tytułów Gamevers."
        />

        <div
          v-else-if="error"
          class="state-panel"
        >
          <div class="state-icon">!</div>

          <h3>Nie udało się pobrać gier</h3>

          <p>
            Sprawdź połączenie z serwerem
            i spróbuj ponownie.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="loadGames"
          >
            Spróbuj ponownie
          </button>
        </div>

        <div
          v-else-if="games.length === 0"
          class="state-panel"
        >
          <div class="state-icon">🎮</div>

          <h3>Katalog jest pusty</h3>

          <p>
            W katalogu nie ma jeszcze żadnych gier.
          </p>
        </div>

        <div
          v-else-if="filteredGames.length === 0"
          class="state-panel"
        >
          <div class="state-icon">⌕</div>

          <h3>Nie znaleziono gier</h3>

          <p>
            Spróbuj zmienić wyszukiwaną frazę
            lub wybrany gatunek.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="clearFilters"
          >
            Wyczyść filtry
          </button>
        </div>

        <div v-else class="games-grid">
          <GameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
          />
        </div>
      </section>

    </div>
  </main>
</template>

<style scoped>
.games-page {
  min-height: 80vh;
  padding: 55px 20px 90px;
  color: #F8FAFC;
}

.games-container {
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

.home-link {
  color: #A78BFA;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.filters-panel {
  display: grid;
  grid-template-columns:
    minmax(0, 1.5fr)
    minmax(150px, 1fr)
    minmax(150px, 1fr)
    auto;
  align-items: end;
  gap: 16px;
  padding: 24px;
  margin-bottom: 30px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
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

.clear-button,
.refresh-button,
.primary-button {
  padding: 13px 17px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.clear-button,
.refresh-button {
  background: #24203C;
  border: 1px solid #443B73;
  color: #C4B5FD;
}

.primary-button {
  background: #8B5CF6;
  border: none;
  color: #FFFFFF;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-wrapper {
  margin-bottom: 25px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.section-heading h2 {
  margin: 0 0 8px;
  font-size: 25px;
}

.section-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
}

.section-heading strong {
  color: #F8FAFC;
}

.games-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.state-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 60px 25px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
  text-align: center;
}

.state-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: #24203C;
  border-radius: 15px;
  color: #C4B5FD;
  font-size: 30px;
}

.state-panel h3 {
  margin: 0;
  font-size: 21px;
}

.state-panel p {
  max-width: 400px;
  margin: 0;
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .filters-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .games-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 750px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .games-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .games-page {
    padding: 35px 16px 70px;
  }

  .page-header h1 {
    font-size: 29px;
  }

  .filters-panel {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .games-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .section-heading h2 {
    font-size: 22px;
  }

  .state-panel {
    padding: 40px 18px;
  }
}

@media (max-width: 360px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
