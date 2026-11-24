
<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  games,
  genres,
  platforms,
  filterGames
} from '../data/games'

import {
  useLibraryStore,
  LIBRARY_STATUSES
} from '../stores/libraryStore'

const route = useRoute()
const router = useRouter()
const libraryStore = useLibraryStore()

/* STAN FILTROW */

const search = ref('')
const selectedGenre = ref('')
const selectedPlatform = ref('')
const minRating = ref(0)
const sort = ref('popular')

const filtersOpen = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)

const resultsSection = ref(null)
const failedImages = ref({})

/* POWIADOMIENIA */

const notification = ref('')
const notificationType = ref('success')

let notificationTimer = null

function showNotification(message, type = 'success') {
  clearTimeout(notificationTimer)

  notification.value = message
  notificationType.value = type

  notificationTimer = setTimeout(() => {
    notification.value = ''
  }, 3500)
}

onUnmounted(() => {
  clearTimeout(notificationTimer)
})

/* BIBLIOTEKA */

function isSaved(gameId) {
  return libraryStore.hasGame(gameId)
}

function getStatusInformation(gameId) {
  const status = libraryStore.getStatus(gameId)

  return LIBRARY_STATUSES.find(
    item => item.value === status
  ) || null
}

function toggleLibrary(game) {
  const wasSaved = isSaved(game.id)

  const success = libraryStore.toggleGame(game.id)

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
      ? `Usunięto ${game.title} z biblioteki.`
      : `Dodano ${game.title} do biblioteki.`
  )
}

const savedGamesCount = computed(() =>
  games.filter(game => isSaved(game.id)).length
)

/* SORTOWANIE */

const sortOptions = [
  {
    value: 'popular',
    label: 'Najpopularniejsze'
  },
  {
    value: 'rating',
    label: 'Najwyżej oceniane'
  },
  {
    value: 'newest',
    label: 'Najnowsze premiery'
  },
  {
    value: 'oldest',
    label: 'Najstarsze premiery'
  },
  {
    value: 'title-asc',
    label: 'Nazwa A–Z'
  },
  {
    value: 'title-desc',
    label: 'Nazwa Z–A'
  }
]

/* PARAMETRY ADRESU URL */

function readQuery(query) {
  search.value =
    typeof query.search === 'string'
      ? query.search
      : ''

  selectedGenre.value =
    genres.includes(query.genre)
      ? query.genre
      : ''

  selectedPlatform.value =
    platforms.includes(query.platform)
      ? query.platform
      : ''

  const rating = Number(query.rating)

  minRating.value =
    Number.isFinite(rating)
      ? Math.min(10, Math.max(0, rating))
      : 0

  sort.value = sortOptions.some(
    option => option.value === query.sort
  )
    ? query.sort
    : 'popular'
}

watch(
  () => route.query,
  query => {
    if (route.path === '/games') {
      readQuery(query)
    }
  },
  { immediate: true }
)

/* FILTROWANIE */

const filteredGames = computed(() =>
  filterGames({
    search: search.value,
    genre: selectedGenre.value,
    platform: selectedPlatform.value,
    minRating: minRating.value,
    sort: sort.value
  })
)

const activeFiltersCount = computed(() =>
  [
    search.value.trim() !== '',
    selectedGenre.value !== '',
    selectedPlatform.value !== '',
    Number(minRating.value) > 0
  ].filter(Boolean).length
)

/* PAGINACJA */

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      filteredGames.value.length / pageSize.value
    )
  )
)

const visibleGames = computed(() => {
  const start =
    (currentPage.value - 1) * pageSize.value

  return filteredGames.value.slice(
    start,
    start + pageSize.value
  )
})

const pageNumbers = computed(() =>
  Array.from(
    { length: totalPages.value },
    (_, index) => index + 1
  )
)

const firstResult = computed(() => {
  if (!filteredGames.value.length) {
    return 0
  }

  return (
    (currentPage.value - 1) *
    pageSize.value + 1
  )
})

const lastResult = computed(() =>
  Math.min(
    currentPage.value * pageSize.value,
    filteredGames.value.length
  )
)

