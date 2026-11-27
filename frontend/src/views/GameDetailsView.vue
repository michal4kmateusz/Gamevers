
<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import PopularGameCard from '../components/games/PopularGameCard.vue'
import GameReviews from '../components/games/GameReviews.vue'

import {
  getGame,
  getGames
} from '../services/gameService'

import { useAuthStore } from '../stores/authStore'

import {
  useLibraryStore,
  LIBRARY_STATUSES
} from '../stores/libraryStore'

const route = useRoute()
const authStore = useAuthStore()
const libraryStore = useLibraryStore()

/* DANE Z API */

const game = ref(null)
const relatedGames = ref([])
const loading = ref(true)
const error = ref('')
const notFound = ref(false)

let requestVersion = 0

/* STAN INTERFEJSU */

const activeTab = ref('overview')
const coverFailed = ref(false)
const bannerFailed = ref(false)
const notification = ref('')
const notificationType = ref('success')
const selectedStatus = ref('wishlist')
const copied = ref(false)

/* POBIERANIE GRY */

async function fetchGame() {
  const version = ++requestVersion

  loading.value = true
  error.value = ''
  notFound.value = false
  game.value = null
  relatedGames.value = []

  try {
    const result = await getGame(route.params.slug)

    if (version !== requestVersion) return

    game.value = result

    loading.value = false

    await fetchRelatedGames(result, version)

  } catch (err) {
    if (version !== requestVersion) return

    notFound.value = err.response?.status === 404

    error.value = notFound.value
      ? 'Nie znaleziono gry.'
      : 'Nie udało się pobrać danych gry.'

  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

/* PODOBNE GRY */

async function fetchRelatedGames(currentGame, version) {
  const category = currentGame.categories?.[0]

  if (!category?.slug) return

  try {
    const response = await getGames({
      category: category.slug,
      per_page: 5,
      sort: 'popular'
    })

    if (version !== requestVersion) return

    relatedGames.value = response.data
      .filter(item => item.id !== currentGame.id)
      .slice(0, 4)

  } catch {
    if (version === requestVersion) {
      relatedGames.value = []
    }
  }
}

/* BIBLIOTEKA */

const isSaved = computed(() =>
  game.value
    ? libraryStore.hasGame(game.value.id)
    : false
)

const currentStatus = computed(() =>
  game.value
    ? libraryStore.getStatus(game.value.id)
    : null
)

const currentStatusLabel = computed(() =>
  libraryStore.getStatusLabel(currentStatus.value)
)

const currentStatusColor = computed(() =>
  LIBRARY_STATUSES.find(
    status => status.value === currentStatus.value
  )?.color || '#94A3B8'
)

/* POWIADOMIENIA */

function showNotification(message, type = 'success') {
  notification.value = message
  notificationType.value = type
}

function canEditLibrary() {
  if (!authStore.isAuthenticated) {
    showNotification(
      'Zaloguj się, aby korzystać z biblioteki.',
      'error'
    )

    return false
  }

  return !libraryStore.saving
}

/* DODAWANIE GRY */

async function addToLibrary() {
  if (!game.value || isSaved.value || !canEditLibrary()) {
    return
  }

  const currentGame = game.value

  const success = await libraryStore.addGame(
    currentGame.id,
    selectedStatus.value
  )

  if (success) {
    showNotification(
      `${currentGame.title} dodano do biblioteki.`
    )
  } else {
    showNotification(
      libraryStore.error || 'Nie udało się dodać gry.',
      'error'
    )
  }
}

/* ZMIANA STATUSU */

async function changeStatus(event) {
  if (!game.value || !canEditLibrary()) {
    event.target.value = currentStatus.value
    return
  }

  const success = await libraryStore.updateStatus(
    game.value.id,
    event.target.value
  )

  if (success) {
    showNotification('Zmieniono status gry.')
  } else {
    event.target.value = currentStatus.value

    showNotification(
      libraryStore.error || 'Nie udało się zmienić statusu.',
      'error'
    )
  }
}

/* USUWANIE GRY */

async function removeFromLibrary() {
  if (!game.value || !isSaved.value || !canEditLibrary()) {
    return
  }

  if (!window.confirm(
    `Usunąć ${game.value.title} z biblioteki?`
  )) {
    return
  }

  const success = await libraryStore.removeGame(
    game.value.id
  )

  if (success) {
    selectedStatus.value = 'wishlist'

    showNotification(
      'Usunięto grę z biblioteki.'
    )
  } else {
    showNotification(
      libraryStore.error || 'Nie udało się usunąć gry.',
      'error'
    )
  }
}

async function toggleRelatedGame(relatedGame) {
  if (!canEditLibrary()) return

  const success = await libraryStore.toggleGame(
    relatedGame.id
  )

  if (success) {
    showNotification('Zaktualizowano bibliotekę.')
  } else {
    showNotification(libraryStore.error, 'error')
  }
}

/* ZAKLADKI */

const tabs = [
  { id: 'overview', label: 'Informacje' },
  { id: 'reviews', label: 'Recenzje' },
  { id: 'related', label: 'Podobne gry' }
]

/* RECENZJE - DO POZNIEJSZEJ INTEGRACJI */

async function refreshGameRating(gameId) {
  const version = requestVersion
  const slug = route.params.slug

  if (Number(game.value?.id) !== Number(gameId)) return

  try {
    const updatedGame = await getGame(slug)

    if (version !== requestVersion) return
    if (Number(game.value?.id) !== Number(gameId)) return

    game.value = updatedGame
  } catch {
    showNotification(
      'Nie udalo sie odswiezyc oceny gry.',
      'error'
    )
  }
}

/* FORMATOWANIE */

function formatRating(rating) {
  if (rating == null || rating === '') {
    return '—'
  }

  const value = Number(rating)

  return Number.isFinite(value)
    ? value.toFixed(1)
    : '—'
}

function formatDate(date) {
  if (!date) return 'Brak informacji'

  const parsed = new Date(
    String(date).slice(0, 10) + 'T00:00:00'
  )

  if (Number.isNaN(parsed.getTime())) {
    return 'Brak informacji'
  }

  return parsed.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/* BANER */

const heroStyle = computed(() => {
  if (
    !game.value?.banner_url ||
    bannerFailed.value
  ) {
    return {}
  }

  return {
    backgroundImage: `
      linear-gradient(
        90deg,
        rgba(11,15,25,.96),
        rgba(11,15,25,.70) 50%,
        rgba(11,15,25,.12)
      ),
      linear-gradient(
        0deg,
        rgba(11,15,25,.95),
        transparent
      ),
      url('${game.value.banner_url}')
    `
  }
})

/* INFORMACJE O GRZE */

const gameInformation = computed(() => {
  if (!game.value) return []

  return [
    {
      label: 'Data premiery',
      value: formatDate(game.value.release_date),
      icon: '◷'
    },
    {
      label: 'Producent',
      value: game.value.developer,
      icon: '◇'
    },
    {
      label: 'Wydawca',
      value: game.value.publisher,
      icon: '▤'
    },
    {
      label: 'Gatunki',
      value: game.value.genres?.join(' · '),
      icon: '◈'
    },
    {
      label: 'Platformy',
      value: game.value.platforms?.join(' · '),
      icon: '▣'
    }
  ]
})

/* UDOSTEPNIANIE */

async function shareGame() {
  try {
    await navigator.clipboard.writeText(
      window.location.href
    )

    copied.value = true

    showNotification('Skopiowano link do gry.')

  } catch {
    showNotification(
      'Nie udało się skopiować linku.',
      'error'
    )
  }
}

/* OBSLUGA ZMIANY ADRESU */

watch(
  () => route.params.slug,
  () => {
    activeTab.value = 'overview'
    coverFailed.value = false
    bannerFailed.value = false
    notification.value = ''
    selectedStatus.value = 'wishlist'
    copied.value = false

    fetchGame()
  },
  { immediate: true }
)
</script>

<template>
  <main class="details-page">
    <div class="details-container">

      <section v-if="loading" class="not-found">
      <h1>Wczytywanie gry...</h1>
    </section>

    <section v-else-if="error" class="not-found">
      <h1>{{ error }}</h1>
      <RouterLink to="/games">
        Wróć do katalogu
      </RouterLink>
    </section>

    <template v-else-if="game">

        <!-- NAWIGACJA -->

        <nav class="breadcrumbs"
          aria-label="Ścieżka nawigacji">

          <RouterLink to="/">
            Strona główna
          </RouterLink>

          <span>/</span>

          <RouterLink to="/games">
            Gry
          </RouterLink>

          <span>/</span>

          <span aria-current="page">
            {{ game.title }}
          </span>

        </nav>

        <!-- BANER -->

        <section
          class="game-hero"
          :style="heroStyle"
        >

          <img
            v-if="game.banner_url"
            class="banner-check"
            :src="game.banner_url"
            alt=""
            aria-hidden="true"
            @error="bannerFailed = true"
          />

          <div class="hero-content">

            <span class="section-label">
              GAMEVERS / KATALOG GIER
            </span>

            <div class="genre-tags">

              <RouterLink
                v-for="genre in game.genres"
                :key="genre"
                :to="{
                  path: '/games',
                  query: { genre }
                }"
              >
                {{ genre }}
              </RouterLink>

            </div>

            <h1>{{ game.title }}</h1>

            <p class="hero-meta">
              {{ game.developer }}
              ·
              {{ game.release_date?.slice(0, 4) }}
            </p>

            <div class="hero-rating">

              <strong>
                ★ {{ formatRating(game.rating) }}
                <small>/ 10</small>
              </strong>

              <div class="rating-description">
                <b>Ocena gry</b>
                <span>
                  {{
                    game.is_demo_rating
                      ? 'Ocena demonstracyjna'
                      : game.has_reviews
                        ? 'Ocena społeczności'
                        : 'Brak ocen społeczności'
                  }}
                </span>
              </div>

            </div>

            <!-- GRA NIEZAPISANA -->

            <div
              v-if="!isSaved"
              class="library-actions"
            >

              <label for="library-status">
                Wybierz status rozgrywki
              </label>

              <div class="action-row">

                <select
                  id="library-status"
                  v-model="selectedStatus"
                >

                  <option
                    v-for="status in LIBRARY_STATUSES"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>

                </select>

                <button
                  type="button"
                  class="primary-button"
                  @click="addToLibrary"
                >

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path d="M6 3h12v18l-6-4-6 4z"/>
                    <path d="M9 9h6m-3-3v6"/>
                  </svg>

                  Dodaj do biblioteki

                </button>

              </div>

            </div>

            <!-- GRA ZAPISANA -->

            <div
              v-else
              class="library-actions saved-panel"
            >

              <div class="saved-heading">

                <span class="saved-icon">✓</span>

                <div>

                  <strong>
                    Gra w Twojej bibliotece
                  </strong>

                  <span
                    :style="{ color: currentStatusColor }"
                  >
                    {{ currentStatusLabel }}
                  </span>

                </div>

              </div>

              <div class="action-row">

                <select
                  :value="currentStatus"
                  aria-label="Zmień status rozgrywki"
                  @change="changeStatus"
                >

                  <option
                    v-for="status in LIBRARY_STATUSES"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>

                </select>

                <RouterLink
                  to="/library"
                  class="primary-button"
                >
                  Moja biblioteka →
                </RouterLink>

                <button
                  type="button"
                  class="remove-button"
                  @click="removeFromLibrary"
                >
                  Usuń
                </button>

              </div>

            </div>

            <!-- UDOSTEPNIANIE -->

            <button
              type="button"
              class="secondary-button share-button"
              @click="shareGame"
            >

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="m9 10 6-3m-6 7 6 3"/>
              </svg>

              {{ copied ? 'Skopiowano link' : 'Udostępnij grę' }}

            </button>

            <p v-if="!authStore.isAuthenticated" class="library-notice">
              Zaloguj się, aby zapisywać gry w swojej bibliotece.
            </p>

          </div>

        </section>

        <!-- POWIADOMIENIA -->

        <Transition name="notification">

          <div
            v-if="notification"
            class="notification"
            :class="notificationType"
            role="status"
          >

            <span>{{ notification }}</span>

            <button
              type="button"
              aria-label="Zamknij powiadomienie"
              @click="notification = ''"
            >
              ×
            </button>

          </div>

        </Transition>

        <!-- ZAKLADKI -->

        <nav
          class="details-tabs"
          aria-label="Sekcje szczegółów gry"
        >

          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="{ active: activeTab === tab.id }"
            :aria-pressed="activeTab === tab.id"
            @click="activeTab = tab.id"
          >

            {{ tab.label }}

            <span v-if="tab.id === 'reviews'">
              {{ game.reviews_count || 0 }}
            </span>

          </button>

        </nav>

        <!-- INFORMACJE -->

        <div
          v-if="activeTab === 'overview'"
          class="details-layout"
        >

          <div class="main-content">

            <section class="content-card">

              <span class="section-label">
                POZNAJ GRĘ
              </span>

              <h2>O grze</h2>

              <p class="game-description">
                {{ game.description }}
              </p>

            </section>

            <section class="content-card">

              <h2>Gatunki gry</h2>

              <p class="section-description">
                Odkrywaj gry w podobnym stylu.
              </p>

              <div class="category-links">

                <RouterLink
                  v-for="genre in game.genres"
                  :key="genre"
                  :to="{
                    path: '/games',
                    query: { genre }
                  }"
                >
                  {{ genre }} →
                </RouterLink>

              </div>

            </section>

            <section class="content-card">

              <h2>Dostępne platformy</h2>

              <div class="platform-grid">

                <RouterLink
                  v-for="platform in game.platforms"
                  :key="platform"
                  :to="{
                    path: '/games',
                    query: { platform }
                  }"
                  class="platform-card"
                >

                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4"
                      width="18" height="13" rx="2"/>
                    <path d="M8 21h8m-4-4v4"/>
                  </svg>

                  <strong>{{ platform }}</strong>

                </RouterLink>

              </div>

            </section>

          </div>

          <!-- PANEL BOCZNY -->

          <aside class="information-card">

            <div class="game-cover">

              <img
                v-if="game.cover_url && !coverFailed"
                :src="game.cover_url"
                :alt="game.title"
                @error="coverFailed = true"
              />

              <div v-else class="cover-placeholder">
                GAMEVERS
              </div>

            </div>

            <div class="information-content">

              <h2>Informacje o grze</h2>

              <div
                v-for="item in gameInformation"
                :key="item.label"
                class="information-row"
              >

                <span
                  class="information-icon"
                  aria-hidden="true"
                >
                  {{ item.icon }}
                </span>

                <div>
                  <span>{{ item.label }}</span>
                  <strong>
                    {{ item.value || 'Brak danych' }}
                  </strong>
                </div>

              </div>

              <a
                v-if="game.steam_id"
                :href="`https://store.steampowered.com/app/${game.steam_id}/`"
                target="_blank"
                rel="noopener noreferrer"
                class="secondary-button steam-link"
              >
                Zobacz na Steam ↗
              </a>

            </div>

          </aside>

        </div>

        <!-- RECENZJE -->

        <GameReviews
          v-if="activeTab === 'reviews'"
          :key="game.id"
          :game-id="game.id"
          @updated="refreshGameRating"
        />

        <!-- PODOBNE GRY -->

        <section
          v-if="
            activeTab === 'overview' ||
            activeTab === 'related'
          "
          class="related-section"
        >

          <div class="section-heading">

            <div>

              <span class="section-label">
                ODKRYWAJ WIĘCEJ
              </span>

              <h2>Podobne gry</h2>

              <p class="section-description">
                Tytuły dopasowane na podstawie gatunków.
              </p>

            </div>

            <RouterLink to="/games">
              Zobacz katalog →
            </RouterLink>

          </div>

          <div
            v-if="relatedGames.length"
            class="related-grid"
          >

            <PopularGameCard
              v-for="relatedGame in relatedGames"
              :key="relatedGame.id"
              :game="relatedGame"
              :saved="libraryStore.hasGame(relatedGame.id)"
              @add-to-library="toggleRelatedGame(relatedGame)"
            />

          </div>

          <div v-else class="content-card">
            Nie znaleziono podobnych gier.
          </div>

        </section>

        <p class="demo-notice">
          Gamevers — wersja demonstracyjna.
          Katalog gier połączony z API Laravel.
        </p>

      </template>

      <!-- BLAD 404 -->

      <section v-else class="not-found">

        <strong>404</strong>

        <h1>Nie znaleziono gry</h1>

        <p>
          Gra o podanym identyfikatorze
          nie istnieje w katalogu.
        </p>

        <RouterLink
          to="/games"
          class="primary-button"
        >
          ← Wróć do katalogu
        </RouterLink>

      </section>

    </div>
  </main>
