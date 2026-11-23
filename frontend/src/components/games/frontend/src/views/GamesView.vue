
<script setup>
import { ref, computed } from 'vue'
import GameCard from '../components/games/GameCard.vue'

const searchQuery = ref('')
const selectedGenre = ref('')
const sortBy = ref('title')

const games = ref([
  {
    id: 1,
    title: 'Cyberpunk 2077',
    release_year: 2020,
    cover_url: null,
    average_rating: 8.7,
    genres: [{ id: 1, name: 'RPG' }]
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    release_year: 2015,
    cover_url: null,
    average_rating: 9.5,
    genres: [{ id: 1, name: 'RPG' }]
  },
  {
    id: 3,
    title: 'Minecraft',
    release_year: 2011,
    cover_url: null,
    average_rating: 9.1,
    genres: [{ id: 2, name: 'Sandbox' }]
  },
  {
    id: 4,
    title: 'Red Dead Redemption 2',
    release_year: 2018,
    cover_url: null,
    average_rating: 9.6,
    genres: [{ id: 3, name: 'Akcja' }]
  }
])

const genres = computed(() => {
  const names = games.value.flatMap(game =>
    game.genres.map(genre => genre.name)
  )

  return [...new Set(names)].sort()
})

const filteredGames = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const results = games.value.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(query)

    const matchesGenre =
      !selectedGenre.value ||
      game.genres.some(
        genre => genre.name === selectedGenre.value
      )

    return matchesSearch && matchesGenre
  })

  return [...results].sort((a, b) => {
    if (sortBy.value === 'rating') {
      return b.average_rating - a.average_rating
    }

    if (sortBy.value === 'newest') {
      return b.release_year - a.release_year
    }

    return a.title.localeCompare(b.title, 'pl')
  })
})
</script>

<template>
  <div class="games-view">
    <div class="games-container">
      <div class="page-header">
        <h1>Odkrywaj gry</h1>
        <p>
          Przeglądaj katalog i znajdź
          swój kolejny ulubiony tytuł.
        </p>
      </div>

      <div class="filters">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Szukaj gier..."
          aria-label="Szukaj gier"
        />

        <select
          v-model="selectedGenre"
          aria-label="Filtruj według gatunku"
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
          aria-label="Sortuj gry"
        >
          <option value="title">Nazwa A-Z</option>
          <option value="rating">Najwyżej oceniane</option>
          <option value="newest">Najnowsze</option>
        </select>
      </div>

      <section class="games-section">
        <h2>Katalog gier ({{ filteredGames.length }})</h2>

        <div
          v-if="filteredGames.length"
          class="games-grid"
        >
          <GameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
          />
        </div>

        <div v-else class="empty-state">
          <p>Nie znaleziono gier spełniających kryteria.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.games-view {
  min-height: 75vh;
  padding: 60px 24px;
}

.games-container {
  max-width: 1280px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 36px;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin-bottom: 12px;
}

.page-header p {
  color: #94A3B8;
  font-size: 16px;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 48px;
}

.filters input,
.filters select {
  width: 100%;
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
  padding: 64px 24px;
  background: #151B2B;
  border: 1px dashed #293244;
  border-radius: 14px;
  text-align: center;
  color: #94A3B8;
}

@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .games-view {
    padding: 40px 16px;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
