
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import GameCard from '../components/games/GameCard.vue'
import { getGames } from '../services/gameService'

const route = useRoute()

const games = ref([])
const loading = ref(true)
const error = ref('')

const searchQuery = ref('')
const selectedGenre = ref('')
const sortBy = ref('title')

async function loadGames() {
  loading.value = true
  error.value = ''

  try {
    const first = await getGames({ per_page: 50, page: 1 })
    const allGames = [...first.data]

    for (let page = 2; page <= first.last_page; page++) {
      const response = await getGames({
        per_page: 50,
        page
      })

      allGames.push(...response.data)
    }

    games.value = allGames
  } catch (err) {
    console.error('Błąd pobierania gier:', err)
    error.value = 'Nie udało się pobrać katalogu gier.'
  } finally {
    loading.value = false
  }
}

const genres = computed(() => {
  return [...new Set(
    games.value.flatMap(game => game.genres || [])
  )].sort((a, b) => a.localeCompare(b, 'pl'))
})

const filteredGames = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const results = games.value.filter(game => {
    const matchesSearch = [
      game.title,
      game.description,
      game.developer,
      ...(game.genres || [])
    ].some(value =>
      String(value || '').toLowerCase().includes(query)
    )

    const matchesGenre =
      !selectedGenre.value ||
      game.genres?.includes(selectedGenre.value)

    return matchesSearch && matchesGenre
  })

  return [...results].sort((a, b) => {
    if (sortBy.value === 'rating') {
      return (
        (b.average_rating ?? -1) -
        (a.average_rating ?? -1)
      ) || (
        (b.reviews_count ?? 0) -
        (a.reviews_count ?? 0)
      )
    }

    if (sortBy.value === 'newest') {
      return String(b.release_date || '')
        .localeCompare(String(a.release_date || ''))
    }

    if (sortBy.value === 'popular') {
      return (b.views || 0) - (a.views || 0)
    }

    return a.title.localeCompare(b.title, 'pl')
  })
})

watch(
  () => route.query,
  query => {
    searchQuery.value = String(query.search || '')
    selectedGenre.value = String(query.genre || '')
  },
  { immediate: true }
)

onMounted(loadGames)
</script>

<template>
  <main class="games-view">
    <div class="games-container">

      <header class="page-header">
        <span class="eyebrow">GAMEVERS / KATALOG</span>

        <h1>Odkrywaj gry</h1>

        <p>
          Przeglądaj katalog i znajdź
          swój kolejny ulubiony tytuł.
        </p>
      </header>

      <div class="filters">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Szukaj gier..."
          aria-label="Szukaj gier"
        />

        <select
          v-model="selectedGenre"
          aria-label="Wybierz gatunek"
        >
          <option value="">Wszystkie gatunki</option>

          <option
            v-for="genre in genres"
            :key="genre"
            :value="genre"
          >
            {{ genre }}
          </option>
        </select>

        <select
          v-model="sortBy"
          aria-label="Sortowanie"
        >
          <option value="title">Nazwa A-Z</option>
          <option value="rating">Najwyżej oceniane</option>
          <option value="newest">Najnowsze</option>
          <option value="popular">Najpopularniejsze</option>
        </select>
      </div>

      <section v-if="loading" class="empty-state">
        <div class="spinner"></div>
        <h2>Wczytywanie gier...</h2>
      </section>

      <section v-else-if="error" class="empty-state">
        <h2>{{ error }}</h2>
        <button class="retry-button" @click="loadGames">
          Spróbuj ponownie
        </button>
      </section>

      <section v-else class="games-section">

        <h2>Katalog gier ({{ filteredGames.length }})</h2>

        <div v-if="filteredGames.length" class="games-grid">
          <GameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
          />
        </div>

        <div v-else class="empty-state">
          <h2>Nie znaleziono gier</h2>
          <p>Zmień kryteria wyszukiwania.</p>

          <button
            class="retry-button"
            @click="searchQuery = ''; selectedGenre = ''"
          >
            Wyczyść filtry
          </button>
        </div>

      </section>
    </div>
  </main>
</template>

<style scoped>
.games-view {
  min-height: 75vh;
  padding: 60px 24px;
  color: #F8FAFC;
}

.games-container {
  max-width: 1280px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 36px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin: 12px 0;
}

.page-header p {
  color: #94A3B8;
  font-size: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
}

.filters input,
.filters select {
  width: 100%;
  min-width: 0;
  padding: 14px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #F8FAFC;
  outline: none;
}

.filters input:focus,
.filters select:focus {
  border-color: #8B5CF6;
}

.games-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.empty-state {
  padding: 60px 24px;
  background: #151B2B;
  border: 1px dashed #293244;
  border-radius: 14px;
  text-align: center;
  color: #94A3B8;
}

.retry-button {
  margin-top: 20px;
  padding: 12px 20px;
  background: #8B5CF6;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.spinner {
  width: 36px;
  height: 36px;
  margin: 0 auto 20px;
  border: 3px solid #293244;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .games-view {
    padding: 32px 16px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
