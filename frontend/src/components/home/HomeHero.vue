
<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted
} from 'vue'

import { RouterLink } from 'vue-router'
import { getGames } from '../../services/gameService'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

import {
  useLibraryStore,
  LIBRARY_STATUSES
} from '../../stores/libraryStore'

const libraryStore = useLibraryStore()

/* POLECANE GRY */

const slides = ref([])

async function loadSlides() {
  try {
    const response = await getGames({
      featured: 1,
      per_page: 5
    })

    slides.value = response.data.map(game => ({
      id: game.id,
      slug: game.slug,
      title: game.title,
      headline: game.title,
      description: game.short_description || game.description,
      rating: game.rating ?? '—',
      genre: game.genres?.join(' · ') || 'Brak kategorii',
      platforms: game.platforms?.join(' · ') || '',
      image: game.banner_url || game.cover_url || ''
    }))

    activeIndex.value = 0
  } catch {
    slides.value = []
  }
}

/* STAN SLAJDERA */

const activeIndex = ref(0)
const paused = ref(false)
const hovered = ref(false)
const focused = ref(false)

const activeSlide = computed(() =>
  slides.value[activeIndex.value]
)

const currentNumber = computed(() =>
  String(activeIndex.value + 1).padStart(2, '0')
)

const totalNumber = computed(() =>
  String(slides.value.length).padStart(2, '0')
)

let timer = null

/* BIBLIOTEKA */

const isSaved = computed(() =>
  activeSlide.value ? libraryStore.hasGame(activeSlide.value.id) : false
)

const currentStatus = computed(() =>
  activeSlide.value ? libraryStore.getStatus(activeSlide.value.id) : null
)

const statusInformation = computed(() =>
  LIBRARY_STATUSES.find(
    status => status.value === currentStatus.value
  ) || null
)

/* POWIADOMIENIA */

const notification = ref('')
const notificationType = ref('success')

let notificationTimer = null

function showNotification(
  message,
  type = 'success'
) {
  clearTimeout(notificationTimer)

  notification.value = message
  notificationType.value = type

  notificationTimer = setTimeout(() => {
    notification.value = ''
  }, 3500)
}

/* DODAWANIE I USUWANIE GRY */

async function toggleLibrary() {
  if (!activeSlide.value || libraryStore.saving) return

  if (!authStore.isAuthenticated) {
    showNotification('Najpierw się zaloguj.', 'error')
    return
  }

  const game = activeSlide.value

  const wasSaved = libraryStore.hasGame(
    game.id
  )

  const success = await libraryStore.toggleGame(
    game.id
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
      ? `Usunięto ${game.title} z biblioteki.`
      : `Dodano ${game.title} do biblioteki.`
  )
}

/* STEROWANIE SLAJDEREM */

function nextSlide() {
  if (!slides.value.length) return

  activeIndex.value =
    (activeIndex.value + 1) % slides.value.length
}

function previousSlide() {
  if (!slides.value.length) return

  activeIndex.value =
    (activeIndex.value - 1 + slides.value.length) %
    slides.value.length
}

function selectSlide(index) {
  activeIndex.value = index
}

function toggleAutoplay() {
  paused.value = !paused.value
}

function handleFocusOut(event) {
  if (
    !event.currentTarget.contains(
      event.relatedTarget
    )
  ) {
    focused.value = false
  }
}

/* RESET POWIADOMIENIA */

watch(activeIndex, () => {
  notification.value = ''

  clearTimeout(notificationTimer)
})

/* AUTOMATYCZNE SLAJDY */

onMounted(() => {
  loadSlides()

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

/* CZYSZCZENIE TIMEROW */

onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer)
  }

  clearTimeout(notificationTimer)
})
</script>

