
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const emit = defineEmits(['add-to-library'])

const slides = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    headline: 'Night City nie śpi. Ty też nie zechcesz.',
    description: 'Zanurz się w otwartym świecie przyszłości. Zbuduj swoją legendę w mieście, w którym wszystko ma swoją cenę.',
    rating: '9.8',
    genre: 'RPG akcji',
    platforms: 'PC · PS5 · Xbox',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg'
  },
  {
    id: 2,
    title: 'Elden Ring',
    headline: 'Odkryj świat pełen tajemnic.',
    description: 'Wyrusz w niezwykłą podróż przez ogromny świat fantasy i odkryj jego sekrety.',
    rating: '9.3',
    genre: 'RPG',
    platforms: 'PC · PlayStation · Xbox',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg'
  },
  {
    id: 3,
    title: "Baldur's Gate 3",
    headline: 'Twoja historia. Twoje decyzje.',
    description: 'Stwórz własną drużynę i odkryj świat, w którym każda decyzja ma znaczenie.',
    rating: '9.6',
    genre: 'RPG turowe',
    platforms: 'PC · PS5 · Xbox',
    image: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_hero.jpg'
  }
]

const activeIndex = ref(0)
const paused = ref(false)
const hovered = ref(false)
const focused = ref(false)

const activeSlide = computed(
  () => slides[activeIndex.value]
)

const currentNumber = computed(
  () => String(activeIndex.value + 1).padStart(2, '0')
)

const totalNumber = String(slides.length).padStart(2, '0')

let timer = null

function nextSlide() {
  activeIndex.value =
    (activeIndex.value + 1) % slides.length
}

function previousSlide() {
  activeIndex.value =
    (activeIndex.value - 1 + slides.length) %
    slides.length
}

function selectSlide(index) {
  activeIndex.value = index
}

function toggleAutoplay() {
  paused.value = !paused.value
}

function handleFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    focused.value = false
  }
}

onMounted(() => {
  paused.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  timer = window.setInterval(() => {
    if (
      !paused.value &&
      !hovered.value &&
      !focused.value &&
      !document.hidden
    ) {
      nextSlide()
    }
  }, 6500)
})

onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <section
    class="home-hero"
    aria-label="Polecane gry"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="handleFocusOut"
  >

    <!-- GRAFIKA -->

    <Transition name="hero-fade">
      <div
        :key="activeSlide.id"
        class="hero-background"
        :style="{
          backgroundImage: `url('${activeSlide.image}')`
        }"
        aria-hidden="true"
      ></div>
    </Transition>

    <div class="hero-overlay"></div>

    <!-- TRESC -->

    <div class="hero-content">

      <div class="hero-badge">
        <span>✦</span>
        WYBÓR REDAKCJI
      </div>

      <Transition name="content-fade" mode="out-in">

        <div
          :key="activeSlide.id"
          class="slide-content"
        >

          <h1 class="hero-title">
            {{ activeSlide.headline }}
          </h1>

          <p class="game-title">
            {{ activeSlide.title }}
          </p>

          <p class="hero-description">
            {{ activeSlide.description }}
          </p>

          <div class="hero-metadata">

            <span class="rating">
              ★ {{ activeSlide.rating }}
            </span>

            <span class="genre">
              {{ activeSlide.genre }}
            </span>

            <span class="platforms">
              {{ activeSlide.platforms }}
            </span>

          </div>

          <div class="hero-actions">

            <RouterLink
              :to="{
                path: '/games',
                query: {
                  search: activeSlide.title
                }
              }"
              class="primary-button"
            >
              Odkryj grę
              <span>→</span>
            </RouterLink>

            <button
              type="button"
              class="secondary-button"
              @click="emit('add-to-library', activeSlide)"
            >
              Do biblioteki
              <span>+</span>
            </button>

          </div>

        </div>

      </Transition>

      <!-- STEROWANIE SLAJDEREM -->

      <div class="hero-controls">

        <span class="slide-number">
          {{ currentNumber }}
        </span>

        <div class="slide-indicators">

          <button
            v-for="(slide, index) in slides"
            :key="slide.id"
            type="button"
            class="indicator"
            :class="{
              active: index === activeIndex
            }"
            :aria-label="`Pokaż ${slide.title}`"
            :aria-pressed="index === activeIndex"
            @click="selectSlide(index)"
          ></button>

        </div>

        <span class="slide-number">
          {{ totalNumber }}
        </span>

        <button
          type="button"
          class="pause-button"
          :aria-label="
            paused
              ? 'Wznów slajdy'
              : 'Zatrzymaj slajdy'
          "
          @click="toggleAutoplay"
        >
          {{ paused ? '▶' : 'Ⅱ' }}
        </button>

      </div>

    </div>

    <!-- STRZALKI -->

    <div class="hero-arrows">

      <button
        type="button"
        aria-label="Poprzednia gra"
        @click="previousSlide"
      >
        ‹
      </button>

      <button
        type="button"
        aria-label="Następna gra"
        @click="nextSlide"
      >
        ›
      </button>

    </div>

    <span class="hero-caption">
      TWÓJ NASTĘPNY ŚWIAT CZEKA
    </span>

  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 460px;
  overflow: hidden;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 14px;
  color: #F8FAFC;
  text-align: left;
}