</template>

<style scoped>

.details-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 24px 50px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.details-container {
  width: 100%;
  max-width: 1400px;
  min-width: 0;
  margin: 0 auto;
}

/* NAWIGACJA */

.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 20px;
  color: #94A3B8;
  font-size: 12px;
}

.breadcrumbs a {
  color: inherit;
  text-decoration: none;
}

.breadcrumbs a:hover,
.breadcrumbs span:last-child {
  color: #C4B5FD;
}

/* BANER */

.game-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 470px;
  overflow: hidden;
  background-color: #151B2B;
  background-position: center;
  background-size: cover;
  border: 1px solid #293244;
  border-radius: 15px;
}

.banner-check {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.hero-content {
  position: relative;
  width: 100%;
  max-width: 850px;
  padding: 40px;
}

.section-label {
  display: block;
  margin-bottom: 13px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.genre-tags a {
  padding: 6px 10px;
  background: #31234F;
  border: 1px solid #8B5CF6;
  border-radius: 5px;
  color: #E9D5FF;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.hero-content h1 {
  margin: 20px 0 10px;
  color: #FFFFFF;
  font-size: clamp(32px, 5vw, 62px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -1.8px;
  overflow-wrap: anywhere;
}

.hero-meta {
  margin: 0;
  color: #CBD5E1;
  font-size: 14px;
}

/* OCENA */

.hero-rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin: 24px 0;
}

.hero-rating > strong {
  color: #67E8F9;
  font-size: 36px;
  font-weight: 800;
}

.hero-rating small {
  color: #94A3B8;
  font-size: 13px;
  font-weight: 500;
}

.rating-description {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 18px;
  border-left: 1px solid #475569;
  font-size: 13px;
}

.rating-description span {
  color: #94A3B8;
  font-size: 11px;
}

/* BIBLIOTEKA */

.library-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 650px;
}

.library-actions label {
  color: #CBD5E1;
  font-size: 12px;
  font-weight: 600;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 10px;
}

.action-row select {
  min-width: 155px;
  min-height: 44px;
  padding: 10px 13px;
  background: #151B2B;
  border: 1px solid #475569;
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 13px;
  cursor: pointer;
}

.saved-panel {
  padding: 17px;
  background: rgba(20,53,41,.65);
  border: 1px solid #166534;
  border-radius: 10px;
}

.saved-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 5px;
}

