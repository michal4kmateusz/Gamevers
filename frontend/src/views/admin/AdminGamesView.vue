
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import * as gamesService from '../../services/gamesService'
import * as reviewsService from '../../services/reviewsService'

const authStore = useAuthStore()

const gamesCount = ref(null)
const reviewsCount = ref(null)
const usersCount = ref(null)

const loading = ref(false)
const apiStatus = ref('checking')
const error = ref('')

const adminName = computed(() => {
  return authStore.user?.name || 'Administrator'
})

const stats = computed(() => [
  {
    label: 'Gry w katalogu',
    value: gamesCount.value,
    icon: '🎮'
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

function extractCollection(response) {
  const payload = response.data

  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      complete: true
    }
  }

  if (Array.isArray(payload?.data)) {
    const total = Number(payload.meta?.total)

    if (Number.isFinite(total)) {
      return {
        count: total,
        complete: true
      }
    }

    // Bez informacji o całkowitej liczbie
    // nie zgadujemy wyniku paginacji.
    return {
      count: null,
      complete: false
    }
  }

  return {
    count: null,
    complete: false
  }
}

async function loadDashboard() {
  loading.value = true
  apiStatus.value = 'checking'
  error.value = ''

  gamesCount.value = null
  reviewsCount.value = null
  usersCount.value = null

  const results = await Promise.allSettled([
    gamesService.getGames(),
    reviewsService.getAdminReviews()
  ])

  const gamesResult = results[0]
  const reviewsResult = results[1]

  if (gamesResult.status === 'fulfilled') {
    const collection = extractCollection(
      gamesResult.value
    )

    gamesCount.value = collection.count
  }

  if (reviewsResult.status === 'fulfilled') {
    const collection = extractCollection(
      reviewsResult.value
    )

    reviewsCount.value = collection.count
  }

  // Nie mamy jeszcze endpointu statystyk
  // użytkowników, więc pozostaje brak danych.
  usersCount.value = null

  const allSuccessful = results.every(
    (result) => result.status === 'fulfilled'
  )

  const anySuccessful = results.some(
    (result) => result.status === 'fulfilled'
  )

  if (allSuccessful) {
    apiStatus.value = 'connected'
  } else if (anySuccessful) {
    apiStatus.value = 'partial'
    error.value =
      'Nie udało się pobrać wszystkich danych.'
  } else {
    apiStatus.value = 'offline'
    error.value =
      'Nie udało się połączyć z API.'
  }

  loading.value = false
}

function formatStat(value) {
  return value === null ? '—' : value
}

onMounted(loadDashboard)
</script>

<template>
  <main class="admin-page">
    <div class="admin-container">

      <!-- Nagłówek -->
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

        <span class="admin-symbol" aria-hidden="true">
          🛡️
        </span>
      </header>

      <!-- Statystyki -->
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
            <span class="stat-icon" aria-hidden="true">
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

          <article class="stat-card">
            <span class="stat-icon" aria-hidden="true">
              🌐
            </span>

            <span class="stat-label">
              Status API
            </span>

            <strong
              class="api-status"
              :class="apiStatus"
            >
              <template v-if="apiStatus === 'checking'">
                Sprawdzanie...
              </template>

              <template v-else-if="apiStatus === 'connected'">
                Odpowiada
              </template>

              <template v-else-if="apiStatus === 'partial'">
                Częściowy dostęp
              </template>

              <template v-else>
                Brak połączenia
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
          Statystyki są pobierane z dostępnych
          endpointów. Brak danych oznaczamy
          symbolem „—”.
        </p>
      </section>

      <!-- Szybkie działania -->
      <section class="dashboard-section">
        <h2>Szybkie działania</h2>

        <div class="actions-grid">

          <RouterLink
            to="/admin/games"
            class="action-card"
          >
            <span
              class="action-icon"
              aria-hidden="true"
            >
              🎮
            </span>

            <div class="action-content">
              <h3>Zarządzaj grami</h3>

              <p>
                Dodawaj, edytuj i usuwaj gry
                dostępne w katalogu.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            to="/admin/reviews"
            class="action-card"
          >
            <span
              class="action-icon"
              aria-hidden="true"
            >
              ⭐
            </span>

            <div class="action-content">
              <h3>Moderuj recenzje</h3>

              <p>
                Przeglądaj opinie graczy
                i usuwaj niewłaściwe treści.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            to="/games"
            class="action-card"
          >
            <span
              class="action-icon"
              aria-hidden="true"
            >
              🔍
            </span>

            <div class="action-content">
              <h3>Przeglądaj katalog</h3>

              <p>
                Zobacz portal z perspektywy
                zwykłego użytkownika.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            to="/profile"
            class="action-card"
          >
            <span
              class="action-icon"
              aria-hidden="true"
            >
              👤
            </span>

            <div class="action-content">
              <h3>Mój profil</h3>

              <p>
                Przejdź do informacji
                o swoim koncie.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

        </div>
      </section>

      <!-- Informacje -->
      <section class="info-panel">
        <h2>Informacje administracyjne</h2>

        <p>
          Panel administratora jest przeznaczony
          do zarządzania treściami Gamevers.
        </p>

        <p>
          Dostęp do funkcji administracyjnych
          musi być dodatkowo kontrolowany
          przez backend Laravel.
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
  margin: 0 0 20px;
  font-size: 23px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
}

.refresh-button {
  padding: 11px 16px;
  background: #24203C;
  border: 1px solid #443B73;
  border-radius: 9px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.stat-icon {
  font-size: 27px;
}

.stat-label {
  color: #94A3B8;
  font-size: 13px;
}

.stat-value {
  font-size: 30px;
  line-height: 1.2;
}

.api-status {
  font-size: 15px;
  line-height: 1.5;
}

.api-status.connected {
  color: #6EE7B7;
}

.api-status.partial {
  color: #FBBF24;
}

.api-status.offline {
  color: #FCA5A5;
}

.api-status.checking {
  color: #94A3B8;
}

.error-message {
  margin-top: 18px;
  padding: 14px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 9px;
  color: #FCA5A5;
  font-size: 13px;
}

.stats-note {
  margin-top: 16px;
  color: #94A3B8;
  font-size: 12px;
  line-height: 1.6;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 25px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  color: #F8FAFC;
  text-decoration: none;
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.action-card:hover {
  border-color: #8B5CF6;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 28px;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h3 {
  margin: 0 0 9px;
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
  font-size: 22px;
}

.info-panel {
  padding: 26px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.info-panel p {
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.7;
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .admin-page {
    padding: 40px 16px 70px;
  }

  .admin-heading h1 {
    font-size: 29px;
  }

  .admin-symbol {
    font-size: 38px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .action-card {
    padding: 20px;
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
