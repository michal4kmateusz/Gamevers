
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

const rating = computed(() => {
  const value = Number(props.game.average_rating)
  return Number.isFinite(value) && props.game.average_rating != null
    ? value.toFixed(1)
    : 'Brak ocen'
})

const genre = computed(() => {
  return props.game.genres?.map(g => g.name).join(', ') || 'Brak gatunku'
})
</script>

<template>
  <article class="game-card">
    <div class="cover">
      <img
        v-if="game.cover_url"
        :src="game.cover_url"
        :alt="`Okładka gry ${game.title}`"
        loading="lazy"
      />
      <div v-else class="cover-placeholder">
        Brak okładki
      </div>
    </div>

    <div class="card-content">
      <div class="card-meta">
        <span class="genre">{{ genre }}</span>
        <span class="rating">★ {{ rating }}</span>
      </div>

      <h3>{{ game.title }}</h3>

      <p class="release-year">
        {{ game.release_year || 'Rok nieznany' }}
      </p>

      <RouterLink
        :to="`/games/${game.id}`"
        class="details-button"
      >
        Zobacz szczegóły
      </RouterLink>
    </div>
  </article>
</template>

<style scoped>
.game-card {
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: #8B5CF6;
}

.cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #222C43;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
}

.card-content {
  padding: 20px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
}

.genre {
  color: #22D3EE;
}

.rating {
  color: #FBBF24;
  white-space: nowrap;
}

.card-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.release-year {
  color: #94A3B8;
  font-size: 14px;
  margin-bottom: 20px;
}

.details-button {
  display: block;
  padding: 12px;
  background: #8B5CF6;
  border-radius: 9px;
  color: white;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.details-button:hover {
  background: #7C3AED;
}
</style>