.saved-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 37px;
  height: 37px;
  background: #143529;
  border: 1px solid #166534;
  border-radius: 50%;
  color: #4ADE80;
  font-size: 21px;
}

.saved-heading > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saved-heading strong {
  color: #86EFAC;
  font-size: 13px;
}

.saved-heading div span {
  font-size: 11px;
}

/* PRZYCISKI */

.primary-button,
.secondary-button,
.remove-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 11px 17px;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s, border-color .2s;
}

.primary-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
}

.primary-button:hover {
  background: #7C3AED;
}

.secondary-button {
  background: #151B2B;
  border: 1px solid #475569;
}

.secondary-button:hover {
  background: #31234F;
  border-color: #8B5CF6;
}

.remove-button {
  background: #3D222B;
  border: 1px solid #7F1D1D;
  color: #FCA5A5;
}

.remove-button:hover {
  background: #7F1D1D;
}

.share-button {
  margin-top: 12px;
}

.library-notice {
  margin: 13px 0 0;
  color: #94A3B8;
  font-size: 11px;
}

/* POWIADOMIENIA */

.notification {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: max-content;
  max-width: min(420px, calc(100vw - 48px));
  padding: 15px 18px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 13px;
  box-shadow: 0 12px 35px rgba(0,0,0,.35);
}

