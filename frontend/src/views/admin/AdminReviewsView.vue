
<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const searchQuery = ref('')

// Dane demonstracyjne.
// Później zastąpi je API Laravel.
const reviews = ref([
  {
    id: 1,
    username: 'PlayerOne',
    game_id: 1,
    game_title: 'Cyberpunk 2077',
    rating: 9,
    content: 'Świetny klimat i ciekawa fabuła.',
    created_at: '2026-11-10'
  },
  {
    id: 2,
    username: 'GameMaster',
    game_id: 3,
    game_title: 'Minecraft',
    rating: 10,
    content: 'Ogromne możliwości kreatywnej zabawy.',
    created_at: '2026-11-12'
  },
  {
    id: 3,
    username: 'RPGFan',
    game_id: 2,
    game_title: 'The Witcher 3: Wild Hunt',
    rating: 10,
    content: 'Bardzo dobra historia i świetne zadania.',
    created_at: '2026-11-15'
  }
])

const filteredReviews = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return reviews.value.filter(review =>
    review.username.toLowerCase().includes(query) ||
    review.game_title.toLowerCase().includes(query) ||
    review.content.toLowerCase().includes(query)
  )
})

function formatDate(date) {
  return new Intl.DateTimeFormat('pl-PL').format(
    new Date(`${date}T12:00:00`)
  )
}
</script>

<template>
  <div class="admin-reviews-page">
    <div class="container">
      <RouterLink to="/admin" class="back-link">
        ← Panel administratora
      </RouterLink>

      <header class="page-header">
        <h1>Moderacja recenzji</h1>
        <p>
          Przeglądaj opinie użytkowników
          i zarządzaj treściami społeczności.
        </p>
      </header>

      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Szukaj recenzji..."
          aria-label="Szukaj recenzji"
        />

        <span class="reviews-count">
          Liczba recenzji: {{ filteredReviews.length }}
        </span>
      </div>

      <div v-if="filteredReviews.length" class="reviews-list">
        <article
          v-for="review in filteredReviews"
          :key="review.id"
          class="review-card"
        >
          <div class="review-header">
            <div>
              <span class="username">
                {{ review.username }}
              </span>

              <p class="game-title">
                <RouterLink :to="`/games/${review.game_id}`">
                  {{ review.game_title }}
                </RouterLink>
              </p>
            </div>

            <span class="rating">
              ★ {{ review.rating }} / 10
            </span>
          </div>

          <p class="review-content">
            {{ review.content }}
          </p>

          <div class="review-footer">
            <span class="date">
              {{ formatDate(review.created_at) }}
            </span>

            <button
              type="button"
              class="delete-button"
              disabled
            >
              Usuń recenzję
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">
        Nie znaleziono recenzji.
      </div>

      <p class="demo-notice">
        To demonstracyjny moduł moderacji.
        Usuwanie recenzji będzie dostępne
        po podłączeniu API Laravel
        i zabezpieczeniu uprawnień administratora.
      </p>
    </div>
  </div>
</template>

<style scoped>
.admin-reviews-page {
  min-height: 75vh;
  padding: 48px 24px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 32px;
  color: #A78BFA;
  font-weight: 600;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: clamp(28px, 5vw, 42px);
  margin-bottom: 12px;
}

.page-header p,
.reviews-count,
.demo-notice {
  color: #94A3B8;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.toolbar input {
  width: 100%;
  max-width: 450px;
  padding: 14px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #F8FAFC;
  outline: none;
}

.toolbar input:focus {
  border-color: #8B5CF6;
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

.review-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.username {
  color: #A78BFA;
  font-weight: 700;
}

.game-title {
  margin-top: 8px;
}

.game-title a {
  color: #F8FAFC;
  font-weight: 600;
}

.game-title a:hover {
  color: #A78BFA;
}

.rating {
  color: #FBBF24;
  font-weight: 700;
  white-space: nowrap;
}

.review-content {
  color: #CBD5E1;
  line-height: 1.8;
  margin-bottom: 24px;
  overflow-wrap: anywhere;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #293244;
}

.date {
  color: #94A3B8;
  font-size: 13px;
}

.delete-button {
  padding: 10px 14px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 8px;
  color: #F87171;
  font-weight: 600;
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  padding: 48px 20px;
  background: #151B2B;
  border-radius: 14px;
  text-align: center;
  color: #94A3B8;
}

.demo-notice {
  margin-top: 32px;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .admin-reviews-page {
    padding: 32px 16px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar input {
    max-width: none;
  }

  .review-header {
    flex-direction: column;
  }
}
</style>
