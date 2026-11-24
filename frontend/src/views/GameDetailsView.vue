
<script setup>
import { ref, computed, watch } from 'vue'
import {
  RouterLink,
  useRoute,
  useRouter
} from 'vue-router'

import PopularGameCard from '../components/games/PopularGameCard.vue'

import {
  getGameById,
  getRelatedGames
} from '../data/games'

import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

/* DANE GRY */

const game = computed(() => {
  return getGameById(route.params.id)
})

const relatedGames = computed(() => {
  if (!game.value) {
    return []
  }

  return getRelatedGames(game.value.id, 4)
})

/* STAN INTERFEJSU */

const activeTab = ref('overview')
const coverFailed = ref(false)
const bannerFailed = ref(false)
const copied = ref(false)
const shareError = ref(false)

/* ZAKLADKI */

const tabs = [
  {
    id: 'overview',
    label: 'Informacje'
  },
  {
    id: 'reviews',
    label: 'Recenzje'
  },
  {
    id: 'related',
    label: 'Podobne gry'
  }
]

/* PRZYKLADOWE RECENZJE */

const demoReviews = [
  {
    id: 1,
    gameId: 1,
    author: 'NeonRaven',
    rating: 9.0,
    content: 'Night City wciąga od pierwszej minuty. Świetnie napisane postacie i wyjątkowy klimat.'
  },
  {
    id: 2,
    gameId: 6,
    author: 'Luna.exe',
    rating: 9.5,
    content: 'Każdy zakątek skrywa coś nowego. Muzyka, klimat i wyjątkowy świat tworzą niesamowitą przygodę.'
  }
]

const gameReviews = computed(() => {
  if (!game.value) {
    return []
  }

  return demoReviews.filter(
    review => review.gameId === game.value.id
  )
})

/* FORMATOWANIE DATY */

function formatDate(date) {
  if (!date) {
    return 'Brak informacji'
  }

  const parsedDate = new Date(
    `${date}T00:00:00`
  )

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Brak informacji'
  }

  return parsedDate.toLocaleDateString(
    'pl-PL',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  )
}

/* FORMATOWANIE OCENY */

function formatRating(rating) {
  const value = Number(rating)

  return Number.isFinite(value)
    ? value.toFixed(1)
    : '—'
}

/* BANER */

const heroStyle = computed(() => {
  if (!game.value || bannerFailed.value) {
    return {}
  }

  return {
    backgroundImage: `
      linear-gradient(
        90deg,
        rgba(11,15,25,.96) 0%,
        rgba(11,15,25,.75) 45%,
        rgba(11,15,25,.15) 100%
      ),
      linear-gradient(
        0deg,
        rgba(11,15,25,.95),
        transparent 80%
      ),
      url('${game.value.banner_url}')
    `
  }
})

/* INFORMACJE TECHNICZNE */

const gameInformation = computed(() => {
  if (!game.value) {
    return []
  }

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
      value: game.value.genres.join(' · '),
      icon: '◈'
    },
    {
      label: 'Platformy',
      value: game.value.platforms.join(' · '),
      icon: '▣'
    }
  ]
})

/* BIBLIOTEKA */

function addToLibrary(selectedGame = game.value) {
  if (!selectedGame) {
    return
  }

  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: {
        redirect: `/games/${selectedGame.id}`
      }
    })

    return
  }

  router.push('/library')
}

/* UDOSTEPNIANIE */

async function shareGame() {
  copied.value = false
  shareError.value = false

  try {
    await navigator.clipboard.writeText(
      window.location.href
    )

    copied.value = true
  } catch {
    shareError.value = true
  }
}

/* ZMIANA ZAKLADKI */

function selectTab(tabId) {
  activeTab.value = tabId
}

/* ZMIANA GRY */

watch(
  () => route.params.id,
  () => {
    activeTab.value = 'overview'
    coverFailed.value = false
    bannerFailed.value = false
    copied.value = false
    shareError.value = false

    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  }
)
</script>