.notification.success {
  background: #143529;
  border-color: #166534;
  color: #86EFAC;
}

.notification.error {
  background: #3D222B;
  border-color: #991B1B;
  color: #FCA5A5;
}

.notification button {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 23px;
  cursor: pointer;
}

.notification-enter-active,
.notification-leave-active {
  transition: opacity .2s, transform .2s;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ZAKLADKI */

.details-tabs {
  display: flex;
  gap: 25px;
  margin: 24px 0;
  overflow-x: auto;
  border-bottom: 1px solid #293244;
}

.details-tabs button {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 7px;
  min-height: 48px;
  padding: 10px 5px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #94A3B8;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.details-tabs button.active {
  border-bottom-color: #8B5CF6;
  color: #C4B5FD;
}

.details-tabs button span {
  padding: 2px 6px;
  background: #31234F;
  border-radius: 5px;
  color: #C4B5FD;
  font-size: 10px;
}

/* UKLAD TRESCI */

.details-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) minmax(280px, 340px);
  align-items: start;
  gap: 24px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.content-card,
.information-card {
  min-width: 0;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
}

.content-card {
  padding: 26px;
}

.content-card h2,
.information-content h2,
.section-heading h2 {
  margin: 0 0 14px;
  color: #F8FAFC;
  font-size: 21px;
  line-height: 1.3;
}

