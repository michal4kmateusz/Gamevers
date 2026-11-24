
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const activeGenre = ref('Wszystkie gry')
const activeSlide = ref(0)

function steamImage(id, file = 'header.jpg') {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${id}/${file}`
}

const slides = [
  {
    title: 'Night City nie śpi. Ty też nie zechcesz.',
    game: 'Cyberpunk 2077',
    description: 'Zanurz się w otwartym świecie przyszłości. Zbuduj swoją legendę w mieście, w którym wszystko ma swoją cenę.',
    image: steamImage(1091500, 'library_hero.jpg'),
    rating: '9.8',
    genre: 'RPG akcji',
    platforms: 'PC · PS5 · Xbox'
  },
  {
    title: 'Odkryj świat pełen tajemnic.',
    game: 'ELDEN RING',
    description: 'Wyrusz w niezwykłą podróż przez ogromny świat fantasy.',
    image: steamImage(1245620, 'library_hero.jpg'),
    rating: '9.3',
    genre: 'RPG',
    platforms: 'PC · PlayStation · Xbox'
  },
  {
    title: 'Każda decyzja zmienia historię.',
    game: "Baldur's Gate 3",
    description: 'Zbierz drużynę i odkryj świat pełen przygód oraz niezwykłych postaci.',
    image: steamImage(1086940, 'library_hero.jpg'),
    rating: '9.6',
    genre: 'RPG',
    platforms: 'PC · PS5 · Xbox'
  }
]

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
    genre: 'Roguelike · Akcja',
    rating: '9.1',
    image: steamImage(1145360),
    platforms: 'PC · PlayStation · Xbox'
  }
]

const genres = [
  'Wszystkie gry',
  'RPG',
  'Akcja',
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

const currentSlide = computed(
  () => slides[activeSlide.value]
)

const filteredGames = computed(() => {
  const query = search.value.trim().toLowerCase()

  return games.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(query) ||
      game.genre.toLowerCase().includes(query)

    const matchesGenre =
      activeGenre.value === 'Wszystkie gry' ||
      game.genre.includes(activeGenre.value)

    return matchesSearch && matchesGenre
  })
})

function selectSlide(index) {
  activeSlide.value = index
}

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
  activeGenre.value = category
  browseGames()
}

let slideTimer

onMounted(() => {
  slideTimer = setInterval(() => {
    activeSlide.value =
      (activeSlide.value + 1) % slides.length
  }, 8000)
})

onUnmounted(() => {
  clearInterval(slideTimer)
})
</script>

<template>
  <main class="home-page">
    <div class="home-container">

      <!-- GŁÓWNY BANER -->
      <section
        class="hero"
        :style="{
          backgroundImage:
            `linear-gradient(90deg, #0B0F19 0%, rgba(11,15,25,.85) 30%, rgba(11,15,25,.12) 100%), url('${currentSlide.image}')`
        }"
      >
        <div class="hero-content">
          <span class="editor-badge">
            ✦ WYBÓR REDAKCJI
          </span>

          <h1>{{ currentSlide.title }}</h1>

          <span class="hero-game">
            {{ currentSlide.game }}
          </span>

          <p>{{ currentSlide.description }}</p>

          <div class="hero-meta">
            <span class="rating">
              ★ {{ currentSlide.rating }}
            </span>

            <span>{{ currentSlide.genre }}</span>
            <span>{{ currentSlide.platforms }}</span>
          </div>

          <div class="hero-actions">
            <RouterLink
              to="/games"
              class="primary-button"
            >
              Odkryj grę →
            </RouterLink>

            <RouterLink
              to="/library"
              class="secondary-button"
            >
              Do biblioteki +
            </RouterLink>
          </div>

          <div class="slider-controls">
            <span>0{{ activeSlide + 1 }}</span>

            <button
              v-for="(slide, index) in slides"
              :key="slide.game"
              type="button"
              class="slider-dot"
              :class="{
                active: activeSlide === index
              }"
              :aria-label="`Pokaż ${slide.game}`"
              :aria-pressed="activeSlide === index"
              @click="selectSlide(index)"
            ></button>

            <span>03</span>
          </div>
        </div>
      </section>

      <!-- WYSZUKIWARKA -->
      <section class="discovery-section">
        <div class="discovery-heading">
          <h2>W co dziś zagrasz?</h2>
          <p>Tysiące światów. Znajdź ten dla siebie.</p>
        </div>

        <div class="discovery-content">
          <form
            class="search-form"
            @submit.prevent="browseGames"
          >
            <input
              v-model="search"
              type="search"
              aria-label="Szukaj gry"
              placeholder="Wpisz tytuł, gatunek lub nazwę studia..."
            />

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
            <h2>Popularne teraz</h2>
            <p>Tytuły, o których mówi społeczność.</p>
          </div>

          <RouterLink to="/games">
            Zobacz wszystkie →
          </RouterLink>
        </div>

        <div
          v-if="filteredGames.length"
          class="games-grid"
        >
          <article
            v-for="game in filteredGames"
            :key="game.title"
            class="game-card"
          >
            <div class="game-image">
              <img
                :src="game.image"
                :alt="game.title"
                loading="lazy"
              />

              <span class="card-rating">
                ★ {{ game.rating }}
              </span>

              <RouterLink
                to="/library"
                class="add-game"
                aria-label="Przejdź do biblioteki"
              >
                +
              </RouterLink>
            </div>

            <div class="game-content">
              <h3>{{ game.title }}</h3>
              <p>{{ game.genre }}</p>

              <div class="game-footer">
                {{ game.platforms }}
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          Nie znaleziono pasujących gier
          w kolekcji demonstracyjnej.
        </div>
      </section>

      <!-- GATUNKI -->
      <section class="home-section">
        <div class="section-heading">
          <div>
            <h2>Twój styl. Twoja rozgrywka.</h2>
            <p>Odkrywaj według gatunku.</p>
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
                `linear-gradient(90deg, rgba(11,15,25,.9), rgba(11,15,25,.35)), url('${category.image}')`
            }"
            @click="selectCategory(category.name)"
          >
            <strong>{{ category.name }}</strong>
            <span>Odkrywaj →</span>
          </button>
        </div>
      </section>

      <!-- WYRÓŻNIONA GRA -->
      <section
        class="featured-banner"
        :style="{
          backgroundImage:
            `linear-gradient(90deg, #151B2B, rgba(11,15,25,.35)), url('${steamImage(367520, 'library_hero.jpg')}')`
        }"
      >
        <div class="featured-content">
          <span class="featured-label">
            POZA GŁÓWNYM SZLAKIEM
          </span>

          <h2>Mała gra. Ogromny świat.</h2>
          <h3>Hollow Knight</h3>

          <p>
            Zejdź do Hallownest. Zgub się
            w pięknym, ręcznie rysowanym świecie.
          </p>

          <div class="featured-actions">
            <RouterLink
              to="/games"
              class="primary-button"
            >
              Poznaj gry →
            </RouterLink>

            <span class="rating">
              ★ 9.4
            </span>
          </div>
        </div>
      </section>

      <!-- SPOŁECZNOŚĆ -->
      <section class="home-section">
        <div class="section-heading">
          <div>
            <h2>Gry łączą. Opinie mają znaczenie.</h2>

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

              <strong>{{ review.author }}</strong>

              <span class="rating">
                ★ {{ review.rating }}
              </span>
            </div>

            <h3>{{ review.game }}</h3>

            <p>{{ review.content }}</p>

            <div class="review-footer">
              Przykładowa recenzja
            </div>
          </article>

          <article class="join-card">
            <span class="join-icon">▥</span>

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
        <div>
          <strong>Odkrywaj</strong>
          <span>nowe gry</span>
        </div>

        <div>
          <strong>Dołącz</strong>
          <span>do społeczności</span>
        </div>

        <div>
          <strong>Twórz</strong>
          <span>własną kolekcję</span>
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
.home-page {
  min-height: 100vh;
  background: #0B0F19;
  color: #F8FAFC;
  padding: 16px 24px 45px;
}