<template>
  <main class="details-page">

    <div class="details-container">

      <!-- GRA ISTNIEJE -->

      <template v-if="game">

        <!-- NAWIGACJA -->

        <nav
          class="breadcrumbs"
          aria-label="Ścieżka nawigacji"
        >

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

        <!-- BANER GRY -->

        <section
          class="game-hero"
          :style="heroStyle"
        >

          <img
            class="banner-check"
            :src="game.banner_url"
            alt=""
            aria-hidden="true"
            @error="bannerFailed = true"
          />

          <div class="hero-content">

            <span class="hero-label">
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
              {{ game.release_date.slice(0, 4) }}
            </p>

            <div class="hero-rating">

              <div class="rating-value">

                <span aria-hidden="true">★</span>

                {{ formatRating(game.rating) }}

                <small>/ 10</small>

              </div>

              <div class="rating-description">

                <strong>Ocena gry</strong>

                <span>
                  Ocena demonstracyjna
                </span>

              </div>

            </div>

            <div class="hero-actions">

              <button
                type="button"
                class="primary-button"
                @click="addToLibrary(game)"
              >

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 3h12v18l-6-4-6 4z"/>
                  <path d="M9 9h6m-3-3v6"/>
                </svg>

                Dodaj do biblioteki

              </button>

              <button
                type="button"
                class="secondary-button"
                @click="shareGame"
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
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <path d="m9 10 6-3m-6 7 6 3"/>
                </svg>

                {{ copied ? 'Skopiowano link' : 'Udostępnij' }}

              </button>

            </div>

            <p
              v-if="copied"
              class="share-message"
              role="status"
            >
              Link do gry został skopiowany.
            </p>

            <p
              v-if="shareError"
              class="share-message error"
              role="status"
            >
              Nie udało się skopiować linku.
              Skopiuj adres z paska przeglądarki.
            </p>

            <p class="library-notice">
              Zapisywanie gier zostanie uruchomione
              w kolejnym etapie projektu.
            </p>

          </div>

        </section>

        <!-- ZAKLADKI -->

        <nav
          class="details-tabs"
          aria-label="Sekcje szczegółów gry"
        >

          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="{
              active: activeTab === tab.id
            }"
            :aria-pressed="activeTab === tab.id"
            @click="selectTab(tab.id)"
          >

            {{ tab.label }}

            <span v-if="tab.id === 'reviews'">
              {{ gameReviews.length }}
            </span>

          </button>

        </nav>

        <!-- INFORMACJE O GRZE -->

        <div
          v-if="activeTab === 'overview'"
          class="details-layout"
        >

          <div class="main-content">

            <!-- OPIS -->

            <section class="content-card">

              <span class="section-label">
                POZNAJ GRE
              </span>

              <h2>O grze</h2>

              <p class="game-description">
                {{ game.description }}
              </p>

            </section>

            <!-- GATUNKI -->

            <section class="content-card">

              <h2>Gatunki gry</h2>

              <p class="section-description">
                Odkryj więcej gier w podobnym stylu.
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

            <!-- PLATFORMY -->

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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="13"
                      rx="2"
                    />
                    <path d="M8 21h8m-4-4v4"/>
                  </svg>

                  <strong>{{ platform }}</strong>

                </RouterLink>

              </div>

            </section>

          </div>

          <!-- PANEL BOCZNY -->

          <aside class="sidebar">

            <section class="information-card">

              <div class="game-cover">

                <img
                  v-if="!coverFailed"
                  :src="game.cover_url"
                  :alt="game.title"
                  @error="coverFailed = true"
                />

                <div
                  v-else
                  class="cover-placeholder"
                >
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

                    <span class="information-label">
                      {{ item.label }}
                    </span>

                    <strong>
                      {{ item.value || 'Brak danych' }}
                    </strong>

                  </div>

                </div>

                <a
                  :href="`https://store.steampowered.com/app/${game.steam_id}/`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="steam-link"
                >
                  Zobacz na Steam ↗
                </a>

              </div>

            </section>

          </aside>

        </div>

        <!-- RECENZJE -->

        <section
          v-if="activeTab === 'reviews'"
          class="content-card reviews-section"
        >

          <div class="section-heading">

            <div>

              <span class="section-label">
                SPOŁECZNOŚĆ
              </span>

              <h2>Recenzje graczy</h2>

              <p class="section-description">
                Przykładowe opinie o tej grze.
              </p>

            </div>

            <span class="review-count">
              {{ gameReviews.length }} recenzji
            </span>

          </div>

          <div
            v-if="gameReviews.length"
            class="reviews-list"
          >

            <article
              v-for="review in gameReviews"
              :key="review.id"
              class="review-card"
            >

              <div class="review-header">

                <div class="avatar">
                  {{ review.author.charAt(0) }}
                </div>

                <div class="review-author">

                  <strong>{{ review.author }}</strong>

                  <span>Przykładowa recenzja</span>

                </div>

                <span class="review-rating">
                  ★ {{ formatRating(review.rating) }}
                </span>

              </div>

              <p>{{ review.content }}</p>

            </article>

          </div>

          <div
            v-else
            class="empty-reviews"
          >

            <span
              class="empty-icon"
              aria-hidden="true"
            >
              ☆
            </span>

            <h3>Brak przykładowych recenzji</h3>

            <p>
              Ta gra nie posiada jeszcze
              recenzji w wersji demonstracyjnej.
            </p>

          </div>

          <div class="review-notice">

            <h3>Podziel się swoją opinią</h3>

            <p>
              Dodawanie i edytowanie recenzji
              zostanie uruchomione po podłączeniu
              backendu Laravel.
            </p>

          </div>

        </section>

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

            <RouterLink
              to="/games"
              class="section-link"
            >
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
              @add-to-library="addToLibrary(relatedGame)"
            />

          </div>

          <div
            v-else
            class="content-card"
          >
            Nie znaleziono podobnych gier.
          </div>

        </section>

        <p class="demo-notice">
          Gamevers — wersja demonstracyjna.
          Oceny i recenzje są przykładowe.
        </p>

      </template>

      <!-- NIEPRAWIDLOWE ID GRY -->

      <section
        v-else
        class="not-found"
      >

        <span class="not-found-code">
          404
        </span>

        <h1>Nie znaleziono gry</h1>

        <p>
          Gra o podanym identyfikatorze
          nie istnieje w katalogu Gamevers.
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