.game-description {
  margin: 0;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.9;
}

.section-description {
  margin: 0 0 18px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

/* GATUNKI */

.category-links {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.category-links a {
  padding: 10px 13px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 7px;
  color: #C4B5FD;
  font-size: 12px;
  text-decoration: none;
}

.category-links a:hover {
  background: #31234F;
  border-color: #8B5CF6;
}

/* PLATFORMY */

.platform-grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.platform-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 100px;
  padding: 14px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #C4B5FD;
  text-align: center;
  text-decoration: none;
}

.platform-card strong {
  color: #CBD5E1;
  font-size: 12px;
}

.platform-card:hover {
  border-color: #8B5CF6;
}

/* PANEL BOCZNY */

.information-card {
  overflow: hidden;
}

.game-cover {
  aspect-ratio: 460 / 215;
  overflow: hidden;
  background: #201B36;
}

.game-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #C4B5FD;
  font-weight: 800;
  letter-spacing: 2px;
}

.information-content {
  padding: 22px;
}

.information-content h2 {
  font-size: 17px;
}

.information-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid #293244;
}

.information-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  background: #201B36;
  border-radius: 7px;
  color: #C4B5FD;
  font-size: 19px;
}

.information-row > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.information-row div span {
  color: #94A3B8;
  font-size: 11px;
}

