
<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

import {
  useLibraryStore,
  LIBRARY_STATUSES
} from '../stores/libraryStore'

const libraryStore = useLibraryStore()

/* STAN INTERFEJSU */

const search = ref('')
const activeStatus = ref('all')
const sort = ref('newest')
const viewMode = ref('grid')

const notification = ref('')
const notificationType = ref('success')

const gameToRemove = ref(null)
const failedImages = ref({})

/* FILTRY */

const statusFilters = computed(() => [
  {
    value: 'all',
    label: 'Wszystkie',
    count: libraryStore.totalGames
  },
  ...LIBRARY_STATUSES.map(status => ({
    ...status,
    count: libraryStore.stats[status.value]
  }))
])

/* STATYSTYKI */

const statistics = computed(() => [
  {
    label: 'Wszystkie gry',
    value: 'all',
    count: libraryStore.totalGames,
    icon: '▥',
    color: '#F8FAFC'
  },
  {
    label: 'Chcę zagrać',
    value: 'wishlist',
    count: libraryStore.wishlistCount,
    icon: '◇',
    color: '#A78BFA'
  },
  {
    label: 'Gram',
    value: 'playing',
    count: libraryStore.playingCount,
    icon: '▷',
    color: '#22D3EE'
  },
  {
    label: 'Ukończone',
    value: 'completed',
    count: libraryStore.completedCount,
    icon: '✓',
    color: '#4ADE80'
  },
  {
    label: 'Porzucone',
    value: 'dropped',
    count: libraryStore.droppedCount,
    icon: '×',
    color: '#F87171'
  }
])

/* WYSZUKIWANIE I SORTOWANIE */

const filteredLibrary = computed(() => {
  let result = [
    ...libraryStore.searchLibrary(search.value)
  ]

  if (activeStatus.value !== 'all') {
    result = result.filter(
      item => item.status === activeStatus.value
    )
  }

  switch (sort.value) {
    case 'oldest':
      result.sort((a, b) =>
        String(a.created_at).localeCompare(
          String(b.created_at)
        )
      )
      break

    case 'title-asc':
      result.sort((a, b) =>
        a.game.title.localeCompare(
          b.game.title,
          'pl'
        )
      )
      break

    case 'title-desc':
      result.sort((a, b) =>
        b.game.title.localeCompare(
          a.game.title,
          'pl'
        )
      )
      break

    case 'rating':
      result.sort((a, b) =>
        Number(b.game.rating) -
        Number(a.game.rating)
      )
      break

    case 'updated':
      result.sort((a, b) =>
        String(b.updated_at).localeCompare(
          String(a.updated_at)
        )
      )
      break

    default:
      result.sort((a, b) =>
        String(b.created_at).localeCompare(
          String(a.created_at)
        )
      )
  }

  return result
})

/* POWIADOMIENIA */

function showNotification(message, type = 'success') {
  notification.value = message
  notificationType.value = type
}

/* ZMIANA STATUSU */

function changeStatus(entry, status) {
  const success = libraryStore.updateStatus(
    entry.game_id,
    status
  )

  if (success) {
    showNotification(
      `Zmieniono status gry ${entry.game.title}.`
    )
  } else {
    showNotification(
      libraryStore.error,
      'error'
    )
  }
}

/* USUWANIE GRY */

function requestRemove(entry) {
  gameToRemove.value = entry
}

function cancelRemove() {
  gameToRemove.value = null
}

function confirmRemove() {
  if (!gameToRemove.value) {
    return
  }

  const entry = gameToRemove.value

  const success = libraryStore.removeGame(
    entry.game_id
  )

  if (success) {
    showNotification(
      `Usunięto ${entry.game.title} z biblioteki.`
    )
  } else {
    showNotification(
      libraryStore.error,
      'error'
    )
  }

  gameToRemove.value = null
}

/* FORMATOWANIE */

function statusColor(status) {
  return LIBRARY_STATUSES.find(
    item => item.value === status
  )?.color || '#94A3B8'
}