/* GLOWNY UKLAD */

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
  align-items: center;
  gap: 9px;
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

/* BANER */

.game-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 440px;
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
  max-width: 800px;
  padding: 40px;
}

.hero-label,
.section-label {
  display: block;
  margin-bottom: 15px;
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
  background: rgba(49,35,79,.9);
  border: 1px solid #8B5CF6;
  border-radius: 5px;
  color: #E9D5FF;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.genre-tags a:hover {
  background: #44306B;
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
  margin: 25px 0;
}

.rating-value {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #67E8F9;
  font-size: 36px;
  font-weight: 800;
}

.rating-value span {
  font-size: 28px;
}

.rating-value small {
  align-self: flex-end;
  padding-bottom: 8px;
  color: #94A3B8;
  font-size: 14px;
  font-weight: 500;
}

.rating-description {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 18px;
  border-left: 1px solid #475569;
}

.rating-description strong {
  color: #F8FAFC;
  font-size: 13px;
}

.rating-description span {
  color: #94A3B8;
  font-size: 11px;
}

/* PRZYCISKI */

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  padding: 12px 20px;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    background .2s,
    border-color .2s;
}

.primary-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
}

.primary-button:hover {
  background: #7C3AED;
}

.secondary-button {
  background: rgba(21,27,43,.9);
  border: 1px solid #475569;
}

