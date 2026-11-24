
<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import HomeHero from '../components/home/HomeHero.vue'
import PopularGameCard from '../components/games/PopularGameCard.vue'

const router = useRouter()

const search = ref('')
const activeGenre = ref('Wszystkie gry')

function steamImage(id, file = 'header.jpg') {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${id}/${file}`
}

/* POPULARNE GRY */

const games = [
  {
    title: 'ELDEN RING',
    genre: 'RPG · Otwarty świat',
    rating: '9.3',
    image: steamImage(1245620),
    platforms: 'PC · PlayStation · Xbox'
  },
  {
    title: "Baldur's Gate 3",
    genre: 'RPG · Turowe',
    rating: '9.6',
    image: steamImage(1086940),
    platforms: 'PC · PS5 · Xbox'
  },
  {
    title: 'Wiedźmin 3: Dziki Gon',
    genre: 'RPG · Otwarty świat',
    rating: '9.5',
    image: steamImage(292030),
    platforms: 'PC · PlayStation · Xbox'
  },
  {
    title: 'Hades',
    genre: 'Roguelike · Akcja · Niezależne',
    rating: '9.1',
    image: steamImage(1145360),
    platforms: 'PC · PlayStation · Xbox'
  }
]

/* GATUNKI */

const genres = [
  'Wszystkie gry',
  'RPG',
  'Akcja',
  'Otwarty świat',
  'Przygodowe',
  'Strategiczne',
  'Niezależne',
  'Wyścigowe'
]

const categories = [
  {
    name: 'RPG',
    image: steamImage(1086940)
  },
  {
    name: 'Akcja',
    image: steamImage(1145360)
  },
  {
    name: 'Otwarty świat',
    image: steamImage(1245620)
  },
  {
    name: 'Niezależne',
    image: steamImage(367520)
  }
]

/* RECENZJE DEMONSTRACYJNE */

const reviews = [
  {
    author: 'NeonRaven',
    game: 'Cyberpunk 2077',
    rating: '9.0',
    content: 'Night City wciąga od pierwszej minuty. Świetnie napisane postacie i świat, do którego po prostu chce się wracać.'
  },
  {
    author: 'Luna.exe',
    game: 'Hollow Knight',
    rating: '9.5',
    content: 'Każdy zakątek skrywa coś nowego. Muzyka, klimat i wyjątkowy świat tworzą niesamowitą przygodę.'
  }
]

/* FILTROWANIE GIER */

const filteredGames = computed(() => {
  const query = search.value.trim().toLowerCase()

  return games.filter(game => {
    const matchesSearch =
      game.title.toLowerCase().includes(query) ||
      game.genre.toLowerCase().includes(query)

    const matchesGenre =
      activeGenre.value === 'Wszystkie gry' ||
      game.genre.toLowerCase().includes(
        activeGenre.value.toLowerCase()
      )

    return matchesSearch && matchesGenre
  })
})

/* NAWIGACJA */

function browseGames() {
  router.push({
    path: '/games',
    query: {
      ...(search.value.trim()
        ? { search: search.value.trim() }
        : {}),
      ...(activeGenre.value !== 'Wszystkie gry'
        ? { genre: activeGenre.value }
        : {})
    }
  })
}

function selectCategory(category) {
  router.push({
    path: '/games',
    query: {
      genre: category
    }
  })
}

function resetFilters() {
  search.value = ''
  activeGenre.value = 'Wszystkie gry'
}

function handleAddToLibrary() {
  router.push('/library')
}
</script>

<template>
  <main class="home-page">

    <div class="home-container">

      <!-- GLOWNY BANER -->

      <HomeHero
        @add-to-library="handleAddToLibrary"
      />

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
                width="20"
                height="20"
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
                aria-label="Szukaj gry"
                placeholder="Wpisz tytuł lub gatunek..."
              />

            </div>

            <button
              type="submit"
              class="primary-button"
            >
              Przeglądaj gry →
            </button>

          </form>

          <div class="genre-filters">

            <button
              v-for="genre in genres"
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

            <h2>Popularne teraz</h2>

            <p>
              Tytuły, o których mówi społeczność.
            </p>

          </div>

          <RouterLink to="/games">
            Zobacz wszystkie →
          </RouterLink>

        </div>

        <!-- NOWY KOMPONENT KARTY -->

        <div
          v-if="filteredGames.length"
          class="games-grid"
        >

          <PopularGameCard
            v-for="game in filteredGames"
            :key="game.title"
            :game="game"
            @add-to-library="handleAddToLibrary"
          />

        </div>

        <!-- BRAK WYNIKOW -->

        <div
          v-else
          class="empty-state"
        >

          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m16 16 5 5"/>
          </svg>

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

          <RouterLink to="/games">
            Wszystkie gatunki →
          </RouterLink>

        </div>

        <div class="categories-grid">

          <button
            v-for="category in categories"
            :key="category.name"
            type="button"
            class="category-card"
            :style="{
              backgroundImage:
                `linear-gradient(90deg, rgba(11,15,25,.95), rgba(11,15,25,.35)), url('${category.image}')`
            }"
            @click="selectCategory(category.name)"
          >

            <strong>
              {{ category.name }}
            </strong>

            <span>
              Odkrywaj →
            </span>

          </button>

        </div>

      </section>

      <!-- WYROZNIONA GRA -->

      <section
        class="featured-banner"
        :style="{
          backgroundImage:
            `linear-gradient(90deg, #151B2B 0%, rgba(11,15,25,.75) 45%, rgba(11,15,25,.15) 100%), url('${steamImage(367520, 'library_hero.jpg')}')`
        }"
      >

        <div class="featured-content">

          <span class="featured-label">
            POZA GŁÓWNYM SZLAKIEM
          </span>

          <h2>
            Mała gra. Ogromny świat.
          </h2>

          <h3>Hollow Knight</h3>

          <p>
            Zejdź do Hallownest.
            Zgub się w pięknym,
            ręcznie rysowanym świecie.
          </p>

          <div class="featured-actions">

            <RouterLink
              :to="{
                path: '/games',
                query: {
                  search: 'Hollow Knight'
                }
              }"
              class="primary-button"
            >
              Poznaj grę →
            </RouterLink>

            <span class="rating">
              ★ 9.4
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
              Sprawdź, co polecają inni gracze.
            </p>

          </div>

        </div>

        <div class="community-grid">

          <article
            v-for="review in reviews"
            :key="review.author"
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
                ★ {{ review.rating }}
              </span>

            </div>

            <h3>
              {{ review.game }}
            </h3>

            <p>
              {{ review.content }}
            </p>

            <div class="review-footer">
              Przykładowa recenzja
            </div>

          </article>

          <!-- REJESTRACJA -->

          <article class="join-card">

            <div class="join-icon">

              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
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

            </div>

            <h2>
              Wszystkie Twoje gry.
              W jednym miejscu.
            </h2>

            <p>
              Planuj, oceniaj i odkrywaj.
              Stwórz własną bibliotekę gier.
            </p>

            <RouterLink
              to="/register"
              class="primary-button"
            >
              Załóż bezpłatne konto →
            </RouterLink>

          </article>

        </div>

      </section>

      <!-- PODSUMOWANIE -->

      <section class="portal-stats">

        <div class="stat-item">

          <span class="stat-icon">
            ◈
          </span>

          <div>
            <strong>Odkrywaj</strong>
            <span>nowe gry</span>
          </div>

        </div>

        <div class="stat-item">

          <span class="stat-icon">
            ◎
          </span>

          <div>
            <strong>Dołącz</strong>
            <span>do społeczności</span>
          </div>

        </div>

        <div class="stat-item">

          <span class="stat-icon">
            ▥
          </span>

          <div>
            <strong>Twórz</strong>
            <span>własną kolekcję</span>
          </div>

        </div>

      </section>

      <p class="demo-notice">
        Gamevers — wersja demonstracyjna.
        Oceny i recenzje są przykładowe.
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
  box-shadow: 0 4px 18px rgba(139, 92, 246, .18);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background .2s;
}