function formatRating(rating) {
  const value = Number(rating)

  return Number.isFinite(value)
    ? value.toFixed(1)
    : '—'
}

function formatDate(date) {
  if (!date) {
    return 'Brak danych'
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return 'Brak danych'
  }

  return parsed.toLocaleDateString('pl-PL')
}

/* RESETOWANIE FILTROW */

function resetFilters() {
  search.value = ''
  activeStatus.value = 'all'
  sort.value = 'newest'
}
</script>

<template>
  <main class="library-page">

    <div class="library-container">

      <!-- NAWIGACJA -->

      <nav class="breadcrumbs"
        aria-label="Ścieżka nawigacji">

        <RouterLink to="/">
          Strona główna
        </RouterLink>

        <span>/</span>

        <span aria-current="page">
          Moja biblioteka
        </span>

      </nav>

      <!-- NAGLOWEK -->

      <section class="library-hero">

        <div>

          <span class="eyebrow">
            TWOJA KOLEKCJA
          </span>

          <h1>Moja <span>biblioteka.</span></h1>

          <p>
            Wszystkie Twoje gry w jednym miejscu.
            Planuj rozgrywkę i śledź swoje postępy.
          </p>

        </div>

        <RouterLink
          to="/games"
          class="primary-button"
        >
          + Odkrywaj gry
        </RouterLink>

      </section>

      <!-- STATYSTYKI -->

      <section
        class="statistics-grid"
        aria-label="Statystyki biblioteki"
      >

        <button
          v-for="stat in statistics"
          :key="stat.value"
          type="button"
          class="stat-card"
          :class="{
            selected: activeStatus === stat.value
          }"
          :aria-pressed="activeStatus === stat.value"
          @click="activeStatus = stat.value"
        >

          <span
            class="stat-icon"
            :style="{ color: stat.color }"
            aria-hidden="true"
          >
            {{ stat.icon }}
          </span>

          <strong :style="{ color: stat.color }">
            {{ stat.count }}
          </strong>

          <span class="stat-label">
            {{ stat.label }}
          </span>

        </button>

      </section>

      <!-- POSTEP -->

      <section class="progress-card">

        <div class="progress-heading">

          <div>

            <h2>Postęp kolekcji</h2>

            <p>
              Ukończono
              {{ libraryStore.completedCount }}
              z {{ libraryStore.totalGames }} gier
            </p>

          </div>

          <strong class="progress-value">
            {{ libraryStore.completionRate }}%
          </strong>

        </div>

        <div
          class="progress-track"
          role="progressbar"
          aria-label="Procent ukończonych gier"
          :aria-valuenow="libraryStore.completionRate"
          :aria-valuemin="0"
          :aria-valuemax="100"
        >

          <div
            class="progress-fill"
            :style="{
              width: `${libraryStore.completionRate}%`
            }"
          ></div>

        </div>

        <p class="progress-description">
          Każda ukończona gra to kolejna
          przygoda w Twojej kolekcji.
        </p>

      </section>

      <!-- POWIADOMIENIA -->

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

      <!-- NAGLOWEK KOLEKCJI -->

      <section class="collection-section">

        <div class="section-heading">

          <div>

            <span class="eyebrow">
              ZARZĄDZAJ KOLEKCJĄ
            </span>

            <h2>Twoje gry</h2>

            <p aria-live="polite">
              Wyświetlono:
              {{ filteredLibrary.length }}
              z {{ libraryStore.totalGames }} gier
            </p>

          </div>

          <div class="view-switch">

            <button
              type="button"
              :class="{ active: viewMode === 'grid' }"
              :aria-pressed="viewMode === 'grid'"
              aria-label="Widok siatki"
              @click="viewMode = 'grid'"
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
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>

            </button>

            <button
              type="button"
              :class="{ active: viewMode === 'list' }"
              :aria-pressed="viewMode === 'list'"
              aria-label="Widok listy"
              @click="viewMode = 'list'"
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
                <path d="M8 5h13M8 12h13M8 19h13"/>
                <path d="M3 5h1M3 12h1M3 19h1"/>
              </svg>

            </button>

          </div>

        </div>

        <!-- WYSZUKIWARKA -->

        <div class="library-toolbar">

          <div class="search-field">

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
              aria-label="Szukaj w bibliotece"
              placeholder="Szukaj w swojej bibliotece..."
            />

          </div>

          <select
            v-model="sort"
            class="sort-select"
            aria-label="Sortowanie biblioteki"
          >
            <option value="newest">
              Ostatnio dodane
            </option>
            <option value="oldest">
              Najdawniej dodane
            </option>
            <option value="updated">
              Ostatnio aktualizowane
            </option>
            <option value="title-asc">
              Nazwa A–Z
            </option>
            <option value="title-desc">
              Nazwa Z–A
            </option>
            <option value="rating">
              Najwyżej oceniane
            </option>
          </select>

        </div>

        <!-- FILTRY STATUSOW -->

        <div class="status-filters">

          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            type="button"
            :class="{
              active: activeStatus === filter.value
            }"
            :aria-pressed="activeStatus === filter.value"
            @click="activeStatus = filter.value"
          >

            {{ filter.label }}

            <span>{{ filter.count }}</span>

          </button>

        </div>

        <!-- ZAPISANE GRY -->

        <div
          v-if="filteredLibrary.length"
          class="library-grid"
          :class="{ 'list-view': viewMode === 'list' }"
        >

          <article
            v-for="entry in filteredLibrary"
            :key="entry.game_id"
            class="library-card"
          >

            <!-- OKLADKA -->

            <RouterLink
              :to="`/games/${entry.game.slug}`"
              class="game-cover"
            >

              <img
                v-if="!failedImages[entry.game_id]"
                :src="entry.game.cover_url"
                :alt="entry.game.title"
                loading="lazy"
                @error="failedImages[entry.game_id] = true"
              />

              <div
                v-else
                class="cover-placeholder"
              >
                GAMEVERS
              </div>

              <span class="game-rating">
                ★ {{ formatRating(entry.game.rating) }}
              </span>

            </RouterLink>

            <!-- INFORMACJE -->

            <div class="game-content">

              <span
                class="status-label"
                :style="{ color: statusColor(entry.status) }"
              >

                <span class="status-dot"></span>

                {{ libraryStore.getStatusLabel(entry.status) }}

              </span>

              <RouterLink
                :to="`/games/${entry.game.slug}`"
                class="game-title"
              >
                {{ entry.game.title }}
              </RouterLink>

              <p class="game-genres">
                {{ entry.game.genres.join(' · ') }}
              </p>

              <p class="game-date">
                Dodano: {{ formatDate(entry.created_at) }}
              </p>

              <!-- ZMIANA STATUSU -->

              <div class="game-controls">

                <select
                  :value="entry.status"
                  :aria-label="`Status gry ${entry.game.title}`"
                  @change="changeStatus(entry, $event.target.value); $event.target.value = libraryStore.getStatus(entry.game_id)"
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
                  class="remove-button"
                  :aria-label="`Usuń ${entry.game.title}`"
                  @click="requestRemove(entry)"
                >

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M9 6V3h6v3"/>
                    <path d="m5 6 1 15h12l1-15"/>
                    <path d="M10 10v7m4-7v7"/>
                  </svg>

                </button>

              </div>

            </div>

          </article>

        </div>

        <!-- PUSTA BIBLIOTEKA -->

        <div
          v-else-if="!libraryStore.totalGames"
          class="empty-state"
        >

          <div class="empty-icon">

            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path d="M4 5h4v15H4zM10 5h4v15h-4z"/>
              <path d="m16 6 4-1 3 14-4 1z"/>
            </svg>

          </div>

          <h2>Twoja kolekcja zaczyna się tutaj</h2>

          <p>
            Nie masz jeszcze zapisanych gier.
            Odkryj katalog i dodaj swoje
            ulubione tytuły do biblioteki.
          </p>

          <RouterLink
            to="/games"
            class="primary-button"
          >
            Przeglądaj katalog →
          </RouterLink>

        </div>

        <!-- BRAK WYNIKOW -->

        <div
          v-else
          class="empty-state"
        >

          <div class="empty-icon">⌕</div>

          <h2>Nie znaleziono gier</h2>

          <p>
            Żadna zapisana gra nie pasuje
            do aktualnych filtrów.
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

      <p class="demo-notice">
        Biblioteka demonstracyjna Gamevers.
        Dane są zapisywane lokalnie w tej przeglądarce,
        niezależnie od konta użytkownika.
      </p>

    </div>

    <!-- POTWIERDZENIE USUNIECIA -->

    <Teleport to="body">

      <div
        v-if="gameToRemove"
        class="modal-backdrop"
        @click.self="cancelRemove"
        @keydown.esc="cancelRemove"
      >

        <section
          class="confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-title"
        >

          <div class="modal-icon">

            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              aria-hidden="true"
            >
              <path d="M3 6h18M9 6V3h6v3"/>
              <path d="m5 6 1 15h12l1-15"/>
              <path d="M10 10v7m4-7v7"/>
            </svg>

          </div>

          <h2 id="remove-title">
            Usunąć grę?
          </h2>

          <p>
            Czy na pewno chcesz usunąć
            <strong>{{ gameToRemove.game.title }}</strong>
            ze swojej biblioteki?
          </p>

          <div class="modal-actions">

            <button
              type="button"
              class="cancel-button"
              @click="cancelRemove"
            >
              Anuluj
            </button>

            <button
              type="button"
              class="danger-button"
              @click="confirmRemove"
            >
              Usuń grę
            </button>

          </div>

        </section>

      </div>

    </Teleport>

  </main>
