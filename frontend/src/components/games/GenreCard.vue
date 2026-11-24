
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  genre: {
    type: Object,
    required: true
  }
})

const imageError = ref(false)

/* DANE KATEGORII */

const name = computed(() => {
  return props.genre.name || 'Inne gry'
})

const image = computed(() => {
  return props.genre.image ||
    props.genre.cover_url ||
    ''
})

const description = computed(() => {
  return props.genre.description || ''
})

const gameCount = computed(() => {
  const value =
    props.genre.games_count ??
    props.genre.count

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isInteger(number) && number >= 0
    ? number
    : null
})

/* IKONY GATUNKOW */

const icons = {
  'rpg': 'swords',
  'akcja': 'zap',
  'otwarty świat': 'globe',
  'niezależne': 'gem',
  'strategiczne': 'strategy',
  'przygodowe': 'compass',
  'wyścigowe': 'flag',
  'symulacyjne': 'settings',
  'sportowe': 'trophy',
  'horror': 'ghost'
}

const icon = computed(() => {
  return icons[name.value.toLowerCase()] ||
    'gamepad'
})

/* PRZEKIEROWANIE */

const genreLink = computed(() => {
  return {
    path: '/games',
    query: {
      genre: name.value
    }
  }
})

watch(image, () => {
  imageError.value = false
})
</script>

<template>
  <RouterLink
    :to="genreLink"
    class="genre-card"
    :aria-label="`Przeglądaj gry: ${name}`"
  >

    <!-- GRAFIKA -->

    <div class="genre-background">

      <img
        v-if="image && !imageError"
        :src="image"
        alt=""
        loading="lazy"
        decoding="async"
        @error="imageError = true"
      />

      <div
        v-else
        class="image-placeholder"
      ></div>

    </div>

    <div class="genre-overlay"></div>

    <!-- GORNA CZESC -->

    <div class="genre-top">

      <div class="genre-icon">

        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >

          <!-- RPG -->

          <g v-if="icon === 'swords'">
            <path d="m14.5 17.5 3 3"/>
            <path d="m13 19 6-6"/>
            <path d="M3 3l5 1 11 11-4 4L4 8z"/>
            <path d="m9.5 17.5-3 3"/>
            <path d="m5 13 6 6"/>
            <path d="m13 7 3-3 5-1-1 5-3 3"/>
          </g>

          <!-- AKCJA -->

          <g v-else-if="icon === 'zap'">
            <path d="m13 2-9 12h7l-1 8 10-12h-7z"/>
          </g>

          <!-- OTWARTY SWIAT -->

          <g v-else-if="icon === 'globe'">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3 12h18"/>
            <ellipse cx="12" cy="12" rx="4" ry="9"/>
          </g>

          <!-- GRY NIEZALEZNE -->

          <g v-else-if="icon === 'gem'">
            <path d="M6 3h12l4 6-10 12L2 9z"/>
            <path d="M2 9h20M9 3l-3 6 6 12 6-12-3-6"/>
          </g>

          <!-- STRATEGIA -->

          <g v-else-if="icon === 'strategy'">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </g>

          <!-- PRZYGODOWE -->

          <g v-else-if="icon === 'compass'">
            <circle cx="12" cy="12" r="9"/>
            <path d="m16 8-2 6-6 2 2-6z"/>
          </g>

          <!-- WYSCIGOWE -->

          <g v-else-if="icon === 'flag'">
            <path d="M5 21V3"/>
            <path d="M5 4c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>
          </g>

          <!-- SYMULACYJNE -->

          <g v-else-if="icon === 'settings'">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <path d="m5 5 2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>
          </g>

          <!-- SPORTOWE -->

          <g v-else-if="icon === 'trophy'">
            <path d="M8 3h8v8a4 4 0 0 1-8 0z"/>
            <path d="M8 5H4v3a4 4 0 0 0 4 4"/>
            <path d="M16 5h4v3a4 4 0 0 1-4 4"/>
            <path d="M12 15v5M8 21h8"/>
          </g>

          <!-- HORROR -->

          <g v-else-if="icon === 'ghost'">
            <path d="M4 21V10a8 8 0 0 1 16 0v11l-4-3-4 3-4-3z"/>
            <path d="M9 10h.01M15 10h.01"/>
          </g>

          <!-- DOMYSLNA IKONA -->

          <g v-else>
            <rect
              x="2"
              y="6"
              width="20"
              height="12"
              rx="4"
            />
            <path d="M7 10v4M5 12h4"/>
            <path d="M16 10h.01M19 13h.01"/>
          </g>

        </svg>

      </div>

      <span
        v-if="gameCount !== null"
        class="game-count"
      >
        {{ gameCount }} gier
      </span>

    </div>

    <!-- INFORMACJE -->

    <div class="genre-content">

      <h3 class="genre-title">
        {{ name }}
      </h3>

      <p
        v-if="description"
        class="genre-description"
      >
        {{ description }}
      </p>

      <div class="genre-footer">

        <span>Odkrywaj gry</span>

        <div class="arrow-icon">

          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14m-6-6 6 6-6 6"/>
          </svg>

        </div>

      </div>

    </div>

  </RouterLink>