/* SYNCHRONIZACJA ADRESU URL */

function updateQuery() {
  if (route.path !== '/games') {
    return
  }

  const query = {}

  if (search.value !== '') {
    query.search = search.value
  }

  if (selectedGenre.value) {
    query.genre = selectedGenre.value
  }

  if (selectedPlatform.value) {
    query.platform = selectedPlatform.value
  }

  if (Number(minRating.value) > 0) {
    query.rating = String(minRating.value)
  }

  if (sort.value !== 'popular') {
    query.sort = sort.value
  }

  const currentQuery = route.query

  const unchanged =
    Object.keys(query).length ===
      Object.keys(currentQuery).length &&
    Object.keys(query).every(
      key => query[key] === currentQuery[key]
    )

  if (!unchanged) {
    router.replace({
      path: '/games',
      query
    })
  }
}

watch(
  [
    search,
    selectedGenre,
    selectedPlatform,
    minRating,
    sort
  ],
  () => {
    currentPage.value = 1
    updateQuery()
  }
)

watch(pageSize, () => {
  currentPage.value = 1
})

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

/* CZYSZCZENIE FILTROW */

function resetFilters() {
  search.value = ''
  selectedGenre.value = ''
  selectedPlatform.value = ''
  minRating.value = 0
  sort.value = 'popular'
  currentPage.value = 1
}

/* ZMIANA STRONY */

function changePage(page) {
  if (
    page < 1 ||
    page > totalPages.value ||
    page === currentPage.value
  ) {
    return
  }

  currentPage.value = page

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  resultsSection.value?.scrollIntoView({
    behavior: reducedMotion ? 'instant' : 'smooth',
    block: 'start'
  })
}

/* FORMATOWANIE */

function formatRating(rating) {
  const value = Number(rating)

  return Number.isFinite(value)
    ? value.toFixed(1)
    : '—'
}

function releaseYear(date) {
  return date
    ? String(date).slice(0, 4)
    : 'Brak danych'
}

function handleImageError(id) {
  failedImages.value[id] = true
}
</script>