.primary-button:hover {
  background: #7C3AED;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
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
  grid-template-columns: 1fr 1.7fr;
  align-items: start;
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
  align-items: center;
  flex: 1;
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
  box-shadow: 0 0 0 3px rgba(139, 92, 246, .1);
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

/* FILTRY */

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
  transition: background .2s;
}

.genre-filters button:hover {
  color: #F8FAFC;
  border-color: #8B5CF6;
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
  color: #A78BFA;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.section-heading a {
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.section-heading a:hover {
  color: #FFFFFF;
}

/* SIATKA KOMPONENTOW */

.games-grid,
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

/* KATEGORIE */

.category-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  min-height: 130px;
  padding: 20px;
  background-color: #151B2B;
  background-size: cover;
  background-position: center;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #F8FAFC;
  text-align: left;
  cursor: pointer;
  transition:
    transform .2s,
    border-color .2s;
}

.category-card:hover {
  transform: translateY(-3px);
  border-color: #8B5CF6;
}

.category-card strong {
  font-size: 19px;
  line-height: 1.3;
}

.category-card span {
  margin-top: 10px;
  color: #CBD5E1;
  font-size: 12px;
}

/* WYROZNIONA GRA */

.featured-banner {
  display: flex;
  align-items: center;
  min-height: 260px;
  margin-bottom: 38px;
  overflow: hidden;
  background-color: #151B2B;
  background-size: cover;
  background-position: center;
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
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

.featured-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* SPOLECZNOSC */

.community-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  font-weight: 800;
}

.review-card h3 {
  margin: 22px 0 10px;
  color: #C4B5FD;
  font-size: 13px;
}

.review-card p,
.join-card p {
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

/* REJESTRACJA */

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

.join-card .primary-button {
  width: 100%;
  margin-top: auto;
}

/* PODSUMOWANIE */

.portal-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  padding: 25px 0;
  border-top: 1px solid #293244;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
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

.stat-item div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item strong {
  color: #F8FAFC;
  font-size: 19px;
}

.stat-item div span {
  color: #94A3B8;
  font-size: 12px;
}

.demo-notice {
  margin: 15px 0 0;
  color: #64748B;
  text-align: center;
  font-size: 11px;
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

.empty-state svg {
  margin-bottom: 15px;
  color: #A78BFA;
}

.empty-state h3 {
  margin: 0 0 10px;
  color: #F8FAFC;
  font-size: 18px;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 13px;
}

/* TABLETY */

@media (max-width: 1000px) {

  .discovery-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .games-grid,
  .categories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .community-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .join-card {
    grid-column: 1 / -1;
  }

  .stat-item {
    gap: 10px;
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
    scrollbar-color: #293244 transparent;
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

  .section-heading h2,
  .discovery-heading h2 {
    font-size: 21px;
  }

  .section-label {
    font-size: 9px;
  }

  .games-grid,
  .categories-grid {
    gap: 11px;
  }

  .category-card {
    min-height: 110px;
    padding: 14px;
    border-radius: 10px;
  }

  .category-card strong {
    font-size: 16px;
  }

  .category-card span {
    font-size: 11px;
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
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .review-card,
  .join-card {
    padding: 19px;
  }

  .portal-stats {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 22px 0;
  }

  .stat-item strong {
    font-size: 16px;
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

  .category-card strong {
    font-size: 14px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .category-card,
  .primary-button {
    transition: none;
  }

  .category-card:hover {
    transform: none;
  }

}

</style>
