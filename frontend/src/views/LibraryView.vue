
<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const activeStatus = ref('all')

// Dane demonstracyjne.
// Później będą pobierane z API Laravel.
const library = ref([
  {
    id: 1,
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    release_year: 2020,
    status: 'playing'
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    release_year: 2015,
    status: 'wishlist'
  },
  {
    id: 3,
    title: 'Minecraft',
    genre: 'Sandbox',
    release_year: 2011,
    status: 'completed'
  },
  {
    id: 4,
    title: 'Red Dead Redemption 2',
    genre: 'Akcja',
    release_year: 2018,
    status: 'dropped'
  }
])

const statuses = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'wishlist', label: 'Chcę zagrać' },
  { value: 'playing', label: 'Gram obecnie' },
  { value: 'completed', label: 'Ukończone' },
  { value: 'dropped', label: 'Porzucone' }
]

const filteredLibrary = computed(() => {
  if (activeStatus.value === 'all') {
    return library.value
  }

  return library.value.filter(
    game => game.status === activeStatus.value
  )
})

function getStatusLabel(status) {
  return statuses.find(item => item.value === status)?.label
    || 'Nieznany'
}
</script>

<template>
  <div class="library-view">
    <div class="container">
      <header class="page-header">
        <h1>Moja biblioteka</h1>
        <p>
          Zarządzaj swoją kolekcją gier
          i śledź postępy.
        </p>
      </header>

      <div class="status-filters" aria-label="Filtry biblioteki">
        <button
          v-for="status in statuses"
          :key="status.value"
          type="button"
          :class="{ active: activeStatus === status.value }"
          :aria-pressed="activeStatus === status.value"
          @click="activeStatus = status.value"
        >
          {{ status.label }}
        </button>
      </div>

      <div v-if="filteredLibrary.length" class="library-grid">
        <article
          v-for="game in filteredLibrary"
          :key="game.id"
          class="library-card"
        >
          <div class="card-header">
            <h2>{{ game.title }}</h2>
            <span class="status">
              {{ getStatusLabel(game.status) }}
            </span>
          </div>

          <p class="game-meta">
            {{ game.genre }} · {{ game.release_year }}
          </p>

          <RouterLink
            :to="`/games/${game.id}`"
            class="details-link"
          >
            Zobacz szczegóły →
          </RouterLink>
        </article>
      </div>

      <div v-else class="empty-state">
        <p>Nie masz gier w tej kategorii.</p>
      </div>

      <p class="demo-notice">
        To demonstracyjna biblioteka.
        Zapisywanie zmian będzie dostępne
        po podłączeniu kont użytkowników.
      </p>
    </div>
  </div>
</template>

<style scoped>
.library-view {
  min-height: 75vh;
  padding: 60px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: clamp(32px, 5vw, 48px);
  margin-bottom: 12px;
}

.page-header p,
.game-meta,
.demo-notice {
  color: #94A3B8;
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 36px;
}

.status-filters button {
  padding: 12px 18px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #CBD5E1;
}

.status-filters button.active {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: white;
}

.library-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.library-card {
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.card-header h2 {
  font-size: 20px;
  margin-bottom: 12px;
}

.status {
  color: #22D3EE;
  font-size: 12px;
  white-space: nowrap;
}

.game-meta {
  font-size: 14px;
  margin-bottom: 24px;
}

.details-link {
  color: #A78BFA;
  font-weight: 600;
  font-size: 14px;
}

.details-link:hover {
  color: #C4B5FD;
}

.empty-state {
  padding: 48px;
  text-align: center;
  background: #151B2B;
  border-radius: 14px;
  color: #94A3B8;
}

.demo-notice {
  margin-top: 32px;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .library-view {
    padding: 40px 16px;
  }

  .library-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