<template>
  <main class="catalog-page">

    <div class="catalog-container">

      <!-- SCIEZKA NAWIGACJI -->

      <nav
        class="breadcrumbs"
        aria-label="Ścieżka nawigacji"
      >

        <RouterLink to="/">
          Strona główna
        </RouterLink>

        <span>/</span>

        <span aria-current="page">
          Katalog gier
        </span>

      </nav>

      <!-- BANER KATALOGU -->

      <section class="catalog-hero">

        <div class="hero-content">

          <span class="eyebrow">
            ODKRYWAJ GAMEVERS
          </span>

          <h1>
            Odkryj świat
            <span>gier.</span>
          </h1>

          <p>
            Przeglądaj katalog, odkrywaj nowe
            gatunki i znajdź swoją następną
            ulubioną grę.
          </p>

          <div class="hero-stats">

            <div>
              <strong>{{ games.length }}</strong>
              <span>Gier</span>
            </div>

            <div>
              <strong>{{ genres.length }}</strong>
              <span>Gatunków</span>
            </div>

            <div>
              <strong>{{ platforms.length }}</strong>
              <span>Platform</span>
            </div>

            <div>
              <strong class="saved-count">
                {{ savedGamesCount }}
              </strong>

              <span>W bibliotece</span>
            </div>

          </div>

          <RouterLink
            to="/library"
            class="hero-library-link"
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
              <path d="M6 3h12v18l-6-4-6 4z"/>
            </svg>

            Moja biblioteka →

          </RouterLink>

        </div>

      </section>

      <!-- WYSZUKIWARKA -->

      <section class="search-panel">

        <div class="search-field">

          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m16 16 5 5"/>
          </svg>

          <input
            v-model="search"
            type="search"
            aria-label="Wyszukaj grę"
            placeholder="Szukaj gry, gatunku, producenta..."
          />

          <button
            v-if="search"
            type="button"
            class="clear-search"
            aria-label="Wyczyść wyszukiwanie"
            @click="search = ''"
          >
            ×
          </button>

        </div>

        <button
          type="button"
          class="mobile-filter-button"
          :aria-expanded="filtersOpen"
          aria-controls="catalog-filters"
          @click="filtersOpen = !filtersOpen"
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16"/>
            <circle cx="8" cy="7" r="2" fill="#151B2B"/>
            <circle cx="15" cy="12" r="2" fill="#151B2B"/>
            <circle cx="10" cy="17" r="2" fill="#151B2B"/>
          </svg>

          Filtry

          <span v-if="activeFiltersCount">
            {{ activeFiltersCount }}
          </span>

        </button>

      </section>

      <!-- GLOWNY UKLAD -->

      <div class="catalog-layout">

        <!-- PANEL FILTROW -->

        <aside
          id="catalog-filters"
          class="filters-panel"
          :class="{ 'filters-open': filtersOpen }"
        >

          <div class="filters-heading">

            <h2>Filtry</h2>

            <button
              type="button"
              class="text-button"
              @click="resetFilters"
            >
              Wyczyść
            </button>

          </div>

          <!-- GATUNKI -->

          <div class="filter-group">

            <h3>Gatunek</h3>

            <div class="filter-options">

              <label
                class="filter-option"
                :class="{ active: selectedGenre === '' }"
              >

                <input
                  v-model="selectedGenre"
                  type="radio"
                  name="genre"
                  value=""
                />

                <span>Wszystkie gatunki</span>

              </label>

              <label
                v-for="genre in genres"
                :key="genre"
                class="filter-option"
                :class="{
                  active: selectedGenre === genre
                }"
              >

                <input
                  v-model="selectedGenre"
                  type="radio"
                  name="genre"
                  :value="genre"
                />

                <span>{{ genre }}</span>

              </label>

            </div>

          </div>

          <!-- PLATFORMY -->

          <div class="filter-group">

            <h3>Platforma</h3>

            <div class="filter-options">

              <label
                class="filter-option"
                :class="{
                  active: selectedPlatform === ''
                }"
              >

                <input
                  v-model="selectedPlatform"
                  type="radio"
                  name="platform"
                  value=""
                />

                <span>Wszystkie platformy</span>

              </label>

              <label
                v-for="platform in platforms"
                :key="platform"
                class="filter-option"
                :class="{
                  active: selectedPlatform === platform
                }"
              >

                <input
                  v-model="selectedPlatform"
                  type="radio"
                  name="platform"
                  :value="platform"
                />

                <span>{{ platform }}</span>

              </label>

            </div>

          </div>

          <!-- MINIMALNA OCENA -->

          <div class="filter-group">

            <div class="rating-heading">

              <h3>Minimalna ocena</h3>

              <strong>
                {{ Number(minRating).toFixed(1) }}
              </strong>

            </div>

            <input
              v-model.number="minRating"
              class="rating-slider"
              type="range"
              min="0"
              max="10"
              step="0.5"
              aria-label="Minimalna ocena gry"
            />

            <div class="range-labels">
              <span>0</span>
              <span>10</span>
            </div>

          </div>

          <button
            type="button"
            class="primary-button mobile-apply"
            @click="filtersOpen = false"
          >
            Pokaż wyniki ({{ filteredGames.length }})
          </button>

        </aside>

        <!-- WYNIKI -->

        <section
          ref="resultsSection"
          class="results-section"
        >

          <div class="results-toolbar">

            <div class="results-heading">

              <h2>Wszystkie gry</h2>

              <p aria-live="polite">
                Znaleziono: {{ filteredGames.length }}
              </p>

            </div>

            <div class="toolbar-controls">

              <select
                v-model="sort"
                aria-label="Sortowanie gier"
              >

                <option
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>

              </select>

              <select
                v-model.number="pageSize"
                aria-label="Liczba gier na stronie"
              >
                <option :value="12">12 / str.</option>
                <option :value="24">24 / str.</option>
                <option :value="30">30 / str.</option>
              </select>

            </div>

          </div>

          <!-- AKTYWNE FILTRY -->

          <div
            v-if="activeFiltersCount"
            class="active-filters"
          >

            <button
              v-if="search"
              type="button"
              @click="search = ''"
            >
              {{ search }} ×
            </button>

            <button
              v-if="selectedGenre"
              type="button"
              @click="selectedGenre = ''"
            >
              {{ selectedGenre }} ×
            </button>

            <button
              v-if="selectedPlatform"
              type="button"
              @click="selectedPlatform = ''"
            >
              {{ selectedPlatform }} ×
            </button>

            <button
              v-if="minRating > 0"
              type="button"
              @click="minRating = 0"
            >
              Ocena od {{ minRating }} ×
            </button>

            <button
              type="button"
              class="reset-chip"
              @click="resetFilters"
            >
              Wyczyść wszystkie
            </button>

          </div>

          <!-- KARTY GIER -->

          <div
            v-if="visibleGames.length"
            class="games-grid"
          >

            <article
              v-for="game in visibleGames"
              :key="game.id"
              class="catalog-card"
              :class="{ 'card-saved': isSaved(game.id) }"
            >

              <!-- OKLADKA -->

              <div class="cover-wrapper">

                <RouterLink
                  :to="`/games/${game.id}`"
                  class="game-cover"
                  :aria-label="`Zobacz ${game.title}`"
                >

                  <img
                    v-if="!failedImages[game.id]"
                    :src="game.cover_url"
                    :alt="game.title"
                    loading="lazy"
                    decoding="async"
                    @error="handleImageError(game.id)"
                  />

                  <div
                    v-else
                    class="cover-placeholder"
                  >
                    GAMEVERS
                  </div>

                </RouterLink>

                <!-- OCENA -->

                <span class="game-rating">
                  ★ {{ formatRating(game.rating) }}
                </span>

                <!-- ZAKLADKA -->

                <button
                  type="button"
                  class="bookmark-button"
                  :class="{ saved: isSaved(game.id) }"
                  :aria-pressed="isSaved(game.id)"
                  :aria-label="
                    isSaved(game.id)
                      ? `Usuń ${game.title} z biblioteki`
                      : `Dodaj ${game.title} do biblioteki`
                  "
                  :title="
                    isSaved(game.id)
                      ? 'Usuń z biblioteki'
                      : 'Dodaj do biblioteki'
                  "
                  @click.stop="toggleLibrary(game)"
                >

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    :fill="
                      isSaved(game.id)
                        ? 'currentColor'
                        : 'none'
                    "
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 3h12v18l-6-4-6 4z"/>
                  </svg>

                </button>

                <!-- STATUS BIBLIOTEKI -->

                <span
                  v-if="
                    isSaved(game.id) &&
                    getStatusInformation(game.id)
                  "
                  class="library-status"
                  :style="{
                    color: getStatusInformation(game.id).color
                  }"
                >

                  <span class="status-dot"></span>

                  {{ getStatusInformation(game.id).label }}

                </span>

                <span
                  v-else-if="game.popular"
                  class="popular-label"
                >
                  Popularne
                </span>

              </div>

              <!-- INFORMACJE O GRZE -->

              <div class="game-content">

                <div class="game-meta">

                  <span>
                    {{ game.genres[0] }}
                  </span>

                  <span>
                    {{ releaseYear(game.release_date) }}
                  </span>

                </div>

                <RouterLink
                  :to="`/games/${game.id}`"
                  class="game-title"
                >
                  {{ game.title }}
                </RouterLink>

                <p class="game-developer">
                  {{ game.developer }}
                </p>

                <p class="game-description">
                  {{ game.description }}
                </p>

                <div class="game-platforms">

                  <span
                    v-for="platform in game.platforms"
                    :key="platform"
                  >
                    {{ platform }}
                  </span>

                </div>

                <div class="game-footer">

                  <RouterLink
                    :to="`/games/${game.id}`"
                    class="details-link"
                  >

                    Zobacz szczegóły

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14m-6-6 6 6-6 6"/>
                    </svg>

                  </RouterLink>

                </div>

              </div>

            </article>

          </div>

          <!-- BRAK WYNIKOW -->

          <div
            v-else
            class="empty-state"
          >

            <div class="empty-icon">

              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="6"/>
                <path d="m15 15 5 5M8 8l4 4m0-4-4 4"/>
              </svg>

            </div>

            <h3>Nie znaleziono gier</h3>

            <p>
              Zmień kryteria wyszukiwania
              lub wyczyść aktywne filtry.
            </p>

            <button
              type="button"
              class="primary-button"
              @click="resetFilters"
            >
              Wyczyść filtry
            </button>

          </div>

          <!-- PAGINACJA -->

          <div
            v-if="filteredGames.length"
            class="pagination-section"
          >

            <p>
              Wyświetlanie
              {{ firstResult }}–{{ lastResult }}
              z {{ filteredGames.length }} gier
            </p>

            <nav
              v-if="totalPages > 1"
              class="pagination"
              aria-label="Strony katalogu"
            >

              <button
                type="button"
                aria-label="Poprzednia strona"
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
              >
                ‹
              </button>

              <button
                v-for="page in pageNumbers"
                :key="page"
                type="button"
                :class="{ active: currentPage === page }"
                :aria-current="
                  currentPage === page
                    ? 'page'
                    : undefined
                "
                @click="changePage(page)"
              >
                {{ page }}
              </button>

              <button
                type="button"
                aria-label="Następna strona"
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
              >
                ›
              </button>

            </nav>

          </div>

          <p class="demo-notice">
            Katalog demonstracyjny Gamevers.
            Wyświetlane oceny są przykładowe.
            Biblioteka jest zapisywana lokalnie.
          </p>

        </section>

      </div>

    </div>

    <!-- POWIADOMIENIA -->

    <Transition name="toast">

      <div
        v-if="notification"
        class="notification"
        :class="notificationType"
        role="status"
      >

        <span class="notification-icon">
          {{ notificationType === 'success' ? '✓' : '!' }}
        </span>

        <div class="notification-content">

          <strong>
            {{
              notificationType === 'success'
                ? 'Biblioteka Gamevers'
                : 'Wystąpił błąd'
            }}
          </strong>

          <span>{{ notification }}</span>

        </div>

        <button
          type="button"
          aria-label="Zamknij powiadomienie"
          @click="notification = ''"
        >
          ×
        </button>

      </div>

    </Transition>

  </main>
