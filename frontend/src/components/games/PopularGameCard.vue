
<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  game: {
    type: Object,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-to-library'
])

const imageError = ref(false)

/* DANE GRY */

const title = computed(() => {
  return props.game.title || 'Nieznana gra'
})

const cover = computed(() => {
  return props.game.cover_url ||
    props.game.image ||
    ''
})

const rating = computed(() => {
  const value =
    props.game.average_rating ??
    props.game.rating

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    number > 10
  ) {
    return null
  }

  return number.toFixed(1)
})

/* GATUNKI */

const genres = computed(() => {
  const value =
    props.game.genres ||
    props.game.genre ||
    []

  if (Array.isArray(value)) {
    return value
      .map(item => {
        return typeof item === 'string'
          ? item
          : item?.name
      })
      .filter(Boolean)
  }

  return String(value)
    .split(/[·,]/)
    .map(item => item.trim())
    .filter(Boolean)
})

/* PLATFORMY */

const platforms = computed(() => {
  const value = props.game.platforms || []

  if (Array.isArray(value)) {
    return value
      .map(item => {
        return typeof item === 'string'
          ? item
          : item?.name
      })
      .filter(Boolean)
  }

  return String(value)
    .split(/[·,]/)
    .map(item => item.trim())
    .filter(Boolean)
})

function getPlatformType(platform) {
  const name = platform.toLowerCase()

  if (
    name.includes('pc') ||
    name.includes('windows') ||
    name.includes('linux') ||
    name.includes('mac')
  ) {
    return 'pc'
  }

  if (
    name.includes('android') ||
    name.includes('ios') ||
    name.includes('mobile')
  ) {
    return 'mobile'
  }

  return 'console'
}

/* LINK DO GRY */

const gameLink = computed(() => {
  if (
    props.game.id !== undefined &&
    props.game.id !== null
  ) {
    return {
      path: `/games/${props.game.id}`
    }
  }

  return {
    path: '/games',
    query: {
      search: title.value
    }
  }
})

function handleLibraryClick() {
  emit('add-to-library', props.game)
}

watch(cover, () => {
  imageError.value = false
})
</script>

<template>
  <article class="popular-game-card">

    <!-- OKLADKA GRY -->

    <div class="card-cover">

      <RouterLink
        :to="gameLink"
        class="cover-link"
        :aria-label="`Zobacz ${title}`"
      >

        <img
          v-if="cover && !imageError"
          :src="cover"
          :alt="title"
          loading="lazy"
          decoding="async"
          @error="imageError = true"
        />

        <div
          v-else
          class="cover-placeholder"
        >

          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="6"
              width="20"
              height="12"
              rx="4"
            />
            <path d="M7 10v4M5 12h4"/>
            <path d="M16 10h.01M19 13h.01"/>
          </svg>

          <span>GAMEVERS</span>

        </div>

      </RouterLink>

      <div class="cover-gradient"></div>

      <!-- OCENA -->

      <div
        v-if="rating !== null"
        class="rating-badge"
        :aria-label="`Ocena ${rating} na 10`"
      >

        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z"/>
        </svg>

        {{ rating }}

      </div>

      <!-- BIBLIOTEKA -->

      <button
        type="button"
        class="library-button"
        :class="{ saved: saved }"
        :aria-pressed="saved"
        :aria-label="
          saved
            ? `${title} jest w bibliotece`
            : `Dodaj ${title} do biblioteki`
        "
        :title="
          saved
            ? 'W bibliotece'
            : 'Dodaj do biblioteki'
        "
        @click="handleLibraryClick"
      >

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >

          <path
            d="M6 4h12v17l-6-4-6 4z"
          />

          <path
            v-if="saved"
            d="m9 10 2 2 4-4"
          />

          <path
            v-else
            d="M12 7v6M9 10h6"
          />

        </svg>

      </button>

    </div>

    <!-- INFORMACJE O GRZE -->

    <div class="card-content">

      <RouterLink
        :to="gameLink"
        class="title-link"
      >

        <h3 class="game-title">
          {{ title }}
        </h3>

      </RouterLink>

      <!-- GATUNKI -->

      <div
        v-if="genres.length"
        class="genre-list"
      >

        <span
          v-for="genre in genres.slice(0, 2)"
          :key="genre"
          class="genre-tag"
        >
          {{ genre }}
        </span>

      </div>

      <p
        v-else
        class="no-genres"
      >
        Brak informacji o gatunku
      </p>

      <!-- STOPKA KARTY -->

      <div class="card-footer">

        <div
          class="platform-list"
          aria-label="Dostępne platformy"
        >

          <span
            v-for="platform in platforms.slice(0, 3)"
            :key="platform"
            class="platform-icon"
            :title="platform"
            :aria-label="platform"
          >

            <!-- KOMPUTER -->

            <svg
              v-if="getPlatformType(platform) === 'pc'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="13"
                rx="2"
              />
              <path d="M12 16v5M8 21h8"/>
            </svg>

            <!-- TELEFON -->

            <svg
              v-else-if="getPlatformType(platform) === 'mobile'"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="2"
                width="12"
                height="20"
                rx="2"
              />
              <path d="M10 18h4"/>
            </svg>

            <!-- KONSOLA -->

            <svg
              v-else
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="6"
                width="20"
                height="12"
                rx="4"
              />
              <path d="M7 10v4M5 12h4"/>
              <path d="M16 10h.01M19 13h.01"/>
            </svg>

          </span>

          <span
            v-if="platforms.length > 3"
            class="more-platforms"
          >
            +{{ platforms.length - 3 }}
          </span>

          <span
            v-if="!platforms.length"
            class="no-platforms"
          >
            Brak danych
          </span>

        </div>

        <!-- PRZEJSCIE DO GRY -->

        <RouterLink
          :to="gameLink"
          class="details-button"
          :aria-label="`Odkryj ${title}`"
        >

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

        </RouterLink>

      </div>

    </div>

  </article>