</template>

<style scoped>

/* GLOWNY UKLAD */

.library-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 24px 50px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.library-container {
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

/* NAGLOWEK */

.library-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  min-height: 220px;
  margin-bottom: 24px;
  padding: 35px;
  background:
    radial-gradient(
      ellipse at 90% 10%,
      rgba(139,92,246,.23),
      transparent 60%
    ),
    linear-gradient(
      135deg,
      #151B2B,
      #201B36
    );
  border: 1px solid #44306B;
  border-radius: 15px;
}

.eyebrow {
  display: block;
  margin-bottom: 12px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.library-hero h1 {
  margin: 0 0 15px;
  color: #F8FAFC;
  font-size: clamp(30px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.library-hero h1 span {
  color: #A78BFA;
}

.library-hero p {
  max-width: 500px;
  margin: 0;
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.8;
}

/* PRZYCISKI */

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 44px;
  padding: 12px 20px;
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.primary-button:hover {
  background: #7C3AED;
}

/* STATYSTYKI */

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 22px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  padding: 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color .2s,
    background .2s;
}

.stat-card:hover,
.stat-card.selected {
  background: #201B36;
  border-color: #8B5CF6;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 9px;
  font-size: 24px;
  font-weight: 700;
}

.stat-card strong {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.stat-label {
  color: #94A3B8;
  font-size: 12px;
}

/* POSTEP */

.progress-card {
  margin-bottom: 32px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
}

.progress-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.progress-heading h2 {
  margin: 0 0 8px;
  color: #F8FAFC;
  font-size: 18px;
}

.progress-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
}

.progress-value {
  color: #4ADE80;
  font-size: 28px;
  font-weight: 800;
}

.progress-track {
  height: 9px;
  overflow: hidden;
  background: #293244;
  border-radius: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    #16A34A,
    #4ADE80
  );
  border-radius: 20px;
  transition: width .4s ease;
}

.progress-description {
  margin: 14px 0 0;
  color: #94A3B8;
  font-size: 11px;
}

/* POWIADOMIENIA */

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
  padding: 14px 18px;
  border: 1px solid;
  border-radius: 9px;
  font-size: 13px;
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
  background: transparent;
  border: none;
  color: inherit;
  font-size: 22px;
  cursor: pointer;
}

