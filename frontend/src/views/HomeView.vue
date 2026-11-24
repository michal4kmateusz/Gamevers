
<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import HomeHero from '../components/home/HomeHero.vue'
import PopularGameCard from '../components/games/PopularGameCard.vue'
import GenreCard from '../components/games/GenreCard.vue'

import {
  games,
  genres,
  platforms,
  categories,
  filterGames,
  getPopularGames,
  getGameById
} from '../data/games'

import { useLibraryStore } from '../stores/libraryStore'

const router = useRouter()
const libraryStore = useLibraryStore()

/* WYSZUKIWANIE */

const search = ref('')
const activeGenre = ref('Wszystkie gry')

const quickGenres = [
  'Wszystkie gry',
  ...[
    'RPG',
    'Akcja',
    'Przygodowe',
    'Strategiczne',
    'Niezależne',
    'Wyścigowe'
  ].filter(genre => genres.includes(genre))
]

/* DANE KATALOGU */

const popularGames = computed(() =>
  getPopularGames(4)
)

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' ||
  activeGenre.value !== 'Wszystkie gry'
)

const filteredGames = computed(() => {
  if (!hasActiveFilters.value) {
    return popularGames.value
  }

  return filterGames({
    search: search.value,
    genre:
      activeGenre.value === 'Wszystkie gry'
        ? ''
        : activeGenre.value,
    sort: 'popular'
  }).slice(0, 4)
})

const featuredGame = getGameById(6)

/* STATYSTYKI */

const portalStats = computed(() => [
  {
    icon: '◈',
    value: games.length,
    label: 'Gier w katalogu'
  },
  {
    icon: '◎',
    value: genres.length,
    label: 'Gatunków gier'
  },
  {
    icon: '▥',
    value: platforms.length,
    label: 'Platform'
  },
  {
    icon: '☆',
    value: libraryStore.totalGames,
    label: 'W Twojej bibliotece',
    link: '/library'
  }
])

/* PRZYKLADOWE RECENZJE */

const reviews = [
  {
    id: 1,
    author: 'NeonRaven',
    game: 'Cyberpunk 2077',
    gameId: 1,
    rating: 9.0,
    content:
      'Night City wciąga od pierwszej minuty. Świetnie napisane postacie i świat, do którego po prostu chce się wracać.'
  },
  {
    id: 2,
    author: 'Luna.exe',
    game: 'Hollow Knight',
    gameId: 6,
    rating: 9.5,
    content:
      'Każdy zakątek skrywa coś nowego. Muzyka, klimat i wyjątkowy świat tworzą niesamowitą przygodę.'
  }
]

/* PRZEJSCIE DO KATALOGU */

function browseGames() {
  const query = {}

  if (search.value.trim()) {
    query.search = search.value.trim()
  }

  if (activeGenre.value !== 'Wszystkie gry') {
    query.genre = activeGenre.value
  }

  router.push({
    path: '/games',
    query
  })
}

/* RESET FILTROW */

function resetFilters() {
  search.value = ''
  activeGenre.value = 'Wszystkie gry'
}

/* BANER POLECANEJ GRY */

const featuredBackground = computed(() => {
  if (!featuredGame) {
    return {}
  }

  return {
    backgroundImage: `
      linear-gradient(
        90deg,
        #151B2B 0%,
        rgba(11, 15, 25, .85) 40%,
        rgba(11, 15, 25, .15) 100%
      ),
      url('${featuredGame.banner_url}')
    `
  }
})
</script>