</template>

<style scoped>

/* GLOWNY UKLAD */

.catalog-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 24px 50px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.catalog-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* SCIEZKA NAWIGACJI */

.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #94A3B8;
  font-size: 12px;
}

.breadcrumbs a {
  color: #94A3B8;
  text-decoration: none;
}

.breadcrumbs a:hover,
.breadcrumbs span:last-child {
  color: #C4B5FD;
}

/* BANER KATALOGU */

.catalog-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 265px;
  margin-bottom: 25px;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse at 90% 20%,
      rgba(139,92,246,.24),
      transparent 55%
    ),
    linear-gradient(
      110deg,
      #151B2B,
      #1D1733
    );
  border: 1px solid #44306B;
  border-radius: 15px;
}

.catalog-hero::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(
      rgba(139,92,246,.05) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(139,92,246,.05) 1px,
      transparent 1px
    );
  background-size: 35px 35px;
  content: '';
  pointer-events: none;
}

.hero-content {
  width: 100%;
  padding: 35px;
}

.eyebrow {
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero-content h1 {
  margin: 14px 0;
  color: #F8FAFC;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.hero-content h1 span {
  color: #A78BFA;
}

.hero-content p {
  max-width: 530px;
  margin: 0;
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.8;
}

/* STATYSTYKI */

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 35px;
  margin-top: 25px;
}