/* NAGLOWEK KOLEKCJI */

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 0 0 8px;
  color: #F8FAFC;
  font-size: 25px;
}

.section-heading p {
  margin: 0;
  color: #94A3B8;
  font-size: 12px;
}

.view-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
}

.view-switch button {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 5px;
  color: #94A3B8;
  cursor: pointer;
}

.view-switch button.active {
  background: #31234F;
  color: #C4B5FD;
}

/* WYSZUKIWARKA */

.library-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.search-field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 47px;
  padding: 0 15px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #94A3B8;
}

.search-field svg {
  flex-shrink: 0;
}

.search-field:focus-within {
  border-color: #8B5CF6;
}

.search-field input {
  width: 100%;
  min-width: 0;
  padding: 13px 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 13px;
}

.search-field input::placeholder {
  color: #64748B;
}

.sort-select {
  min-width: 180px;
  padding: 10px 14px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #CBD5E1;
  font-size: 12px;
  cursor: pointer;
}

/* FILTRY */

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 24px;
}

.status-filters button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 8px 12px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 7px;
  color: #94A3B8;
  font-size: 12px;
  cursor: pointer;
}

.status-filters button.active {
  background: #31234F;
  border-color: #8B5CF6;
  color: #C4B5FD;
}

.status-filters button span {
  min-width: 18px;
  padding: 2px 5px;
  background: #293244;
  border-radius: 4px;
  color: #CBD5E1;
  font-size: 10px;
  text-align: center;
}