.information-row strong {
  color: #F8FAFC;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.steam-link {
  display: flex;
  width: 100%;
  margin-top: 20px;
}

/* RECENZJE */

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-card {
  padding: 20px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 10px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  background: #31234F;
  border-radius: 50%;
  color: #C4B5FD;
  font-size: 17px;
  font-weight: 700;
}

.review-author {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.review-author strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}

.review-author span {
  color: #94A3B8;
  font-size: 10px;
}

.review-rating {
  margin-left: auto;
  padding: 6px 9px;
  background: #123443;
  border-radius: 5px;
  color: #67E8F9;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.review-card p {
  margin: 18px 0 0;
  color: #CBD5E1;
  font-size: 13px;
  line-height: 1.8;
}

.empty-reviews {
  padding: 35px 15px;
  text-align: center;
}

.empty-reviews > span {
  color: #A78BFA;
  font-size: 45px;
}

.empty-reviews h3 {
  font-size: 17px;
}

.empty-reviews p {
  color: #94A3B8;
  font-size: 13px;
}

.review-notice {
  margin-top: 24px;
  padding: 20px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 9px;
}

.review-notice h3 {
  margin: 0 0 10px;
  color: #C4B5FD;
  font-size: 15px;
}

.review-notice p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
  line-height: 1.7;
}