.hero-stats div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-stats strong {
  color: #F8FAFC;
  font-size: 25px;
  font-weight: 800;
}

.hero-stats strong.saved-count {
  color: #A78BFA;
}

.hero-stats span {
  color: #94A3B8;
  font-size: 12px;
}

.hero-library-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 40px;
  margin-top: 24px;
  padding: 10px 14px;
  background: #31234F;
  border: 1px solid #59458A;
  border-radius: 7px;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background .2s;
}

.hero-library-link:hover {
  background: #44306B;
  color: #FFFFFF;
}

/* WYSZUKIWARKA */

.search-panel {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
}

.search-field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 50px;
  padding: 0 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #94A3B8;
}

.search-field svg {
  flex-shrink: 0;
}

.search-field:focus-within {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139,92,246,.12);
}

.search-field input {
  width: 100%;
  min-width: 0;
  padding: 14px 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 14px;
}

.search-field input::placeholder {
  color: #64748B;
}

.search-field input::-webkit-search-cancel-button {
  display: none;
}

.clear-search {
  flex-shrink: 0;
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 24px;
  cursor: pointer;
}

/* UKLAD KATALOGU */

.catalog-layout {
  display: grid;
  grid-template-columns: 235px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
}

/* PANEL FILTROW */

.filters-panel {
  min-width: 0;
  padding: 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
}

