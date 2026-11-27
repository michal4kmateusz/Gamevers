
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

const imageFailed = ref(false)

const cover = computed(() =>
  props.game.cover_url || props.game.thumbnail || ''
)

watch(cover, () => {
  imageFailed.value = false
})

const rating = computed(() => {
  const value = props.game.average_rating ?? props.game.rating

  if (value == null || value === '') {
    return 'Brak ocen'
  }

  return Number.isFinite(Number(value))
    ? Number(value).toFixed(1)
    : 'Brak ocen'
})

const genre = computed(() =>
  props.game.genres?.map(item =>
    typeof item === 'string' ? item : item.name
  ).join(' · ') || 'Brak gatunku'
)
</script>

<template>
  <article class="game-card">

    <RouterLink
      v-if="game.slug"
      :to="{
        name: 'game-details',
        params: { slug: game.slug }
      }"
      class="cover"
    >
      <img
        v-if="cover && !imageFailed"
        :src="cover"
        :alt="game.title"
        loading="lazy"
        @error="imageFailed = true"
      />

      <div v-else class="cover-placeholder">
        <svg
          width="58"
          height="58"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.3"
        >
          <rect x="2" y="6" width="20" height="12" rx="5"/>
          <path d="M6 12h6M9 9v6"/>
          <circle cx="16" cy="10" r=".7"/>
          <circle cx="19" cy="13" r=".7"/>
        </svg>

        <span>GAMEVERS</span>
      </div>
    </RouterLink>

    <div class="card-content">

      <div class="card-meta">
        <span class="genre">{{ genre }}</span>
        <span class="rating">★ {{ rating }}</span>
      </div>

      <h3>{{ game.title }}</h3>

      <p class="description">
        {{ game.short_description || 'Odkryj szczegóły gry.' }}
      </p>

      <div class="card-footer">

        <span>
          {{ game.release_year || 'Szczegóły gry' }}
        </span>

        <RouterLink
          v-if="game.slug"
          :to="{
            name: 'game-details',
            params: { slug: game.slug }
          }"
          class="details-button"
          :aria-label="`Zobacz szczegóły ${game.title}`"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14m-6-6 6 6-6 6"/>
          </svg>
        </RouterLink>

      </div>
    </div>
  </article>
</template>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  overflow: hidden;
  transition: transform .2s, border-color .2s;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: #8B5CF6;
}

.cover {
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #201B36;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at top right,
    #44306B,
    #151B2B 75%
  );
  color: #A78BFA;
}

.cover-placeholder span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 3px;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 18px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  margin-bottom: 12px;
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
  margin: 0 0 10px;
  color: #F8FAFC;
}

.description {
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #293244;
}

.card-footer span {
  color: #94A3B8;
  font-size: 12px;
}

.details-button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #8B5CF6;
  color: white;
  transition: background .2s;
}

.details-button:hover {
  background: #7C3AED;
}
</style>