/* GRAFIKA */

.hero-background {
  position: absolute;
  inset: 0;
  z-index: -3;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(
    90deg,
    rgba(11, 15, 25, .98) 0%,
    rgba(11, 15, 25, .90) 25%,
    rgba(11, 15, 25, .50) 55%,
    rgba(11, 15, 25, .10) 100%
  );
}

/* TRESC */

.hero-content {
  position: relative;
  width: 100%;
  max-width: 620px;
  padding: 42px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 24px;
  padding: 7px 12px;
  background: rgba(139, 92, 246, .16);
  border: 1px solid rgba(139, 92, 246, .24);
  border-radius: 5px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.hero-title {
  max-width: 520px;
  margin: 0 0 20px;
  background: none;
  color: #F8FAFC;
  -webkit-text-fill-color: #F8FAFC;
  font-size: clamp(30px, 3.8vw, 52px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -1.5px;
  text-align: left;
}

.game-title {
  margin: 0 0 10px;
  color: #22D3EE;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero-description {
  max-width: 440px;
  margin: 0 0 20px;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.7;
  text-align: left;
}

/* INFORMACJE O GRZE */

.hero-metadata {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  color: #CBD5E1;
  font-size: 11px;
}

.rating {
  padding: 5px 9px;
  background: rgba(34, 211, 238, .12);
  border-radius: 5px;
  color: #67E8F9;
  font-weight: 700;
}

.genre,
.platforms {
  color: #CBD5E1;
}

/* PRZYCISKI */

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 43px;
  padding: 11px 18px;
  border-radius: 7px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background .2s;
}

.primary-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  box-shadow: 0 5px 20px rgba(139, 92, 246, .18);
}

.primary-button:hover {
  background: #7C3AED;
}

.secondary-button {
  background: #151B2B;
  border: 1px solid #293244;
}

.secondary-button:hover {
  background: #20283B;
}

/* STEROWANIE */

.hero-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
}

.slide-number {
  color: #CBD5E1;
  font-size: 11px;
}

.slide-indicators {
  display: flex;
  align-items: center;
  gap: 5px;
}

.indicator {
  position: relative;
  width: 24px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  transition: width .2s;
}

.indicator::after {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  height: 4px;
  background: #475569;
  border-radius: 4px;
  content: '';
}

.indicator.active {
  width: 44px;
}

.indicator.active::after {
  background: #8B5CF6;
}

.pause-button {
  width: 30px;
  height: 30px;
  padding: 0;
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 14px;
}

.hero-arrows {
  position: absolute;
  right: 22px;
  bottom: 44px;
  display: flex;
  gap: 8px;
}

.hero-arrows button {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  padding: 0;
  background: rgba(11, 15, 25, .75);
  border: 1px solid #475569;
  border-radius: 7px;
  color: #FFFFFF;
  font-size: 24px;
}

.hero-arrows button:hover {
  background: #8B5CF6;
}

.hero-caption {
  position: absolute;
  right: 24px;
  bottom: 18px;
  color: #CBD5E1;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* ANIMACJE */

.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity .6s ease;
}

.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition: opacity .2s ease;
}

.content-fade-enter-from,
.content-fade-leave-to {
  opacity: 0;
}

/* TABLETY */

@media (max-width: 900px) {
  .home-hero {
    min-height: 420px;
  }

  .hero-content {
    max-width: 540px;
    padding: 30px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-background {
    background-position: 65% center;
  }
}

/* TELEFONY */

@media (max-width: 600px) {
  .home-hero {
    display: block;
    min-height: auto;
    border-radius: 12px;
  }

  .hero-background {
    inset: 0 0 auto;
    height: 250px;
    background-position: center top;
  }

  .hero-overlay {
    background: linear-gradient(
      180deg,
      rgba(11, 15, 25, .05) 0,
      rgba(11, 15, 25, .15) 90px,
      #111827 250px
    );
  }

  .hero-content {
    max-width: none;
    padding: 195px 20px 18px;
  }

  .hero-badge {
    margin-bottom: 14px;
    font-size: 9px;
  }

  .hero-title {
    margin-bottom: 14px;
    font-size: 29px;
    line-height: 1.16;
    letter-spacing: -.7px;
  }

  .game-title {
    margin-bottom: 9px;
    font-size: 11px;
  }

  .hero-description {
    margin-bottom: 16px;
    font-size: 13px;
    line-height: 1.65;
  }

  .hero-metadata {
    gap: 9px;
    margin-bottom: 18px;
    font-size: 10px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    min-height: 44px;
  }

  .hero-controls {
    justify-content: center;
    margin-top: 16px;
  }

  .hero-arrows {
    top: 14px;
    right: 14px;
    bottom: auto;
  }

  .hero-caption {
    display: none;
  }
}

@media (max-width: 360px) {
  .hero-content {
    padding-right: 15px;
    padding-left: 15px;
  }

  .hero-title {
    font-size: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