</template>

<style scoped>

/* GLOWNA KARTA */

.genre-card {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  min-height: 190px;
  padding: 18px;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #F8FAFC;
  text-align: left;
  text-decoration: none;
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

/* GRAFIKA TLA */

.genre-background {
  position: absolute;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.genre-background img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s ease;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #44306B,
    #151B2B
  );
}

/* PRZYCIEMNIENIE */

.genre-overlay {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(
    180deg,
    rgba(11, 15, 25, .35) 0%,
    rgba(11, 15, 25, .65) 45%,
    rgba(11, 15, 25, .98) 100%
  );
}

/* GORNA CZESC */

.genre-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 22px;
}

.genre-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  background: rgba(139, 92, 246, .2);
  border: 1px solid rgba(167, 139, 250, .35);
  border-radius: 10px;
  color: #C4B5FD;
  backdrop-filter: blur(8px);
}

.game-count {
  padding: 5px 8px;
  background: rgba(11, 15, 25, .8);
  border: 1px solid #475569;
  border-radius: 5px;
  color: #CBD5E1;
  font-size: 10px;
  white-space: nowrap;
}

/* INFORMACJE */

.genre-content {
  min-width: 0;
}

.genre-title {
  margin: 0 0 8px;
  color: #F8FAFC;
  font-size: 21px;
  font-weight: 750;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.genre-description {
  display: -webkit-box;
  margin: 0 0 10px;
  overflow: hidden;
  color: #CBD5E1;
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* STOPKA */

.genre-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.genre-footer span {
  color: #CBD5E1;
  font-size: 12px;
  font-weight: 500;
}

.arrow-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: rgba(139, 92, 246, .16);
  border: 1px solid rgba(139, 92, 246, .3);
  border-radius: 7px;
  color: #C4B5FD;
  transition:
    background .2s,
    transform .2s;
}

/* ANIMACJE */

@media (hover: hover) {

  .genre-card:hover {
    transform: translateY(-4px);
    border-color: #8B5CF6;
    box-shadow: 0 10px 25px rgba(0, 0, 0, .25);
  }

  .genre-card:hover .genre-background img {
    transform: scale(1.08);
  }

  .genre-card:hover .arrow-icon {
    transform: translateX(2px);
    background: #8B5CF6;
    color: #FFFFFF;
  }

}

/* DOSTEPNOSC */

.genre-card:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* TABLETY */

@media (max-width: 1000px) {

  .genre-card {
    min-height: 175px;
  }

}

/* TELEFONY */

@media (max-width: 600px) {

  .genre-card {
    min-height: 155px;
    padding: 12px;
    border-radius: 10px;
  }

  .genre-top {
    margin-bottom: 16px;
  }

  .genre-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }

  .genre-icon svg {
    width: 19px;
    height: 19px;
  }

  .genre-title {
    margin-bottom: 6px;
    font-size: 16px;
  }

  .genre-description {
    font-size: 10px;
  }

  .genre-footer span {
    font-size: 10px;
  }

  .arrow-icon {
    width: 27px;
    height: 27px;
  }

  .arrow-icon svg {
    width: 14px;
    height: 14px;
  }

  .game-count {
    padding: 4px 5px;
    font-size: 9px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .genre-card {
    min-height: 145px;
    padding: 10px;
  }

  .genre-title {
    font-size: 14px;
  }

  .genre-footer {
    gap: 4px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .genre-card,
  .genre-background img,
  .arrow-icon {
    transition: none;
  }

  .genre-card:hover,
  .genre-card:hover .genre-background img,
  .genre-card:hover .arrow-icon {
    transform: none;
  }

}

</style>