.filters-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 18px;
  border-bottom: 1px solid #293244;
}

.filters-heading h2 {
  margin: 0;
  color: #F8FAFC;
  font-size: 17px;
}

.text-button {
  padding: 4px;
  background: transparent;
  border: none;
  color: #C4B5FD;
  font-size: 11px;
  cursor: pointer;
}

.text-button:hover {
  color: #FFFFFF;
}

.filter-group {
  padding: 20px 0;
  border-bottom: 1px solid #293244;
}

.filter-group:last-of-type {
  padding-bottom: 5px;
  border-bottom: none;
}

.filter-group h3 {
  margin: 0 0 14px;
  color: #F8FAFC;
  font-size: 13px;
  font-weight: 700;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 290px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #44306B transparent;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 34px;
  padding: 7px 6px;
  border-radius: 6px;
  color: #94A3B8;
  font-size: 12px;
  cursor: pointer;
}

.filter-option:hover {
  background: #1E293B;
  color: #F8FAFC;
}

.filter-option.active {
  background: rgba(139,92,246,.12);
  color: #C4B5FD;
}

.filter-option input {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #8B5CF6;
}

.rating-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-heading h3 {
  margin: 0;
}

.rating-heading strong {
  color: #67E8F9;
  font-size: 13px;
}

.rating-slider {
  width: 100%;
  accent-color: #8B5CF6;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #94A3B8;
  font-size: 11px;
}

/* WYNIKI */

.results-section {
  min-width: 0;
  scroll-margin-top: 90px;
}

.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.results-heading h2 {
  margin: 0 0 6px;
  color: #F8FAFC;
  font-size: 22px;
  font-weight: 750;
}

.results-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
}

.toolbar-controls {
  display: flex;
  gap: 9px;
}

.toolbar-controls select {
  min-width: 0;
  min-height: 39px;
  padding: 8px 12px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 7px;
  color: #CBD5E1;
  font-size: 12px;
  cursor: pointer;
}

/* AKTYWNE FILTRY */

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.active-filters button {
  max-width: 100%;
  padding: 7px 10px;
  overflow-wrap: anywhere;
  background: #31234F;
  border: 1px solid #44306B;
  border-radius: 6px;
  color: #C4B5FD;
  font-size: 11px;
  cursor: pointer;
}

.active-filters .reset-chip {
  background: transparent;
  border-color: #293244;
  color: #94A3B8;
}

/* SIATKA GIER */

.games-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

/* KARTA GRY */

.catalog-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  transition:
    transform .25s ease,
    border-color .25s ease,
    box-shadow .25s ease;
}

.catalog-card.card-saved {
  border-color: #59458A;
}

/* OKLADKA */

.cover-wrapper {
  position: relative;
  overflow: hidden;
  background: #201B36;
}

.game-cover {
  display: block;
  aspect-ratio: 460 / 215;
  overflow: hidden;
  background: #201B36;
}

.game-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .4s ease;
}

.cover-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #44306B,
    #151B2B
  );
  color: #C4B5FD;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 2px;
}

.game-rating {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 8px;
  background: rgba(11,15,25,.9);
  border: 1px solid rgba(34,211,238,.25);
  border-radius: 5px;
  color: #67E8F9;
  font-size: 11px;
  font-weight: 800;
  pointer-events: none;
}