<template>
  <main class="home-page">

    <div class="home-container">

      <!-- GLOWNY BANER -->

      <HomeHero />

      <!-- WYSZUKIWARKA -->

      <section class="discovery-section">

        <div class="discovery-heading">

          <h2>W co dziś zagrasz?</h2>

          <p>
            Tysiące światów.
            Znajdź ten dla siebie.
          </p>

        </div>

        <div class="discovery-content">

          <form
            class="search-form"
            @submit.prevent="browseGames"
          >

            <div class="search-input">

              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7"/>
                <path d="m16 16 5 5"/>
              </svg>

              <input
                v-model="search"
                type="search"
                aria-label="Szukaj gry"
                placeholder="Wpisz tytuł lub gatunek..."
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
              type="submit"
              class="primary-button"
            >
              Przeglądaj gry →
            </button>

          </form>

          <!-- SZYBKIE FILTRY -->

          <div class="genre-filters">

            <button
              v-for="genre in quickGenres"
              :key="genre"
              type="button"
              :class="{
                selected: activeGenre === genre
              }"
              :aria-pressed="activeGenre === genre"
              @click="activeGenre = genre"
            >
              {{ genre }}
            </button>

          </div>

        </div>

      </section>

      <!-- POPULARNE GRY -->

      <section class="home-section">

        <div class="section-heading">

          <div>

            <span class="section-label">
              ODKRYWAJ
            </span>

            <h2>
              {{
                hasActiveFilters
                  ? 'Wyniki wyszukiwania'
                  : 'Popularne teraz'
              }}
            </h2>

            <p>
              {{
                hasActiveFilters
                  ? 'Gry pasujące do Twoich preferencji.'
                  : 'Odkryj polecane tytuły z katalogu.'
              }}
            </p>

          </div>

          <button
            type="button"
            class="section-link"
            @click="browseGames"
          >
            Zobacz wszystkie →
          </button>

        </div>

        <div
          v-if="filteredGames.length"
          class="games-grid"
        >

          <PopularGameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
          />

        </div>

        <!-- BRAK WYNIKOW -->

        <div
          v-else
          class="empty-state"
        >

          <span
            class="empty-icon"
            aria-hidden="true"
          >
            ⌕
          </span>

          <h3>Nie znaleziono gier</h3>

          <p>
            Spróbuj wpisać inną nazwę
            lub zmienić gatunek.
          </p>

          <button
            type="button"
            class="primary-button"
            @click="resetFilters"
          >
            Wyczyść filtry
          </button>

        </div>

      </section>

      <!-- KATEGORIE -->

      <section class="home-section">

        <div class="section-heading">

          <div>

            <span class="section-label">
              ZNAJDŹ SWÓJ GATUNEK
            </span>

            <h2>
              Twój styl. Twoja rozgrywka.
            </h2>

            <p>
              Odkrywaj według gatunku.
            </p>

          </div>

          <RouterLink
            to="/games"
            class="section-link"
          >
            Wszystkie gatunki →
          </RouterLink>

        </div>

        <div class="categories-grid">

          <GenreCard
            v-for="category in categories"
            :key="category.name"
            :genre="category"
          />

        </div>

      </section>

      <!-- POLECANA GRA -->

      <section
        v-if="featuredGame"
        class="featured-banner"
        :style="featuredBackground"
      >

        <div class="featured-content">

          <span class="featured-label">
            POZA GŁÓWNYM SZLAKIEM
          </span>

          <h2>
            Mała gra. Ogromny świat.
          </h2>

          <h3>
            {{ featuredGame.title }}
          </h3>

          <p>
            {{ featuredGame.description }}
          </p>

          <div class="featured-actions">

            <RouterLink
              :to="`/games/${featuredGame.id}`"
              class="primary-button"
            >
              Poznaj grę →
            </RouterLink>

            <span class="rating">
              ★ {{ featuredGame.rating.toFixed(1) }}
            </span>

          </div>

        </div>

      </section>

      <!-- SPOLECZNOSC -->

      <section class="home-section">

        <div class="section-heading">

          <div>

            <span class="section-label">
              SPOŁECZNOŚĆ
            </span>

            <h2>
              Gry łączą. Opinie mają znaczenie.
            </h2>

            <p>
              Zobacz przykładowe recenzje graczy.
            </p>

          </div>

        </div>

        <div class="community-grid">

          <article
            v-for="review in reviews"
            :key="review.id"
            class="review-card"
          >

            <div class="review-header">

              <div class="avatar">
                {{ review.author.charAt(0) }}
              </div>

              <strong>
                {{ review.author }}
              </strong>

              <span class="rating">
                ★ {{ review.rating.toFixed(1) }}
              </span>

            </div>

            <RouterLink
              :to="`/games/${review.gameId}`"
              class="review-game"
            >
              {{ review.game }}
            </RouterLink>

            <p>
              {{ review.content }}
            </p>

            <div class="review-footer">
              Przykładowa recenzja
            </div>

          </article>

          <!-- KARTA BIBLIOTEKI -->

          <article class="join-card">

            <div class="join-icon">

              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6 7h12a4 4 0 0 1 4 3.5l1 5a3 3 0 0 1-5 2.5l-3-3H9l-3 3a3 3 0 0 1-5-2.5l1-5A4 4 0 0 1 6 7Z"/>
                <path d="M5 11h5m-2.5-2.5v5"/>
                <circle cx="16" cy="11" r=".7"/>
                <circle cx="19" cy="13" r=".7"/>
              </svg>

            </div>

            <h2>
              Wszystkie Twoje gry.
              W jednym miejscu.
            </h2>

            <p>
              Planuj, oceniaj i odkrywaj.
              Stwórz własną bibliotekę gier.
            </p>

            <div class="library-preview">

              <strong>
                {{ libraryStore.totalGames }}
              </strong>

              <span>
                Zapisane gry
              </span>

            </div>

            <RouterLink
              to="/library"
              class="primary-button"
            >
              Moja biblioteka →
            </RouterLink>

            <RouterLink
              to="/register"
              class="register-link"
            >
              Załóż bezpłatne konto
            </RouterLink>

          </article>

        </div>

      </section>

      <!-- STATYSTYKI KATALOGU -->

      <section
        class="portal-stats"
        aria-label="Statystyki katalogu"
      >

        <div
          v-for="stat in portalStats"
          :key="stat.label"
          class="stat-item"
        >

          <span
            class="stat-icon"
            aria-hidden="true"
          >
            {{ stat.icon }}
          </span>

          <div class="stat-content">

            <strong>
              {{ stat.value }}
            </strong>

            <RouterLink
              v-if="stat.link"
              :to="stat.link"
              class="stat-link"
            >
              {{ stat.label }} →
            </RouterLink>

            <span v-else>
              {{ stat.label }}
            </span>

          </div>

        </div>

      </section>

      <p class="demo-notice">
        Gamevers — wersja demonstracyjna.
        Oceny i recenzje są przykładowe.
        Biblioteka jest zapisywana lokalnie
        w przeglądarce.
      </p>

    </div>

  </main>