/* PODOBNE GRY */

.related-section {
  margin-top: 35px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-heading a {
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.section-heading .section-description {
  margin-bottom: 0;
}

.related-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

.demo-notice {
  margin: 30px 0 0;
  color: #94A3B8;
  font-size: 11px;
  text-align: center;
}

/* BLAD 404 */

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 30px;
  text-align: center;
}

.not-found > strong {
  color: #8B5CF6;
  font-size: 100px;
  line-height: 1;
}

.not-found h1 {
  margin: 20px 0 10px;
  font-size: 28px;
}

.not-found p {
  max-width: 400px;
  margin: 0 0 25px;
  color: #94A3B8;
  font-size: 14px;
}

/* DOSTEPNOSC */

button:focus-visible,
a:focus-visible,
select:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* TABLETY */

@media (max-width: 1000px) {
  .details-layout {
    grid-template-columns:
      minmax(0, 1fr) minmax(250px, 290px);
    gap: 18px;
  }

  .related-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .hero-content {
    padding: 30px;
  }
}

@media (max-width: 800px) {
  .details-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .game-cover {
    max-height: 250px;
  }
}

/* TELEFONY */

@media (max-width: 600px) {
  .details-page {
    padding: 14px 14px 35px;
  }

  .breadcrumbs {
    gap: 7px;
    margin-bottom: 14px;
    font-size: 11px;
  }

  .game-hero {
    min-height: 480px;
    background-position: 65% center;
    border-radius: 12px;
  }

  .hero-content {
    padding: 22px;
    background: linear-gradient(
      0deg,
      rgba(11,15,25,.98),
      rgba(11,15,25,.65) 80%,
      transparent
    );
  }

  .hero-content h1 {
    font-size: 34px;
    letter-spacing: -1px;
  }

  .hero-meta {
    font-size: 12px;
  }

  .genre-tags a {
    padding: 5px 7px;
    font-size: 10px;
  }

  .hero-rating {
    gap: 12px;
    margin: 18px 0;
  }

  .hero-rating > strong {
    font-size: 29px;
  }

  .rating-description {
    padding-left: 12px;
  }

  .action-row {
    flex-direction: column;
    gap: 9px;
  }

  .action-row select,
  .action-row button,
  .action-row a,
  .share-button {
    width: 100%;
    min-height: 46px;
  }

  .saved-panel {
    padding: 14px;
  }

  .notification {
    right: 14px;
    bottom: 14px;
    left: 14px;
    width: auto;
    max-width: none;
  }

  .details-tabs {
    gap: 17px;
    margin: 16px 0 20px;
  }

  .details-tabs button {
    font-size: 12px;
  }

  .main-content {
    gap: 14px;
  }

  .content-card,
  .information-content {
    padding: 19px;
  }

  .content-card h2,
  .section-heading h2 {
    font-size: 19px;
  }

  .game-description {
    font-size: 13px;
  }

  .platform-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .related-grid {
    gap: 11px;
  }

  .review-card {
    padding: 14px;
  }

  .review-header {
    gap: 8px;
  }

  .avatar {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}

@media (max-width: 360px) {
  .details-page {
    padding-right: 10px;
    padding-left: 10px;
  }

  .hero-content {
    padding: 17px;
  }

  .hero-content h1 {
    font-size: 29px;
  }

  .details-tabs {
    gap: 10px;
  }

  .related-grid {
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .primary-button,
  .secondary-button,
  .remove-button,
  .notification-enter-active,
  .notification-leave-active {
    transition: none;
  }
}

</style>