.popular-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding: 5px 7px;
  background: rgba(49,35,79,.95);
  border: 1px solid #8B5CF6;
  border-radius: 5px;
  color: #E9D5FF;
  font-size: 9px;
  font-weight: 600;
  pointer-events: none;
}

/* ZAKLADKA BIBLIOTEKI */

.bookmark-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 37px;
  height: 37px;
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
  bottom: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 20px);
  padding: 5px 8px;
  background: rgba(11,15,25,.95);
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

/* ZAWARTOSC KARTY */

.game-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
}

.game-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  margin-bottom: 10px;
  color: #94A3B8;
  font-size: 10px;
}

.game-meta span:first-child {
  color: #A78BFA;
  font-weight: 600;
}

.game-title {
  display: -webkit-box;
  min-height: 42px;
  overflow: hidden;
  color: #F8FAFC;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.3;
  text-decoration: none;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-title:hover {
  color: #C4B5FD;
}

.game-developer {
  margin: 6px 0 12px;
  color: #94A3B8;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.game-description {
  display: -webkit-box;
  margin: 0 0 15px;
  overflow: hidden;
  color: #94A3B8;
  font-size: 12px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

/* PLATFORMY */

.game-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: auto;
  padding-bottom: 15px;
}

.game-platforms span {
  padding: 4px 6px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 4px;
  color: #CBD5E1;
  font-size: 9px;
}

/* STOPKA KARTY */

.game-footer {
  padding-top: 13px;
  border-top: 1px solid #293244;
}

.details-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.details-link svg {
  flex-shrink: 0;
}

.details-link:hover {
  color: #FFFFFF;
}

@media (hover: hover) {

  .catalog-card:hover {
    transform: translateY(-4px);
    border-color: #8B5CF6;
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
  }

  .catalog-card:hover .game-cover img {
    transform: scale(1.05);
  }

}

/* BRAK WYNIKOW */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 330px;
  padding: 30px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 70px;
  height: 70px;
  margin-bottom: 20px;
  background: #31234F;
  border-radius: 18px;
  color: #C4B5FD;
}

.empty-state h3 {
  margin: 0 0 12px;
  color: #F8FAFC;
  font-size: 20px;
}

.empty-state p {
  max-width: 300px;
  margin: 0 0 22px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

.primary-button {
  min-height: 43px;
  padding: 11px 20px;
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:hover {
  background: #7C3AED;
}

/* PAGINACJA */

.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 28px;
  padding: 20px 0;
  border-top: 1px solid #293244;
}

.pagination-section p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.pagination button {
  display: grid;
  place-items: center;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 7px;
  color: #CBD5E1;
  font-size: 13px;
  cursor: pointer;
}

.pagination button.active {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: #FFFFFF;
  font-weight: 700;
}

.pagination button:hover:not(:disabled) {
  border-color: #A78BFA;
}

.pagination button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.demo-notice {
  margin: 20px 0 0;
  color: #94A3B8;
  font-size: 11px;
  text-align: center;
}

/* POWIADOMIENIA */

.notification {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  max-width: min(420px, calc(100vw - 48px));
  padding: 15px;
  background: #143529;
  border: 1px solid #166534;
  border-radius: 10px;
  color: #86EFAC;
  box-shadow: 0 12px 35px rgba(0,0,0,.4);
}

.notification.error {
  background: #3D222B;
  border-color: #991B1B;
  color: #FCA5A5;
}

.notification-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  background: rgba(255,255,255,.08);
  border-radius: 50%;
  font-size: 20px;
  font-weight: 700;
}

.notification-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.notification-content strong {
  font-size: 13px;
}