.secondary-button:hover {
  border-color: #8B5CF6;
  background: #31234F;
}

.share-message {
  margin: 12px 0 0;
  color: #67E8F9;
  font-size: 12px;
}

.share-message.error {
  color: #FCA5A5;
}

.library-notice {
  margin: 12px 0 0;
  color: #CBD5E1;
  font-size: 11px;
}

/* ZAKLADKI */

.details-tabs {
  display: flex;
  gap: 25px;
  margin: 24px 0;
  overflow-x: auto;
  border-bottom: 1px solid #293244;
  scrollbar-width: thin;
}

.details-tabs button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
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

.details-tabs button:hover {
  color: #F8FAFC;
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
    minmax(0, 1fr)
    minmax(280px, 340px);
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
  font-weight: 750;
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
  font-weight: 600;
  text-decoration: none;
}

.category-links a:hover {
  border-color: #8B5CF6;
  background: #31234F;
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
  background: #201B36;
}

/* PANEL BOCZNY */

.sidebar {
  min-width: 0;
}

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

.information-label {
  color: #94A3B8;
  font-size: 11px;
}

.information-row strong {
  color: #F8FAFC;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.steam-link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 43px;
  margin-top: 20px;
  padding: 10px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 7px;
  color: #CBD5E1;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.steam-link:hover {
  border-color: #8B5CF6;
  color: #FFFFFF;
}

/* NAGLOWKI SEKCJI */

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-heading .section-label {
  margin-bottom: 9px;
}

.section-heading h2 {
  margin-bottom: 7px;
}

.section-heading .section-description {
  margin-bottom: 0;
}

.section-link {
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.section-link:hover {
  color: #FFFFFF;
}

/* RECENZJE */

.review-count {
  flex-shrink: 0;
  padding: 7px 10px;
  background: #31234F;
  border-radius: 6px;
  color: #C4B5FD;
  font-size: 11px;
}

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

.empty-icon {
  display: block;
  margin-bottom: 15px;
  color: #A78BFA;
  font-size: 45px;
}

.empty-reviews h3 {
  margin: 0 0 10px;
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

/* NIE ZNALEZIONO GRY */

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  padding: 30px;
  text-align: center;
}

.not-found-code {
  color: #8B5CF6;
  font-size: clamp(65px, 12vw, 120px);
  font-weight: 800;
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
  line-height: 1.7;
}

/* DOSTEPNOSC */

a:focus-visible,
button:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* TABLETY */

@media (max-width: 1000px) {

  .details-layout {
    grid-template-columns:
      minmax(0, 1fr)
      minmax(250px, 290px);
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

  .sidebar {
    width: 100%;
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
      rgba(11,15,25,.7) 75%,
      transparent
    );
  }

  .hero-content h1 {
    margin-top: 16px;
    font-size: 34px;
    letter-spacing: -1px;
  }

  .hero-label {
    font-size: 9px;
  }

  .hero-meta {
    font-size: 12px;
  }

  .genre-tags {
    gap: 5px;
  }

  .genre-tags a {
    padding: 5px 7px;
    font-size: 10px;
  }

  .hero-rating {
    gap: 12px;
    margin: 20px 0;
  }

  .rating-value {
    font-size: 30px;
  }

  .rating-value span {
    font-size: 23px;
  }

  .rating-description {
    padding-left: 12px;
  }

  .rating-description span {
    font-size: 10px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 9px;
  }

  .hero-actions button {
    width: 100%;
    min-height: 46px;
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

  .content-card {
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

  .platform-card {
    min-height: 90px;
  }

  .information-content {
    padding: 19px;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .related-section {
    margin-top: 28px;
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

  .review-author strong {
    font-size: 12px;
  }

  .review-rating {
    font-size: 11px;
  }

}

/* MALE TELEFONY */

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

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .primary-button,
  .secondary-button {
    transition: none;
  }

}

</style>