.home-container {
  max-width: 1400px;
  margin: 0 auto;
}

.hero {
  min-height: 460px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  border: 1px solid #293244;
  border-radius: 16px;
  overflow: hidden;
}

.hero-content {
  max-width: 590px;
  padding: 45px;
}

.editor-badge {
  display: inline-block;
  padding: 8px 12px;
  background: rgba(139, 92, 246, .2);
  color: #C4B5FD;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.hero h1 {
  margin: 30px 0 20px;
  font-size: clamp(32px, 4vw, 55px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -1.5px;
}

.hero-game {
  color: #22D3EE;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero-content p {
  max-width: 440px;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.8;
}

.hero-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  color: #CBD5E1;
  font-size: 12px;
  margin: 20px 0;
}

.rating,
.card-rating {
  display: inline-block;
  padding: 5px 9px;
  background: #123443;
  color: #67E8F9;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.hero-actions,
.featured-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 13px 22px;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  box-shadow: 0 4px 18px rgba(139,92,246,.2);
}

.primary-button:hover {
  background: #7C3AED;
}

.secondary-button {
  background: #151B2B;
  border: 1px solid #293244;
}

.slider-controls {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 35px;
  font-size: 11px;
  color: #CBD5E1;
}

.slider-dot {
  width: 25px;
  height: 4px;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: #475569;
  cursor: pointer;
}

.slider-dot.active {
  width: 50px;
  background: #8B5CF6;
}