/* SIATKA GIER */

.library-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 18px;
}

.library-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 12px;
  transition:
    border-color .2s,
    transform .2s;
}

.library-card:hover {
  border-color: #8B5CF6;
}

/* OKLADKA */

.game-cover {
  position: relative;
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
  transition: transform .3s;
}

.game-cover:hover img {
  transform: scale(1.04);
}

.cover-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #C4B5FD;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
}

.game-rating {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 8px;
  background: rgba(11,15,25,.9);
  border: 1px solid #123443;
  border-radius: 5px;
  color: #67E8F9;
  font-size: 11px;
  font-weight: 700;
}

/* ZAWARTOSC KARTY */

.game-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 16px;
}

.status-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
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

.game-genres {
  margin: 8px 0;
  color: #94A3B8;
  font-size: 11px;
  line-height: 1.6;
}

.game-date {
  margin: 0 0 18px;
  color: #94A3B8;
  font-size: 10px;
}

/* ZARZADZANIE GRA */

.game-controls {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #293244;
}

.game-controls select {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 36px;
  padding: 7px 8px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 6px;
  color: #CBD5E1;
  font-size: 11px;
  cursor: pointer;
}

.remove-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 6px;
  color: #94A3B8;
  cursor: pointer;
}

.remove-button:hover {
  background: #3D222B;
  border-color: #991B1B;
  color: #F87171;
}

/* WIDOK LISTY */

.library-grid.list-view {
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.list-view .library-card {
  flex-direction: row;
}

.list-view .game-cover {
  flex-shrink: 0;
  width: 230px;
  min-height: 150px;
  aspect-ratio: auto;
}

.list-view .game-content {
  padding: 18px;
}

.list-view .game-title {
  min-height: 0;
  font-size: 18px;
}

.list-view .game-controls {
  max-width: 320px;
}

/* PUSTA BIBLIOTEKA */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  padding: 35px 20px;
  background: #151B2B;
  border: 1px dashed #44306B;
  border-radius: 12px;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  margin-bottom: 22px;
  background: #31234F;
  border: 1px solid #44306B;
  border-radius: 20px;
  color: #C4B5FD;
  font-size: 40px;
}

.empty-state h2 {
  margin: 0 0 12px;
  color: #F8FAFC;
  font-size: 21px;
}

.empty-state p {
  max-width: 380px;
  margin: 0 0 24px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.8;
}

.demo-notice {
  margin: 28px 0 0;
  color: #94A3B8;
  font-size: 11px;
  text-align: center;
  line-height: 1.7;
}

