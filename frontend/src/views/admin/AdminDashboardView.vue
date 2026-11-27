
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

import {
  getAdminGameStats
} from '../../services/adminGameService'

import {
  getAdminReviewStats
} from '../../services/adminReviewService'

import {
  getAdminCategoryStats
} from '../../services/adminCategoryService'

// UZYTKOWNIK

import {
  getAdminUserStats
} from '../../services/adminUserService'

const authStore = useAuthStore()

const adminName = computed(() => {
  return authStore.user?.name || 'Administrator'
})

// STAN APLIKACJI

const gamesCount = ref(null)
const activeGamesCount = ref(null)
const reviewsCount = ref(null)
const categoriesCount = ref(null)
const usersCount = ref(null)

const loading = ref(false)
const apiStatus = ref('checking')
const error = ref('')

// STATYSTYKI

const stats = computed(() => [
  {
    label: 'Wszystkie gry',
    value: gamesCount.value,
    icon: '🎮'
  },
  {
    label: 'Aktywne gry',
    value: activeGamesCount.value,
    icon: '🕹️'
  },
  {
    label: 'Kategorie',
    value: categoriesCount.value,
    icon: '📁'
  },
  {
    label: 'Recenzje',
    value: reviewsCount.value,
    icon: '⭐'
  },
  {
    label: 'Użytkownicy',
    value: usersCount.value,
    icon: '👥'
  }
])

// SZYBKIE DZIALANIA

const actions = [
  {
    path: '/admin/games',
    icon: '🎮',
    title: 'Zarządzaj grami',
    description:
      'Dodawaj, edytuj i zmieniaj widoczność gier.'
  },
  {
    path: '/admin/reviews',
    icon: '⭐',
    title: 'Moderuj recenzje',
    description:
      'Przeglądaj opinie graczy i moderuj treści.'
  },
  {
    path: '/admin/categories',
    icon: '📁',
    title: 'Zarządzaj kategoriami',
    description:
      'Dodawaj, edytuj i organizuj kategorie gier.'
  },
  {
    path: '/admin/users',
    icon: '👥',
    title: 'Zarządzaj użytkownikami',
    description:
      'Przeglądaj konta i zarządzaj uprawnieniami.'
  },
  {
    path: '/admin/analytics',
    icon: '📊',
    title: 'Statystyki portalu',
    description:
      'Analizuj aktywnosc graczy, oceny i popularnosc gier.'
  },
  {
    path: '/games',
    icon: '🔍',
    title: 'Przeglądaj katalog',
    description:
      'Zobacz portal z perspektywy użytkownika.'
  },
  {
    path: '/profile',
    icon: '👤',
    title: 'Mój profil',
    description:
      'Przejdź do informacji o swoim koncie.'
  }
]

// SPRAWDZANIE DANYCH

function readCount(payload, key) {
  const value = payload?.[key]

  if (
    typeof value !== 'number' &&
    typeof value !== 'string'
  ) {
    throw new Error('Brak statystyki: ' + key)
  }

  const number = Number(value)

  if (
    value === '' ||
    !Number.isInteger(number) ||
    number < 0
  ) {
    throw new Error('Nieprawidłowa statystyka: ' + key)
  }

  return number
}

// POBIERANIE STATYSTYK

async function loadGameStats() {
  const data = await getAdminGameStats()

  const total = readCount(data, 'total_games')
  const active = readCount(data, 'active_games')

  gamesCount.value = total
  activeGamesCount.value = active
}

async function loadReviewStats() {
  const data = await getAdminReviewStats()

  reviewsCount.value = readCount(
    data,
    'total_reviews'
  )
}

async function loadCategoryStats() {
  const data = await getAdminCategoryStats()

  categoriesCount.value = readCount(
    data,
    'total_categories'
  )
}

// POBIERANIE DANYCH PANELU

async function loadUserStats() {
  const data = await getAdminUserStats()

  usersCount.value = readCount(
    data,
    'total_users'
  )
}