<template>
  <section
    class="home-hero"
    v-if="activeSlide"
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

      <Transition
        name="content-fade"
        mode="out-in"
      >

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

          <!-- INFORMACJE O GRZE -->

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

          <!-- PRZYCISKI -->

          <div class="hero-actions">

            <RouterLink
              :to="`/games/${activeSlide.slug}`"
              class="primary-button"
            >

              Odkryj grę

              <span>→</span>

            </RouterLink>

            <button
              type="button"
              class="secondary-button"
              :disabled="libraryStore.saving"
              :class="{ saved: isSaved }"
              :aria-pressed="isSaved"
              :aria-label="
                isSaved
                  ? `Usuń ${activeSlide.title} z biblioteki`
                  : `Dodaj ${activeSlide.title} do biblioteki`
              "
              @click="toggleLibrary"
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                :fill="isSaved ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h12v18l-6-4-6 4z"/>
              </svg>

              {{
                isSaved
                  ? 'Usuń z biblioteki'
                  : 'Do biblioteki'
              }}

              <span>
                {{ isSaved ? '−' : '+' }}
              </span>

            </button>

          </div>

          <!-- STATUS BIBLIOTEKI -->

          <div
            v-if="isSaved && statusInformation"
            class="saved-information"
          >

            <span
              class="saved-status"
              :style="{
                color: statusInformation.color
              }"
            >

              <span class="status-dot"></span>

              {{ statusInformation.label }}

            </span>

            <RouterLink
              to="/library"
              class="library-link"
            >
              Moja biblioteka →
            </RouterLink>

          </div>

        </div>

      </Transition>

      <!-- POWIADOMIENIA -->

      <Transition name="notification-fade">

        <div
          v-if="notification"
          class="hero-notification"
          :class="notificationType"
          role="status"
        >

          <span class="notification-icon">
            {{ notificationType === 'success' ? '✓' : '!' }}
          </span>

          <span class="notification-message">
            {{ notification }}
          </span>

          <button
            type="button"
            aria-label="Zamknij powiadomienie"
            @click="notification = ''"
          >
            ×
          </button>

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

/* GLOWNY BANER */

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
  gap: 10px;
  min-height: 43px;
  padding: 11px 18px;
  border-radius: 7px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background .2s,
    border-color .2s,
    color .2s;
}

.primary-button {
  gap: 18px;
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
  border-color: #8B5CF6;
}

.secondary-button.saved {
  background: #31234F;
  border-color: #8B5CF6;
  color: #E9D5FF;
}

.secondary-button.saved:hover {
  background: #3D222B;
  border-color: #991B1B;
  color: #FCA5A5;
}

.secondary-button svg {
  flex-shrink: 0;
}

/* STATUS BIBLIOTEKI */

.saved-information {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
}

.saved-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  background: rgba(11, 15, 25, .8);
  border: 1px solid #44306B;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
}

.status-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
}

.library-link {
  color: #C4B5FD;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.library-link:hover {
  color: #FFFFFF;
}

/* POWIADOMIENIA */

.hero-notification {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 460px;
  margin-top: 15px;
  padding: 11px 13px;
  background: #143529;
  border: 1px solid #166534;
  border-radius: 7px;
  color: #86EFAC;
  font-size: 12px;
}

.hero-notification.error {
  background: #3D222B;
  border-color: #991B1B;
  color: #FCA5A5;
}

.notification-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  background: rgba(255,255,255,.07);
  border-radius: 50%;
  font-size: 15px;
  font-weight: 700;
}

.notification-message {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.hero-notification button {
  flex-shrink: 0;
  padding: 2px 5px;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 20px;
  cursor: pointer;
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
  cursor: pointer;
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
  cursor: pointer;
}

.pause-button:hover {
  color: #FFFFFF;
}

/* STRZALKI */

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
  cursor: pointer;
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

/* DOSTEPNOSC */

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

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition:
    opacity .2s ease,
    transform .2s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
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

  .saved-information {
    justify-content: space-between;
    gap: 8px;
    margin-top: 12px;
  }

  .saved-status {
    padding: 5px 8px;
    font-size: 10px;
  }

  .library-link {
    font-size: 10px;
  }

  .hero-notification {
    margin-top: 12px;
    padding: 10px;
    font-size: 11px;
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

/* MALE TELEFONY */

@media (max-width: 360px) {

  .hero-content {
    padding-right: 15px;
    padding-left: 15px;
  }

  .hero-title {
    font-size: 25px;
  }

  .saved-information {
    gap: 7px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  *,
  *::before,
  *::after {
    transition: none !important;
  }

}

</style>