</template>

<style scoped>

/* GLOWNY UKLAD */

.home-page {
  display: block;
  width: 100%;
  min-height: 100vh;
  padding: 16px 24px 45px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.home-container {
  width: 100%;
  max-width: 1400px;
  min-width: 0;
  margin: 0 auto;
}

/* PRZYCISKI */

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 43px;
  padding: 12px 20px;
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s;
}

.primary-button:hover {
  background: #7C3AED;
  border-color: #7C3AED;
}

/* OCENY */

.rating {
  display: inline-block;
  padding: 5px 9px;
  background: #123443;
  border-radius: 5px;
  color: #67E8F9;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

/* WYSZUKIWARKA */

.discovery-section {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1.7fr);
  align-items: center;
  gap: 30px;
  padding: 35px 0;
}

.discovery-heading h2,
.section-heading h2 {
  margin: 0 0 8px;
  color: #F8FAFC;
  font-size: 24px;
  font-weight: 750;
  line-height: 1.3;
}

.discovery-heading p,
.section-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

.discovery-content {
  min-width: 0;
}

.search-form {
  display: flex;
  gap: 12px;
}

.search-input {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  min-width: 0;
  min-height: 45px;
  padding: 0 14px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #94A3B8;
}

.search-input svg {
  flex-shrink: 0;
}

.search-input:focus-within {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139,92,246,.12);
}

.search-input input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 12px 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 13px;
}

.search-input input::placeholder {
  color: #64748B;
}

.search-input input::-webkit-search-cancel-button {
  display: none;
}

.clear-search {
  flex-shrink: 0;
  padding: 4px 6px;
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 22px;
  cursor: pointer;
}

.clear-search:hover {
  color: #FFFFFF;
}

/* SZYBKIE FILTRY */

.genre-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.genre-filters button {
  min-height: 32px;
  padding: 7px 12px;
  background: transparent;
  border: 1px solid #293244;
  border-radius: 6px;
  color: #94A3B8;
  font-size: 11px;
  cursor: pointer;
  transition:
    background .2s,
    border-color .2s,
    color .2s;
}

.genre-filters button:hover {
  border-color: #8B5CF6;
  color: #F8FAFC;
}

.genre-filters button.selected {
  background: #31234F;
  border-color: #8B5CF6;
  color: #E9D5FF;
}

/* SEKCJE */