async function loadDashboard() {
  if (loading.value) return

  loading.value = true
  apiStatus.value = 'checking'
  error.value = ''

  gamesCount.value = null
  activeGamesCount.value = null
  reviewsCount.value = null
  categoriesCount.value = null
  usersCount.value = null

  try {
    const results = await Promise.allSettled([
      loadGameStats(),
      loadReviewStats(),
      loadCategoryStats(),
      loadUserStats()
    ])

    const successful = results.filter(
      result => result.status === 'fulfilled'
    ).length

    if (successful === results.length) {
      apiStatus.value = 'connected'
    } else if (successful > 0) {
      apiStatus.value = 'partial'

      error.value =
        'Nie udało się pobrać wszystkich statystyk.'
    } else {
      apiStatus.value = 'offline'

      error.value =
        'Nie udało się pobrać danych z API.'
    }

    const unauthorized = results.some(
      result =>
        result.status === 'rejected' &&
        result.reason?.response?.status === 401
    )

    const forbidden = results.some(
      result =>
        result.status === 'rejected' &&
        result.reason?.response?.status === 403
    )

    if (unauthorized) {
      error.value =
        'Sesja wygasła. Zaloguj się ponownie.'
    } else if (forbidden) {
      error.value =
        'Brak uprawnień administratora.'
    }
  } finally {
    loading.value = false
  }
}

// FORMATOWANIE STATYSTYK

function formatStat(value) {
  return value === null ? '—' : value
}

// URUCHOMIENIE WIDOKU

onMounted(loadDashboard)
</script>

<template>
  <main class="admin-page">
    <div class="admin-container">

      <!-- NAGLOWEK -->

      <header class="admin-heading">
        <div>
          <span class="eyebrow">
            GAMEVERS ADMIN
          </span>

          <h1>Panel administratora</h1>

          <p>
            Witaj, {{ adminName }}!
            Zarządzaj zawartością portalu Gamevers.
          </p>
        </div>

        <span
          class="admin-symbol"
          aria-hidden="true"
        >
          🛡️
        </span>
      </header>

      <!-- STATYSTYKI -->

      <section class="dashboard-section">
        <div class="section-heading">
          <h2>Statystyki portalu</h2>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="loadDashboard"
          >
            {{
              loading
                ? 'Odświeżanie...'
                : 'Odśwież dane'
            }}
          </button>
        </div>

        <div class="stats-grid">

          <article
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
          >
            <span
              class="stat-icon"
              aria-hidden="true"
            >
              {{ stat.icon }}
            </span>

            <span class="stat-label">
              {{ stat.label }}
            </span>

            <strong class="stat-value">
              {{
                loading
                  ? '...'
                  : formatStat(stat.value)
              }}
            </strong>
          </article>

          <!-- STATUS API -->

          <article class="stat-card">
            <span
              class="stat-icon"
              aria-hidden="true"
            >
              🌐
            </span>

            <span class="stat-label">
              Status API
            </span>

            <strong
              class="api-status"
              :class="apiStatus"
            >
              <template
                v-if="apiStatus === 'checking'"
              >
                Sprawdzanie...
              </template>

              <template
                v-else-if="apiStatus === 'connected'"
              >
                Odpowiada
              </template>

              <template
                v-else-if="apiStatus === 'partial'"
              >
                Częściowy dostęp
              </template>

              <template v-else>
                Błąd pobierania
              </template>
            </strong>
          </article>

        </div>

        <p
          v-if="error"
          class="error-message"
          role="alert"
        >
          {{ error }}
        </p>

        <p class="stats-note">
          Statystyki są pobierane bezpośrednio
          z backendu Laravel. Symbol „—”
          oznacza brak dostępnych danych.
        </p>
      </section>

      <!-- SZYBKIE DZIALANIA -->

      <section class="dashboard-section">
        <h2>Szybkie działania</h2>

        <div class="actions-grid">

          <RouterLink
            v-for="action in actions"
            :key="action.path"
            :to="action.path"
            class="action-card"
          >
            <span
              class="action-icon"
              aria-hidden="true"
            >
              {{ action.icon }}
            </span>

            <div class="action-content">
              <h3>{{ action.title }}</h3>

              <p>
                {{ action.description }}
              </p>
            </div>

            <span
              class="action-arrow"
              aria-hidden="true"
            >
              →
            </span>
          </RouterLink>

        </div>
      </section>

      <!-- INFORMACJE -->

      <section class="info-panel">
        <h2>Informacje administracyjne</h2>

        <p>
          Panel administratora służy do
          zarządzania treściami Gamevers.
        </p>

        <p>
          Funkcje administracyjne są
          zabezpieczone przez mechanizmy
          uwierzytelniania i kontroli
          uprawnień Laravel.
        </p>
      </section>

    </div>
  </main>
