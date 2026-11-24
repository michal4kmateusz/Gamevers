
<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

import {
  useLibraryStore,
  LIBRARY_STATUSES
} from '../../stores/libraryStore'

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

const libraryStore = useLibraryStore()

/* STAN KOMPONENTU */

const imageFailed = ref(false)
const notification = ref('')
const notificationType = ref('success')

let notificationTimer = null

/* INFORMACJE O GRZE */

const title = computed(() =>
  props.game.title || 'Nieznana gra'
)

const cover = computed(() =>
  props.game.cover_url ||
  props.game.image ||
  ''
)

const rating = computed(() => {
  const value = Number(
    props.game.average_rating ??
    props.game.rating
  )

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 10
  ) {
    return '—'
  }

  return value.toFixed(1)
})

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[·,]/)
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

const genres = computed(() =>
  normalizeList(
    props.game.genres ||
    props.game.genre
  )
)

const platforms = computed(() =>
  normalizeList(props.game.platforms)
)

const gameLink = computed(() => {
  if (props.game.id) {
    return `/games/${props.game.id}`
  }

  return {
    path: '/games',
    query: {
      search: title.value
    }
  }
})

/* BIBLIOTEKA */

const isSaved = computed(() =>
  props.game.id
    ? libraryStore.hasGame(props.game.id)
    : false
)

const currentStatus = computed(() =>
  props.game.id
    ? libraryStore.getStatus(props.game.id)
    : null
)

const statusInformation = computed(() =>
  LIBRARY_STATUSES.find(
    item => item.value === currentStatus.value
  ) || null
)

const bookmarkLabel = computed(() =>
  isSaved.value
    ? `Usuń ${title.value} z biblioteki`
    : `Dodaj ${title.value} do biblioteki`
)

/* POWIADOMIENIA */

function showNotification(
  message,
  type = 'success'
) {
  clearTimeout(notificationTimer)

  notification.value = message
  notificationType.value = type

  notificationTimer = setTimeout(() => {
    notification.value = ''
  }, 3000)
}

/* ZAPISYWANIE GRY */

function toggleLibrary() {
  if (!props.game.id) {
    showNotification(
      'Nie znaleziono identyfikatora gry.',
      'error'
    )

    return
  }

  const wasSaved = isSaved.value

  const success = libraryStore.toggleGame(
    props.game.id
  )

  if (!success) {
    showNotification(
      libraryStore.error ||
      'Nie udało się zapisać zmian.',
      'error'
    )

    return
  }

  showNotification(
    wasSaved
      ? 'Usunięto z biblioteki'
      : 'Dodano do biblioteki'
  )
}

/* IKONY PLATFORM */

function platformIcon(platform) {
  const name = platform.toLowerCase()

  if (
    name.includes('playstation') ||
    /^ps[345]$/.test(name)
  ) {
    return 'PS'
  }

  if (name.includes('xbox')) {
    return 'X'
  }

  if (
    name.includes('switch') ||
    name.includes('nintendo')
  ) {
    return 'N'
  }

  if (
    name.includes('pc') ||
    name.includes('windows')
  ) {
    return 'PC'
  }

  if (name.includes('mac')) {
    return 'MAC'
  }

  if (name.includes('linux')) {
    return 'L'
  }

  return platform.slice(0, 3).toUpperCase()
}

/* RESET KOMPONENTU */

watch(
  () => [props.game.id, cover.value],
  () => {
    imageFailed.value = false
    notification.value = ''

    clearTimeout(notificationTimer)
  }
)

onUnmounted(() => {
  clearTimeout(notificationTimer)
})
</script>

<template>
  <article
    class="popular-game-card"
    :class="{ 'is-saved': isSaved }"
  >

    <!-- OKLADKA GRY -->

    <div class="cover-wrapper">

      <RouterLink
        :to="gameLink"
        class="cover-link"
        :aria-label="`Zobacz ${title}`"
      >

        <img
          v-if="cover && !imageFailed"
          :src="cover"
          :alt="title"
          loading="lazy"
          decoding="async"
          @error="imageFailed = true"
        />

        <div
          v-else
          class="cover-placeholder"
        >

          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
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

      <!-- OCENA -->

      <span class="rating-badge">
        ★ {{ rating }}
      </span>

      <!-- PRZYCISK BIBLIOTEKI -->

      <button
        type="button"
        class="bookmark-button"
        :class="{ saved: isSaved }"
        :aria-label="bookmarkLabel"
        :aria-pressed="isSaved"
        :title="bookmarkLabel"
        @click.stop="toggleLibrary"
      >

        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          :fill="isSaved ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 3h12v18l-6-4-6 4z"/>
        </svg>

      </button>

      <!-- STATUS ZAPISANEJ GRY -->

      <span
        v-if="isSaved && statusInformation"
        class="library-status"
        :style="{ color: statusInformation.color }"
      >

        <span class="status-dot"></span>

        {{ statusInformation.label }}

      </span>

    </div>

    <!-- INFORMACJE -->

    <div class="card-content">

      <RouterLink
        :to="gameLink"
        class="game-title"
      >
        {{ title }}
      </RouterLink>

      <div class="genre-tags">

        <span
          v-for="genre in genres.slice(0, 2)"
          :key="genre"
        >
          {{ genre }}
        </span>

      </div>

      <!-- STOPKA KARTY -->

      <div class="card-footer">

        <div
          class="platforms"
          aria-label="Dostępne platformy"
        >

          <span
            v-for="platform in platforms.slice(0, 3)"
            :key="platform"
            class="platform-icon"
            :title="platform"
            :aria-label="platform"
          >
            {{ platformIcon(platform) }}
          </span>

          <span
            v-if="platforms.length > 3"
            class="more-platforms"
          >
            +{{ platforms.length - 3 }}
          </span>

        </div>

        <RouterLink
          :to="gameLink"
          class="details-link"
          :aria-label="`Szczegóły gry ${title}`"
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
            <path d="M5 12h14m-6-6 6 6-6 6"/>
          </svg>

        </RouterLink>

      </div>

    </div>

    <!-- POWIADOMIENIE -->

    <Transition name="toast">

      <div
        v-if="notification"
        class="card-notification"
        :class="notificationType"
        role="status"
      >

        <span aria-hidden="true">
          {{ notificationType === 'success' ? '✓' : '!' }}
        </span>

        {{ notification }}

      </div>

    </Transition>

  </article>
