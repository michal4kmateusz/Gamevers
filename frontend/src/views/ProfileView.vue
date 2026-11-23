
<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

// Przykładowe dane.
// Później pobierzemy je z API Laravel.
const user = ref({
  username: 'GameversPlayer',
  joined_at: '2026-11-01'
})

const library = ref([
  { id: 1, status: 'playing' },
  { id: 2, status: 'wishlist' },
  { id: 3, status: 'completed' },
  { id: 4, status: 'completed' }
])

const reviews = ref([
  {
    id: 1,
    game_id: 2,
    game_title: 'The Witcher 3: Wild Hunt',
    rating: 9,
    content: 'Świetna fabuła i rozbudowany świat.'
  },
  {
    id: 2,
    game_id: 1,
    game_title: 'Cyberpunk 2077',
    rating: 8,
    content: 'Ciekawy klimat i wciągające zadania.'
  }
])

const completedCount = computed(() =>
  library.value.filter(game => game.status === 'completed').length
)

const averageRating = computed(() => {
  if (!reviews.value.length) return '—'

  const total = reviews.value.reduce(
    (sum, review) => sum + review.rating, 0
  )

  return (total / reviews.value.length).toFixed(1)
})

const joinedDate = computed(() =>
  new Intl.DateTimeFormat('pl-PL', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(user.value.joined_at))
)
</script>

<template>
  <div class="profile-page">
    <div class="profile-container">
      <header class="profile-header">
        <div class="avatar" aria-hidden="true">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>

        <div>
          <h1>{{ user.username }}</h1>
          <p>Gracz od {{ joinedDate }}</p>
        </div>
      </header>

      <section class="stats-section">
        <h2>Statystyki gracza</h2>

        <div class="stats-grid">
          <div class="stat-card">
            <strong>{{ library.length }}</strong>
            <span>Gier w bibliotece</span>
          </div>

          <div class="stat-card">
            <strong>{{ completedCount }}</strong>
            <span>Ukończonych gier</span>
          </div>

          <div class="stat-card">
            <strong>{{ reviews.length }}</strong>
            <span>Recenzji</span>
          </div>

          <div class="stat-card">
            <strong>{{ averageRating }}</strong>
            <span>Średnia ocen</span>
          </div>
        </div>
      </section>

      <section class="reviews-section">
        <h2>Moje recenzje</h2>

        <div v-if="reviews.length" class="reviews-list">
          <article
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <h3>
                <RouterLink :to="`/games/${review.game_id}`">
                  {{ review.game_title }}
                </RouterLink>
              </h3>
              <span class="rating">
                ★ {{ review.rating }} / 10
              </span>
            </div>

            <p>{{ review.content }}</p>
          </article>
        </div>

        <p v-else class="empty-state">
          Nie masz jeszcze żadnych recenzji.
        </p>
      </section>

      <p class="demo-notice">
        Profil zawiera dane demonstracyjne.
        Informacje o zalogowanym użytkowniku
        podłączymy później przez API Laravel.
      </p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 75vh;
  padding: 60px 24px;
}

.profile-container {
  max-width: 1100px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 56px;
}

.avatar {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #8B5CF6;
  color: white;
  font-size: 36px;
  font-weight: 700;
}

.profile-header h1 {
  font-size: clamp(28px, 5vw, 42px);
  margin-bottom: 8px;
}

.profile-header p,
.review-card p,
.demo-notice {
  color: #94A3B8;
}

.stats-section,
.reviews-section {
  margin-bottom: 48px;
}

.stats-section h2,
.reviews-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.stat-card strong {
  color: #A78BFA;
  font-size: 32px;
}

.stat-card span {
  color: #94A3B8;
  font-size: 13px;
}

.reviews-list {
  display: grid;
  gap: 16px;
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
  margin-bottom: 14px;
}

.review-header h3 {
  font-size: 18px;
}

.review-header a {
  color: #F8FAFC;
}

.review-header a:hover {
  color: #A78BFA;
}

.rating {
  color: #FBBF24;
  font-weight: 700;
  white-space: nowrap;
}

.review-card p {
  line-height: 1.7;
}

.empty-state {
  color: #94A3B8;
}

.demo-notice {
  padding-top: 24px;
  border-top: 1px solid #293244;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 40px 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .profile-header {
    gap: 16px;
  }

  .avatar {
    width: 68px;
    height: 68px;
    font-size: 28px;
  }

  .review-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