.notification-content span {
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.notification button {
  flex-shrink: 0;
  padding: 4px;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 23px;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity .2s, transform .2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* MOBILNE FILTRY */

.mobile-filter-button,
.mobile-apply {
  display: none;
}

/* DOSTEPNOSC */

a:focus-visible,
button:focus-visible,
select:focus-visible,
input[type="radio"]:focus-visible,
input[type="range"]:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* MNIEJSZE KOMPUTERY */

@media (max-width: 1200px) {

  .catalog-layout {
    grid-template-columns:
      210px minmax(0, 1fr);
    gap: 18px;
  }

  .games-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filters-panel {
    padding: 16px;
  }

}

/* TABLETY */

@media (max-width: 850px) {

  .catalog-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .filters-panel {
    display: none;
  }

  .filters-panel.filters-open {
    display: block;
  }

  .mobile-filter-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 15px;
    background: #151B2B;
    border: 1px solid #44306B;
    border-radius: 9px;
    color: #C4B5FD;
    font-size: 13px;
    cursor: pointer;
  }

  .mobile-filter-button span {
    display: grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    background: #8B5CF6;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 10px;
  }

  .mobile-apply {
    display: block;
    width: 100%;
    margin-top: 20px;
  }

}

/* TELEFONY */

@media (max-width: 600px) {

  .catalog-page {
    padding: 15px 14px 35px;
  }

  .breadcrumbs {
    margin-bottom: 14px;
    font-size: 11px;
  }

  .catalog-hero {
    min-height: 240px;
    margin-bottom: 18px;
    border-radius: 12px;
  }

  .hero-content {
    padding: 23px;
  }

  .hero-content h1 {
    font-size: 32px;
  }

  .hero-content p {
    font-size: 12px;
  }

  .hero-stats {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 17px;
    margin-top: 20px;
  }

  .hero-stats strong {
    font-size: 22px;
  }

  .hero-stats span {
    font-size: 11px;
  }

  .hero-library-link {
    width: 100%;
    justify-content: center;
    min-height: 43px;
    margin-top: 20px;
  }

  .search-panel {
    gap: 8px;
    margin-bottom: 20px;
  }

  .search-field {
    min-height: 48px;
    gap: 8px;
    padding: 0 10px;
  }

  .search-field input {
    font-size: 16px;
  }

  .search-field input::placeholder {
    font-size: 12px;
  }

  .mobile-filter-button {
    flex-shrink: 0;
    padding: 10px;
    font-size: 12px;
  }

  .results-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 13px;
  }

  .results-heading h2 {
    font-size: 20px;
  }

  .toolbar-controls {
    width: 100%;
  }

  .toolbar-controls select:first-child {
    flex: 1;
  }

  .toolbar-controls select {
    min-height: 42px;
    font-size: 12px;
  }

  .games-grid {
    gap: 11px;
  }

  .catalog-card {
    border-radius: 9px;
  }

  .game-content {
    padding: 11px;
  }

  .game-meta {
    margin-bottom: 7px;
    font-size: 9px;
  }

  .game-title {
    min-height: 36px;
    font-size: 14px;
  }

  .game-developer {
    margin-bottom: 10px;
    font-size: 10px;
  }

  .game-description {
    display: none;
  }

  .game-rating {
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
    left: 6px;
    padding: 4px 6px;
    font-size: 9px;
  }

  .popular-label {
    display: none;
  }

  .game-platforms {
    gap: 4px;
    padding-bottom: 10px;
  }

  .game-platforms span {
    padding: 3px 5px;
    font-size: 8px;
  }

  .game-footer {
    padding-top: 10px;
  }

  .details-link {
    font-size: 10px;
  }

  .details-link svg {
    width: 13px;
    height: 13px;
  }

  .pagination-section {
    flex-direction: column;
    gap: 16px;
  }

  .pagination button {
    min-width: 40px;
    height: 40px;
  }

  .notification {
    right: 14px;
    bottom: 14px;
    left: 14px;
    width: auto;
    max-width: none;
    padding: 13px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .catalog-page {
    padding-right: 10px;
    padding-left: 10px;
  }

  .games-grid {
    gap: 8px;
  }

  .game-content {
    padding: 9px;
  }

  .game-title {
    font-size: 12px;
  }

  .hero-content {
    padding: 18px;
  }

  .hero-stats {
    gap: 14px;
  }

  .library-status {
    font-size: 8px;
  }

  .bookmark-button {
    width: 30px;
    height: 30px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .catalog-card,
  .game-cover img,
  .bookmark-button,
  .hero-library-link,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }

  .catalog-card:hover,
  .catalog-card:hover .game-cover img {
    transform: none;
  }

}

</style>