/* OKNO POTWIERDZENIA */

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(5px);
}

.confirm-modal {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 15px;
  color: #F8FAFC;
  text-align: left;
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
}

.modal-icon {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  margin-bottom: 20px;
  background: #3D222B;
  border-radius: 12px;
  color: #F87171;
}

.confirm-modal h2 {
  margin: 0 0 12px;
  color: #F8FAFC;
  font-size: 22px;
}

.confirm-modal p {
  margin: 0 0 25px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.8;
}

.confirm-modal p strong {
  color: #F8FAFC;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cancel-button,
.danger-button {
  min-height: 44px;
  padding: 10px;
  border-radius: 8px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-button {
  background: #111827;
  border: 1px solid #293244;
}

.danger-button {
  background: #DC2626;
  border: 1px solid #DC2626;
}

.danger-button:hover {
  background: #B91C1C;
}

/* DOSTEPNOSC */

button:focus-visible,
a:focus-visible,
select:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 3px;
}

/* MNIEJSZE EKRANY */

@media (max-width: 1150px) {

  .library-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .statistics-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 16px;
  }

}

/* TABLETY */

@media (max-width: 850px) {

  .library-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .statistics-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

  .library-hero {
    padding: 25px;
  }

}

/* TELEFONY */

@media (max-width: 600px) {

  .library-page {
    padding: 14px 14px 35px;
  }

  .breadcrumbs {
    margin-bottom: 14px;
    font-size: 11px;
  }

  .library-hero {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    min-height: 0;
    margin-bottom: 18px;
    padding: 23px;
    border-radius: 12px;
  }

  .library-hero h1 {
    font-size: 31px;
  }

  .library-hero p {
    font-size: 12px;
  }

  .library-hero .primary-button {
    width: 100%;
  }

  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card:first-child {
    grid-column: 1 / -1;
  }

  .stat-card {
    gap: 8px;
    padding: 15px;
  }

  .stat-card strong {
    font-size: 25px;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }

  .progress-card {
    margin-bottom: 25px;
    padding: 18px;
  }

  .progress-heading h2 {
    font-size: 16px;
  }

  .progress-value {
    font-size: 24px;
  }

  .section-heading h2 {
    font-size: 21px;
  }

  .library-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .search-field {
    min-height: 46px;
  }

  .search-field input {
    font-size: 16px;
  }

  .search-field input::placeholder {
    font-size: 12px;
  }

  .sort-select {
    width: 100%;
    min-height: 42px;
  }

  .status-filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 7px;
    scrollbar-width: thin;
  }

  .status-filters button {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 11px;
  }

  .library-grid {
    gap: 11px;
  }

  .library-card {
    border-radius: 9px;
  }

  .game-content {
    padding: 11px;
  }

  .game-title {
    min-height: 36px;
    font-size: 14px;
  }

  .status-label {
    margin-bottom: 9px;
    font-size: 10px;
  }

  .game-genres {
    font-size: 10px;
  }

  .game-date {
    font-size: 9px;
  }

  .game-controls {
    gap: 5px;
    padding-top: 10px;
  }

  .game-controls select {
    padding: 6px 4px;
    font-size: 10px;
  }

  .remove-button {
    width: 31px;
  }

  .game-rating {
    top: 7px;
    left: 7px;
    font-size: 10px;
  }

  .list-view .game-cover {
    width: 34%;
    min-height: 140px;
  }

  .list-view .game-content {
    padding: 12px;
  }

  .list-view .game-title {
    font-size: 14px;
  }

  .empty-state {
    min-height: 300px;
  }

  .empty-state h2 {
    font-size: 19px;
  }

  .confirm-modal {
    padding: 22px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .library-page {
    padding-right: 10px;
    padding-left: 10px;
  }

  .library-grid {
    grid-template-columns: minmax(0, 1fr);
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .stat-card,
  .library-card,
  .game-cover img,
  .progress-fill {
    transition: none;
  }

  .game-cover:hover img {
    transform: none;
  }

}

</style>