</template>

<style scoped>
.admin-page {
  min-height: 80vh;
  padding: 60px 20px 90px;
  color: #F8FAFC;
}

.admin-page * {
  box-sizing: border-box;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 44px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.admin-heading h1 {
  margin: 12px 0;
  font-size: 36px;
}

.admin-heading p {
  color: #94A3B8;
  line-height: 1.7;
}

.admin-symbol {
  font-size: 56px;
}

.dashboard-section {
  margin-bottom: 42px;
}

.dashboard-section h2,
.info-panel h2 {
  margin: 0 0 22px;
  font-size: 23px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 0;
}

.refresh-button {
  padding: 10px 17px;
  border: 1px solid #334155;
  border-radius: 9px;
  background: #151B2B;
  color: #C4B5FD;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #29213F;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 24px;
  border: 1px solid #273044;
  border-radius: 16px;
  background: #151B2B;
}

.stat-icon {
  font-size: 28px;
}

.stat-label {
  color: #94A3B8;
  font-size: 14px;
}

.stat-value {
  color: #F8FAFC;
  font-size: 34px;
  font-weight: 800;
}

.api-status {
  font-size: 20px;
  overflow-wrap: anywhere;
}

.api-status.checking {
  color: #94A3B8;
}

.api-status.connected {
  color: #34D399;
}

.api-status.partial {
  color: #FBBF24;
}

.api-status.offline {
  color: #F87171;
}

.stats-note {
  margin-top: 16px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.error-message {
  padding: 15px;
  margin-top: 18px;
  border: 1px solid #EF444455;
  border-radius: 10px;
  background: #EF444412;
  color: #FCA5A5;
  font-size: 14px;
}

.actions-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  padding: 24px;
  border: 1px solid #273044;
  border-radius: 16px;
  background: #151B2B;
  color: #F8FAFC;
  text-decoration: none;
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.2s;
}

.action-card:hover {
  transform: translateY(-3px);
  border-color: #8B5CF6;
  background: #1D2236;
}

.action-card:focus-visible,
.refresh-button:focus-visible {
  outline: 2px solid #A78BFA;
  outline-offset: 3px;
}

.action-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 13px;
  background: #8B5CF61A;
  font-size: 28px;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.action-content p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.action-arrow {
  color: #A78BFA;
  font-size: 23px;
}

.info-panel {
  padding: 26px;
  border: 1px solid #273044;
  border-radius: 16px;
  background: #111827;
}

.info-panel p {
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 800px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .admin-heading h1 {
    font-size: 30px;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 30px 14px 60px;
  }

  .admin-heading {
    margin-bottom: 28px;
  }

  .admin-heading h1 {
    font-size: 25px;
  }

  .admin-heading p {
    font-size: 13px;
  }

  .admin-symbol {
    font-size: 35px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 16px;
    gap: 9px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 27px;
  }

  .api-status {
    font-size: 15px;
  }

  .section-heading h2 {
    font-size: 18px;
  }

  .refresh-button {
    font-size: 11px;
    padding: 9px;
  }

  .action-card {
    padding: 16px;
    gap: 12px;
  }

  .action-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .action-content h3 {
    font-size: 15px;
  }

  .action-content p {
    font-size: 12px;
  }
}
</style>