.discovery-section {
  display: grid;
  grid-template-columns: 1fr 1.7fr;
  gap: 30px;
  align-items: start;
  padding: 35px 0;
}

.discovery-heading h2,
.section-heading h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 750;
}

.discovery-heading p,
.section-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
}

.search-form {
  display: flex;
  gap: 12px;
}

.search-form input {
  flex: 1;
  min-width: 0;
  padding: 13px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #F8FAFC;
  font: inherit;
  font-size: 13px;
}

.search-form input:focus {
  outline: 1px solid #8B5CF6;
}

.genre-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.genre-filters button {
  padding: 7px 12px;
  background: transparent;
  border: 1px solid #293244;
  border-radius: 5px;
  color: #94A3B8;
  font-size: 11px;
  cursor: pointer;
}

.genre-filters button.selected {
  background: #31234F;
  border-color: #8B5CF6;
  color: #E9D5FF;
}

.home-section {
  margin: 15px 0 35px;
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
  text-decoration: none;
  font-size: 12px;
  white-space: nowrap;
}

.games-grid,
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.game-card {
  overflow: hidden;
  min-width: 0;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  transition: transform .2s, border-color .2s;
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: #8B5CF6;
}

.game-image {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #24203C;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-rating {
  position: absolute;
  top: 10px;
  left: 10px;
}

.add-game {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: #0B0F19;
  border-radius: 6px;
  color: #FFFFFF;
  text-decoration: none;
}

.game-content {
  padding: 17px;
}

.game-content h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.game-content p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
}

.game-footer {
  margin-top: 20px;
  padding-top: 13px;
  border-top: 1px solid #293244;
  color: #94A3B8;
  font-size: 10px;
}

.category-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: 130px;
  padding: 20px;
  background-size: cover;
  background-position: center;
  border: 1px solid #293244;
  border-radius: 12px;
  color: #F8FAFC;
  text-align: left;
  cursor: pointer;
}

.category-card:hover {
  border-color: #8B5CF6;
}

.category-card strong {
  font-size: 19px;
}

.category-card span {
  margin-top: 10px;
  color: #CBD5E1;
  font-size: 12px;
}

.featured-banner {
  display: flex;
  align-items: center;
  min-height: 240px;
  margin-bottom: 35px;
  background-size: cover;
  background-position: center;
  border: 1px solid #293244;
  border-radius: 14px;
}

.featured-content {
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
  font-size: 30px;
}

.featured-content h3 {
  margin: 0;
  font-size: 15px;
  color: #CBD5E1;
}

.featured-content p {
  margin: 15px 0 20px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.review-card,
.join-card {
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

.review-header .rating {
  margin-left: auto;
}

.avatar {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
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
  margin-top: 25px;
  padding-top: 13px;
  border-top: 1px solid #293244;
  color: #64748B;
  font-size: 11px;
}

.join-card {
  background: linear-gradient(
    135deg,
    #31234F,
    #151B2B
  );
}

.join-icon {
  display: inline-block;
  padding: 10px;
  background: #44306B;
  border-radius: 8px;
  color: #C4B5FD;
  font-size: 20px;
}

.join-card h2 {
  font-size: 22px;
  line-height: 1.3;
}

.join-card .primary-button {
  width: 100%;
  margin-top: 10px;
}

.portal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 25px 0;
  border-top: 1px solid #293244;
}

.portal-stats div {
  display: flex;
  align-items: center;
  gap: 15px;
}

.portal-stats strong {
  font-size: 22px;
}

.portal-stats span,
.demo-notice {
  color: #94A3B8;
  font-size: 12px;
}

.demo-notice {
  text-align: center;
  margin-top: 25px;
}

.empty-state {
  padding: 35px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: center;
  color: #94A3B8;
}

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

  .portal-stats div {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 600px) {
  .home-page {
    padding: 12px 15px 35px;
  }

  .hero {
    min-height: 450px;
    background-position: 65% center;
  }

  .hero-content {
    padding: 25px;
  }

  .hero h1 {
    font-size: 33px;
  }

  .search-form {
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading h2,
  .discovery-heading h2 {
    font-size: 21px;
  }

  .games-grid,
  .categories-grid {
    gap: 12px;
  }

  .game-content {
    padding: 12px;
  }

  .game-content h3 {
    font-size: 13px;
  }

  .category-card {
    min-height: 100px;
    padding: 14px;
  }

  .category-card strong {
    font-size: 16px;
  }

  .featured-content {
    padding: 23px;
  }

  .featured-content h2 {
    font-size: 24px;
  }

  .community-grid {
    grid-template-columns: 1fr;
  }

  .portal-stats strong {
    font-size: 16px;
  }

  .portal-stats span {
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-card {
    transition: none;
  }

  .game-card:hover {
    transform: none;
  }
}
</style>