</template>

<style scoped>

.popular-game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.popular-game-card:hover {
  transform: translateY(-3px);
  border-color: #8B5CF6;
  box-shadow: 0 8px 25px rgba(0,0,0,.25);
}

.popular-game-card.is-saved {
  border-color: #59458A;
}

/* OKLADKA */

.cover-wrapper {
  position: relative;
  overflow: hidden;
  background: #201B36;
}

.cover-link {
  display: block;
  width: 100%;
  aspect-ratio: 460 / 215;
  overflow: hidden;
}

.cover-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}

.popular-game-card:hover .cover-link img {
  transform: scale(1.05);
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #31234F,
    #111827
  );
  color: #C4B5FD;
}

.cover-placeholder span {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
}

/* OCENA */

.rating-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 9px;
  background: rgba(11,15,25,.9);
  border: 1px solid #164E63;
  border-radius: 6px;
  color: #67E8F9;
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
}

/* ZAKLADKA */

.bookmark-button {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: rgba(11,15,25,.9);
  border: 1px solid #475569;
  border-radius: 8px;
  color: #F8FAFC;
  cursor: pointer;
  transition:
    background .2s,
    border-color .2s,
    color .2s;
}

.bookmark-button:hover {
  background: #31234F;
  border-color: #8B5CF6;
  color: #C4B5FD;
}

.bookmark-button.saved {
  background: #8B5CF6;
  border-color: #A78BFA;
  color: #FFFFFF;
}

/* STATUS BIBLIOTEKI */

.library-status {
  position: absolute;
  bottom: 9px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 20px);
  padding: 5px 8px;
  background: rgba(11,15,25,.94);
  border: 1px solid #293244;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  pointer-events: none;
}

.status-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
}

/* TRESC */

.card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
}

.game-title {
  display: -webkit-box;
  min-height: 42px;
  overflow: hidden;
  color: #F8FAFC;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.35;
  text-decoration: none;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-title:hover {
  color: #C4B5FD;
}

/* GATUNKI */

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
  margin: 10px 0 15px;
}

.genre-tags span {
  padding: 4px 7px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 4px;
  color: #C4B5FD;
  font-size: 10px;
  line-height: 1.4;
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

.platforms {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.platform-icon {
  display: grid;
  place-items: center;
  min-width: 25px;
  height: 25px;
  padding: 0 5px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 5px;
  color: #94A3B8;
  font-size: 9px;
  font-weight: 800;
}

.more-platforms {
  color: #94A3B8;
  font-size: 10px;
}

.details-link {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 6px;
  color: #C4B5FD;
  text-decoration: none;
}

.details-link:hover {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: #FFFFFF;
}

/* POWIADOMIENIA */

.card-notification {
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 8px;
  border: 1px solid;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,.3);
  pointer-events: none;
}

.card-notification.success {
  background: #143529;
  border-color: #166534;
  color: #86EFAC;
}

.card-notification.error {
  background: #3D222B;
  border-color: #991B1B;
  color: #FCA5A5;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity .2s,
    transform .2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
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
    border-radius: 9px;
  }

  .card-content {
    padding: 12px;
  }

  .game-title {
    min-height: 36px;
    font-size: 13px;
  }

  .rating-badge {
    top: 7px;
    left: 7px;
    padding: 4px 6px;
    font-size: 10px;
  }

  .bookmark-button {
    top: 6px;
    right: 6px;
    width: 34px;
    height: 34px;
  }

  .bookmark-button svg {
    width: 17px;
    height: 17px;
  }

  .library-status {
    bottom: 6px;
    left: 7px;
    font-size: 9px;
  }

  .genre-tags {
    gap: 4px;
    margin: 8px 0 12px;
  }

  .genre-tags span {
    padding: 3px 5px;
    font-size: 9px;
  }

  .platforms {
    gap: 4px;
  }

  .platform-icon {
    min-width: 20px;
    height: 22px;
    padding: 0 3px;
    font-size: 8px;
  }

  .details-link {
    width: 27px;
    height: 27px;
  }

  .card-footer {
    gap: 5px;
    padding-top: 10px;
  }

}

@media (max-width: 360px) {

  .card-content {
    padding: 9px;
  }

  .genre-tags span {
    font-size: 8px;
  }

}

@media (hover: none) {

  .popular-game-card:hover {
    transform: none;
  }

}

@media (prefers-reduced-motion: reduce) {

  .popular-game-card,
  .cover-link img,
  .bookmark-button,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }

  .popular-game-card:hover,
  .popular-game-card:hover .cover-link img {
    transform: none;
  }

}

</style>