</template>

<style scoped>
.popular-game-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: left;
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

/* OKLADKA */

.card-cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #201B36;
}

.cover-link {
  display: block;
  width: 100%;
  height: 100%;
}

.cover-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s ease;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(11, 15, 25, .25),
    transparent 40%,
    rgba(11, 15, 25, .2)
  );
  pointer-events: none;
}

/* BRAK GRAFIKI */

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #31234F,
    #151B2B
  );
  color: #A78BFA;
}

.cover-placeholder span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 3px;
}

/* OCENA */

.rating-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  background: rgba(11, 25, 35, .92);
  border: 1px solid rgba(34, 211, 238, .25);
  border-radius: 6px;
  color: #67E8F9;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  backdrop-filter: blur(8px);
  pointer-events: none;
}

/* BIBLIOTEKA */

.library-button {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(11, 15, 25, .85);
  border: 1px solid #475569;
  border-radius: 8px;
  color: #F8FAFC;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    background .2s,
    border-color .2s;
}

.library-button:hover {
  background: #8B5CF6;
  border-color: #8B5CF6;
}

.library-button.saved {
  background: #31234F;
  border-color: #8B5CF6;
  color: #C4B5FD;
}

/* TRESC */

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 16px;
}

.title-link {
  color: #F8FAFC;
  text-decoration: none;
}

.title-link:hover {
  color: #C4B5FD;
}

.game-title {
  display: -webkit-box;
  min-height: 42px;
  margin: 0 0 10px;
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* GATUNKI */

.genre-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}

.genre-tag {
  display: inline-block;
  max-width: 100%;
  padding: 4px 7px;
  overflow: hidden;
  background: #20283B;
  border: 1px solid #293244;
  border-radius: 5px;
  color: #94A3B8;
  font-size: 10px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-genres {
  margin: 0 0 18px;
  color: #64748B;
  font-size: 11px;
}

/* STOPKA */

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #293244;
}

.platform-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  min-width: 0;
}

.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
}

.more-platforms,
.no-platforms {
  color: #64748B;
  font-size: 10px;
}

.details-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 7px;
  color: #C4B5FD;
  text-decoration: none;
  transition:
    background .2s,
    color .2s;
}

.details-button:hover {
  background: #8B5CF6;
  color: #FFFFFF;
}

/* ANIMACJE */

@media (hover: hover) {

  .popular-game-card:hover {
    transform: translateY(-4px);
    border-color: #8B5CF6;
    box-shadow:
      0 12px 30px rgba(0, 0, 0, .25),
      0 0 18px rgba(139, 92, 246, .08);
  }

  .popular-game-card:hover .cover-link img {
    transform: scale(1.05);
  }

}

/* DOSTEPNOSC */

button:focus-visible,
a:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 2px;
}

/* TELEFONY */

@media (max-width: 600px) {

  .popular-game-card {
    border-radius: 10px;
  }

  .card-content {
    padding: 12px;
  }

  .game-title {
    min-height: 36px;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .rating-badge {
    top: 7px;
    left: 7px;
    gap: 4px;
    padding: 5px 6px;
    font-size: 10px;
  }

  .rating-badge svg {
    width: 11px;
    height: 11px;
  }

  .library-button {
    top: 7px;
    right: 7px;
    width: 34px;
    height: 34px;
    border-radius: 6px;
  }

  .library-button svg {
    width: 16px;
    height: 16px;
  }

  .genre-list {
    gap: 4px;
    margin-bottom: 12px;
  }

  .genre-tag {
    padding: 4px 6px;
    font-size: 9px;
  }

  .card-footer {
    gap: 5px;
    padding-top: 10px;
  }

  .platform-list {
    gap: 7px;
  }

  .platform-icon svg {
    width: 14px;
    height: 14px;
  }

  .details-button {
    width: 30px;
    height: 30px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .card-content {
    padding: 10px;
  }

  .game-title {
    font-size: 12px;
  }

  .platform-list {
    gap: 5px;
  }

  .platform-icon svg {
    width: 12px;
    height: 12px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .popular-game-card,
  .cover-link img,
  .library-button,
  .details-button {
    transition: none;
  }

  .popular-game-card:hover,
  .popular-game-card:hover .cover-link img {
    transform: none;
  }

}
</style>
