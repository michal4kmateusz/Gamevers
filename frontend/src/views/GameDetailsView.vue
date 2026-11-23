
<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

// Dane demonstracyjne - później zastąpi je API Laravel.
const games = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    release_year: 2020,
    genre: 'RPG',
    rating: 8.7,
    description: 'Fabularna gra akcji osadzona w futurystycznym Night City.'
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    release_year: 2015,
    genre: 'RPG',
    rating: 9.5,
    description: 'Przygodowa gra RPG w świecie fantasy.'
  },
  {
    id: 3,
    title: 'Minecraft',
    release_year: 2011,
    genre: 'Sandbox',
    rating: 9.1,
    description: 'Gra o eksploracji, budowaniu i kreatywności.'
  },
  {
    id: 4,
    title: 'Red Dead Redemption 2',
    release_year: 2018,
    genre: 'Akcja',
    rating: 9.6,
    description: 'Przygodowa gra akcji osadzona na Dzikim Zachodzie.'
  }
]

const game = computed(() =>
  games.find(item => item.id === Number(route.params.id))
)
</script>

<template>
  <div class="details-page">
    <div class="details-container">
      <RouterLink to="/games" class="back-link">
        ← Wróć do katalogu
      </RouterLink>

      <template v-if="game">
        <section class="game-info">
          <div class="game-cover">
            <span>Brak okładki</span>
          </div>

          <div class="game-content">
            <p class="genre">
              {{ game.genre }} · {{ game.release_year }}
            </p>

            <h1>{{ game.title }}</h1>

            <p class="rating">
              ★ {{ game.rating }} / 10
            </p>

            <h2>O grze</h2>
            <p class="description">
              {{ game.description }}
            </p>

            <button class="library-button" disabled>
              Dodaj do biblioteki
            </button>
            <p class="hint">
              Funkcja dostępna po podłączeniu kont użytkowników.
            </p>
          </div>
        </section>

        <section class="reviews">
          <h2>Recenzje graczy</h2>
          <p>
            Recenzje pojawią się tutaj po
            podłączeniu API Laravel.
          </p>
        </section>
      </template>

      <div v-else class="not-found">
        <h1>Nie znaleziono gry</h1>
        <p>Gra o podanym identyfikatorze nie istnieje.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-page {
  min-height: 75vh;
  padding: 48px 24px;
}

.details-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 32px;
  color: #A78BFA;
  font-weight: 600;
}

.back-link:hover {
  color: #C4B5FD;
}

.game-info {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 48px;
  margin-bottom: 64px;
}

.game-cover {
  aspect-ratio: 3 / 4;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
}

.game-content h1 {
  font-size: clamp(32px, 5vw, 52px);
  margin-bottom: 20px;
}

.genre {
  color: #22D3EE;
  margin-bottom: 12px;
}

.rating {
  color: #FBBF24;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 36px;
}

.game-content h2,
.reviews h2 {
  font-size: 24px;
  margin-bottom: 16px;
}

.description,
.reviews p,
.hint {
  color: #94A3B8;
  line-height: 1.8;
}

.library-button {
  margin-top: 24px;
  padding: 14px 24px;
  background: #8B5CF6;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
}

.library-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin-top: 12px;
  font-size: 13px;
}

.reviews {
  border-top: 1px solid #293244;
  padding-top: 40px;
}

.not-found {
  padding: 64px 0;
  text-align: center;
}

.not-found p {
  color: #94A3B8;
}

@media (max-width: 768px) {
  .details-page {
    padding: 32px 16px;
  }

  .game-info {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .game-cover {
    max-width: 320px;
    width: 100%;
  }
}
</style>