.home-section {
  margin: 15px 0 38px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.section-label {
  display: block;
  margin-bottom: 9px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.section-link {
  padding: 0;
  background: transparent;
  border: none;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.section-link:hover {
  color: #FFFFFF;
}

/* SIATKI */

.games-grid,
.categories-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

/* POLECANA GRA */

.featured-banner {
  display: flex;
  align-items: center;
  min-height: 260px;
  margin-bottom: 38px;
  overflow: hidden;
  background-color: #151B2B;
  background-position: center;
  background-size: cover;
  border: 1px solid #293244;
  border-radius: 14px;
}

.featured-content {
  width: 100%;
  max-width: 480px;
  padding: 30px;
}

.featured-label {
  color: #22D3EE;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.featured-content h2 {
  margin: 14px 0 8px;
  color: #F8FAFC;
  font-size: 30px;
  line-height: 1.25;
}

.featured-content h3 {
  margin: 0;
  color: #CBD5E1;
  font-size: 15px;
}

.featured-content p {
  margin: 15px 0 20px;
  color: #CBD5E1;
  font-size: 13px;
  line-height: 1.7;
}

.featured-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

/* SPOLECZNOSC */

.community-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.review-card,
.join-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 22px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.review-header strong {
  overflow-wrap: anywhere;
}

.review-header .rating {
  margin-left: auto;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  background: #31234F;
  border-radius: 50%;
  color: #C4B5FD;
  font-weight: 700;
}

.review-game {
  display: block;
  margin: 22px 0 10px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.review-game:hover {
  color: #FFFFFF;
}

.review-card p,
.join-card p {
  margin: 0 0 18px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.8;
}

.review-footer {
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #293244;
  color: #94A3B8;
  font-size: 11px;
}

/* KARTA BIBLIOTEKI */

.join-card {
  background: linear-gradient(
    135deg,
    #31234F,
    #151B2B
  );
  border-color: #44306B;
}

.join-icon {
  display: grid;
  place-items: center;
  width: 45px;
  height: 45px;
  margin-bottom: 17px;
  background: #44306B;
  border-radius: 10px;
  color: #C4B5FD;
}

.join-card h2 {
  margin: 0 0 12px;
  color: #F8FAFC;
  font-size: 22px;
  line-height: 1.3;
}

.library-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding: 12px 15px;
  background: rgba(11,15,25,.4);
  border: 1px solid #44306B;
  border-radius: 8px;
}

.library-preview strong {
  color: #C4B5FD;
  font-size: 25px;
  font-weight: 800;
}

.library-preview span {
  color: #CBD5E1;
  font-size: 12px;
}

.join-card .primary-button {
  width: 100%;
  margin-top: auto;
}

.register-link {
  display: block;
  margin-top: 14px;
  color: #C4B5FD;
  font-size: 11px;
  text-align: center;
  text-decoration: none;
}

.register-link:hover {
  color: #FFFFFF;
}

/* STATYSTYKI */

.portal-stats {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding: 25px 0;
  border-top: 1px solid #293244;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.stat-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  background: #201B36;
  border: 1px solid #44306B;
  border-radius: 10px;
  color: #C4B5FD;
  font-size: 22px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.stat-content strong {
  color: #F8FAFC;
  font-size: 22px;
  font-weight: 800;
}

.stat-content span {
  color: #94A3B8;
  font-size: 12px;
}

.stat-link {
  color: #C4B5FD;
  font-size: 12px;
  text-decoration: none;
}

.stat-link:hover {
  color: #FFFFFF;
}

.demo-notice {
  margin: 15px 0 0;
  color: #94A3B8;
  font-size: 11px;
  line-height: 1.7;
  text-align: center;
}

/* BRAK WYNIKOW */

.empty-state {
  padding: 35px 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #94A3B8;
  text-align: center;
}

.empty-icon {
  display: block;
  margin-bottom: 15px;
  color: #A78BFA;
  font-size: 42px;
}

.empty-state h3 {
  margin: 0 0 10px;
  color: #F8FAFC;
  font-size: 18px;
}

.empty-state p {
  margin: 0 0 20px;
  font-size: 13px;
}

/* DOSTEPNOSC */

a:focus-visible,
button:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* TABLETY */

@media (max-width: 1000px) {

  .discovery-section {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .games-grid,
  .categories-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .community-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .join-card {
    grid-column: 1 / -1;
  }

  .portal-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

}

/* TELEFONY */

@media (max-width: 600px) {

  .home-page {
    padding: 12px 14px 30px;
  }

  .discovery-section {
    gap: 16px;
    padding: 27px 0;
  }

  .search-form {
    flex-direction: column;
    gap: 10px;
  }

  .search-input {
    min-height: 48px;
  }

  .search-input input {
    font-size: 16px;
  }

  .search-form .primary-button {
    width: 100%;
    min-height: 46px;
  }

  .genre-filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 7px;
    scrollbar-width: thin;
  }

  .genre-filters button {
    flex-shrink: 0;
    min-height: 34px;
    white-space: nowrap;
  }

  .home-section {
    margin: 10px 0 30px;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
  }

  .discovery-heading h2,
  .section-heading h2 {
    font-size: 21px;
  }

  .section-label {
    font-size: 9px;
  }

  .games-grid,
  .categories-grid {
    gap: 11px;
  }

  .featured-banner {
    min-height: 280px;
    margin-bottom: 30px;
    background-position: 65% center;
  }

  .featured-content {
    padding: 22px;
  }

  .featured-content h2 {
    font-size: 24px;
  }

  .featured-label {
    font-size: 9px;
  }

  .community-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .review-card,
  .join-card {
    padding: 19px;
  }

  .portal-stats {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 18px 10px;
    padding: 22px 0;
  }

  .stat-item {
    gap: 9px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .stat-content strong {
    font-size: 19px;
  }

  .stat-content span,
  .stat-link {
    font-size: 10px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .home-page {
    padding-right: 10px;
    padding-left: 10px;
  }

  .games-grid,
  .categories-grid {
    gap: 8px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .primary-button,
  .genre-filters button {
    transition: none;
  }

}

</style>
