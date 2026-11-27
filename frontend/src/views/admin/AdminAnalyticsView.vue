<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { RouterLink } from 'vue-router'

import {
  getAnalyticsOverview,
  getAnalyticsActivity,
  getPopularGames,
  getLibraryStatuses,
  getPopularCategories,
  getRatingDistribution
} from '../../services/adminAnalyticsService'

const overview = ref({})
const activity = ref([])
const popularGames = ref([])
const categories = ref([])
const statuses = ref([])
const ratings = ref([])

const days = ref(7)
const loading = ref(false)
const activityLoading = ref(false)
const error = ref('')
const activityError = ref('')
const failedSections = ref([])

let activityVersion = 0
let pageVersion = 0

const colors = [
  '#8B5CF6',
  '#22D3EE',
  '#34D399',
  '#64748B'
]

const statCards = computed(() => [
  { label: 'Użytkownicy', value: overview.value.total_users, icon: '👥' },
  { label: 'Wszystkie gry', value: overview.value.total_games, icon: '🎮' },
  { label: 'Aktywne gry', value: overview.value.active_games, icon: '🕹️' },
  { label: 'Kategorie', value: overview.value.total_categories, icon: '📁' },
  { label: 'Recenzje', value: overview.value.total_reviews, icon: '⭐' },
  { label: 'Wpisy w bibliotekach', value: overview.value.total_favorites, icon: '📚' },
  { label: 'Średnia ocen / 10', value: overview.value.average_rating, icon: '🏆' },
  { label: 'Nowe konta dzisiaj', value: overview.value.today_users, icon: '📈' },
  { label: 'Recenzje dzisiaj', value: overview.value.today_reviews, icon: '💬' }
])

const activityMax = computed(() => Math.max(
  1,
  ...activity.value.flatMap(item => [
    Number(item.users) || 0,
    Number(item.reviews) || 0,
    Number(item.favorites) || 0
  ])
))

const gamesMax = computed(() => Math.max(
  1,
  ...popularGames.value.map(game => Number(game.favorites_count) || 0)
))

const categoriesMax = computed(() => Math.max(
  1,
  ...categories.value.map(category => Number(category.active_games_count) || 0)
))

const ratingsMax = computed(() => Math.max(
  1,
  ...ratings.value.map(item => Number(item.count) || 0)
))

const libraryTotal = computed(() =>
  statuses.value.reduce((sum, item) => sum + Number(item.count || 0), 0)
)

const donutStyle = computed(() => {
  if (!libraryTotal.value) {
    return { background: '#273044' }
  }

  let offset = 0

  const segments = statuses.value.map((item, index) => {
    const start = offset
    offset += Number(item.count) / libraryTotal.value * 100
    return `${colors[index % colors.length]} ${start}% ${offset}%`
  })

  return {
    background: `conic-gradient(${segments.join(', ')})`
  }
})

function percentage(value, max) {
  return `${Math.max(0, Math.min(100, Number(value || 0) / max * 100))}%`
}

function formatDate(value) {
  if (!value) return '—'
  return value.slice(8, 10) + '.' + value.slice(5, 7)
}

function requireArray(value) {
  if (!Array.isArray(value)) {
    throw new Error('Nieprawidłowa odpowiedź API')
  }
  return value
}

function requireObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Nieprawidłowa odpowiedź API')
  }
  return value
}

async function loadActivity() {
  const version = ++activityVersion

  activityLoading.value = true
  activityError.value = ''
  activity.value = []

  try {
    const data = await getAnalyticsActivity(days.value)

    if (version !== activityVersion) return

    activity.value = requireArray(data.activity)
  } catch (err) {
    if (version !== activityVersion) return

    activityError.value = 'Nie udało się pobrać aktywności.'
  } finally {
    if (version === activityVersion) {
      activityLoading.value = false
    }
  }
}

async function loadDashboard() {
  if (loading.value) return

  const version = ++pageVersion

  loading.value = true
  error.value = ''
  failedSections.value = []

  overview.value = {}
  popularGames.value = []
  categories.value = []
  statuses.value = []
  ratings.value = []

  const requests = [
    {
      name: 'Podsumowanie',
      run: async () => requireObject(await getAnalyticsOverview()),
      assign: data => overview.value = data
    },
    {
      name: 'Popularne gry',
      run: async () => requireArray(await getPopularGames()),
      assign: data => popularGames.value = data
    },
    {
      name: 'Kategorie',
      run: async () => requireArray(await getPopularCategories()),
      assign: data => categories.value = data
    },
    {
      name: 'Biblioteki',
      run: async () => requireArray((await getLibraryStatuses()).statuses),
      assign: data => statuses.value = data
    },
    {
      name: 'Oceny',
      run: async () => requireArray((await getRatingDistribution()).ratings),
      assign: data => ratings.value = data
    }
  ]

  try {
    const results = await Promise.allSettled([
      ...requests.map(request => request.run()),
      loadActivity()
    ])

    if (version !== pageVersion) return

    requests.forEach((request, index) => {
      const result = results[index]

      if (result.status === 'fulfilled') {
        request.assign(result.value)
      } else {
        failedSections.value.push(request.name)
      }
    })

    if (failedSections.value.length) {
      error.value = 'Nie udało się pobrać wszystkich statystyk.'
    }

    const denied = results.some(result =>
      result.status === 'rejected' &&
      [401, 403].includes(result.reason?.response?.status)
    )

    if (denied) {
      error.value = 'Brak dostępu. Sprawdź sesję i uprawnienia.'
    }
  } finally {
    if (version === pageVersion) {
      loading.value = false
    }
  }
}

onMounted(loadDashboard)

onBeforeUnmount(() => {
  activityVersion++
  pageVersion++
})
</script>

<template>
  <main class="analytics-page">
    <div class="container">

      <RouterLink to="/admin" class="back">
        ← Panel administratora
      </RouterLink>

      <header class="heading">
        <div>
          <span class="eyebrow">GAMEVERS ANALYTICS</span>
          <h1>Statystyki portalu</h1>
          <p>Analizuj rozwój i aktywność społeczności Gamevers.</p>
        </div>

        <button
          type="button"
          :disabled="loading"
          @click="loadDashboard"
        >
          {{ loading ? 'Pobieranie...' : 'Odśwież dane' }}
        </button>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
        {{ failedSections.join(', ') }}
      </p>

      <section class="stats-grid">
        <article
          v-for="stat in statCards"
          :key="stat.label"
          class="stat-card"
        >
          <span class="stat-icon">{{ stat.icon }}</span>
          <span class="muted">{{ stat.label }}</span>
          <strong>{{ loading ? '...' : stat.value ?? '—' }}</strong>
        </article>
      </section>

      <!-- AKTYWNOSC -->

      <section class="panel">
        <div class="panel-heading">
          <h2>Aktywność portalu</h2>

          <select
            v-model.number="days"
            :disabled="loading"
            aria-label="Zakres dat"
            @change="loadActivity"
          >
            <option :value="7">7 dni</option>
            <option :value="14">14 dni</option>
            <option :value="30">30 dni</option>
            <option :value="90">90 dni</option>
          </select>
        </div>

        <div class="legend">
          <span><i class="purple"></i> Rejestracje</span>
          <span><i class="cyan"></i> Recenzje</span>
          <span><i class="green"></i> Biblioteki</span>
        </div>

        <p v-if="activityLoading" class="muted">
          Pobieranie aktywności...
        </p>

        <p v-else-if="activityError" class="error">
          {{ activityError }}
        </p>

        <p v-else-if="!activity.length" class="muted">
          Brak danych.
        </p>

        <div v-else class="chart-scroll">
          <div
            class="activity-chart"
            :style="{ minWidth: Math.max(300, activity.length * 46) + 'px' }"
          >
            <div
              v-for="item in activity"
              :key="item.date"
              class="day"
            >
              <div class="day-bars">
                <div
                  class="bar purple"
                  :style="{ height: percentage(item.users, activityMax) }"
                  :title="'Rejestracje: ' + item.users"
                ></div>

                <div
                  class="bar cyan"
                  :style="{ height: percentage(item.reviews, activityMax) }"
                  :title="'Recenzje: ' + item.reviews"
                ></div>

                <div
                  class="bar green"
                  :style="{ height: percentage(item.favorites, activityMax) }"
                  :title="'Biblioteki: ' + item.favorites"
                ></div>
              </div>

              <span class="day-label">{{ formatDate(item.date) }}</span>
            </div>
          </div>
        </div>

        <p class="muted small">
          Skala wykresu: 0–{{ activityMax }} wpisów dziennie.
          Dane obejmują istniejące rekordy.
        </p>
      </section>

      <div class="panels-grid">

        <!-- POPULARNE GRY -->

        <section class="panel">
          <h2>Najpopularniejsze gry</h2>
          <p class="muted small">Według liczby wpisów w bibliotekach.</p>

          <p v-if="loading" class="muted">Pobieranie...</p>

          <p v-else-if="failedSections.includes('Popularne gry')" class="error">
            Brak dostępu do danych.
          </p>

          <p v-else-if="!popularGames.length" class="muted">
            Brak gier dodanych do bibliotek.
          </p>

          <article
            v-for="(game, index) in popularGames"
            :key="game.id"
            class="ranking-row"
          >
            <div class="ranking-heading">
              <span class="rank">{{ index + 1 }}.</span>

              <img
                v-if="game.thumbnail"
                :src="game.thumbnail"
                alt=""
                loading="lazy"
              />

              <RouterLink :to="'/games/' + game.slug">
                {{ game.title }}
              </RouterLink>

              <strong>{{ game.favorites_count }}</strong>
            </div>

            <div class="track">
              <div
                class="purple"
                :style="{ width: percentage(game.favorites_count, gamesMax) }"
              ></div>
            </div>
          </article>
        </section>

        <!-- STATUSY BIBLIOTEK -->

        <section class="panel">
          <h2>Statusy bibliotek</h2>

          <p v-if="loading" class="muted">Pobieranie...</p>

          <p v-else-if="failedSections.includes('Biblioteki')" class="error">
            Brak dostępu do danych.
          </p>

          <template v-else>
            <div class="donut" :style="donutStyle">
              <div class="donut-center">
                <strong>{{ libraryTotal }}</strong>
                <span>Wpisy</span>
              </div>
            </div>

            <div
              v-for="(item, index) in statuses"
              :key="item.status"
              class="status-row"
            >
              <i :style="{ background: colors[index % colors.length] }"></i>
              <span>{{ item.label }}</span>
              <strong>{{ item.count }}</strong>
              <span class="muted">{{ item.percentage }}%</span>
            </div>
          </template>
        </section>

        <!-- KATEGORIE -->

        <section class="panel">
          <h2>Kategorie gier</h2>
          <p class="muted small">Według liczby aktywnych gier.</p>

          <p v-if="loading" class="muted">Pobieranie...</p>

          <p v-else-if="failedSections.includes('Kategorie')" class="error">
            Brak dostępu do danych.
          </p>

          <p v-else-if="!categories.length" class="muted">
            Brak kategorii.
          </p>

          <div
            v-for="category in categories"
            :key="category.id"
            class="ranking-row"
          >
            <div class="ranking-heading">
              <span>{{ category.name }}</span>
              <strong>{{ category.active_games_count }}</strong>
            </div>

            <div class="track">
              <div
                class="cyan"
                :style="{ width: percentage(category.active_games_count, categoriesMax) }"
              ></div>
            </div>
          </div>
        </section>

        <!-- OCENY -->

        <section class="panel">
          <h2>Rozkład ocen</h2>
          <p class="muted small">Wyłącznie rzeczywiste oceny użytkowników.</p>

          <p v-if="loading" class="muted">Pobieranie...</p>

          <p v-else-if="failedSections.includes('Oceny')" class="error">
            Brak dostępu do danych.
          </p>

          <div
            v-for="item in ratings"
            :key="item.rating"
            class="rating-row"
          >
            <span>{{ item.rating }}/10</span>

            <div class="track">
              <div
                class="green"
                :style="{ width: percentage(item.count, ratingsMax) }"
              ></div>
            </div>

            <strong>{{ item.count }}</strong>
          </div>
        </section>

      </div>
    </div>
  </main>
</template>

<style scoped>
.analytics-page {
  min-height: 80vh;
  padding: 40px 20px 80px;
  color: #F8FAFC;
}

.analytics-page * {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back {
  display: inline-block;
  margin-bottom: 25px;
  color: #A78BFA;
  text-decoration: none;
}

.heading,
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.heading {
  margin-bottom: 30px;
}

.heading h1 {
  font-size: 34px;
  margin: 10px 0;
}

.heading p,
.muted {
  color: #94A3B8;
}

.eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #A78BFA;
}

button,
select {
  padding: 12px 16px;
  background: #151B2B;
  border: 1px solid #334155;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 13px;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

button:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 2px solid #A78BFA;
  outline-offset: 3px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 25px;
}

.stat-card,
.panel {
  background: #151B2B;
  border: 1px solid #273044;
  border-radius: 16px;
  padding: 24px;
  min-width: 0;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-icon {
  font-size: 26px;
}

.stat-card strong {
  font-size: 30px;
}

.stat-card .muted {
  font-size: 13px;
}

.panel {
  margin-bottom: 20px;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.panel-heading h2 {
  margin: 0;
}

.small {
  font-size: 12px;
  line-height: 1.6;
}

.panels-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 24px 0;
}

.legend span,
.status-row {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
}

.legend i,
.status-row i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.purple { background: #8B5CF6; }
.cyan { background: #22D3EE; }
.green { background: #34D399; }

.chart-scroll {
  overflow-x: auto;
  padding-bottom: 12px;
}

.activity-chart {
  display: flex;
  gap: 7px;
  min-height: 230px;
  align-items: flex-end;
}

.day {
  flex: 1;
  min-width: 35px;
}

.day-bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 200px;
  border-bottom: 1px solid #334155;
  background: repeating-linear-gradient(
    to top,
    transparent 0,
    transparent 49px,
    #273044 49px,
    #273044 50px
  );
}

.bar {
  width: 24%;
  max-width: 20px;
  border-radius: 4px 4px 0 0;
}

.day-label {
  display: block;
  text-align: center;
  font-size: 10px;
  color: #94A3B8;
  padding-top: 10px;
}

.ranking-row {
  margin-top: 20px;
}

.ranking-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
}

.ranking-heading strong {
  margin-left: auto;
}

.ranking-heading img {
  width: 55px;
  height: 30px;
  object-fit: cover;
  border-radius: 5px;
}

.ranking-heading a {
  color: #F8FAFC;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.ranking-heading a:hover {
  color: #A78BFA;
}

.rank {
  color: #A78BFA;
  font-weight: 700;
}

.track {
  height: 9px;
  background: #273044;
  border-radius: 20px;
  overflow: hidden;
}

.track > div {
  height: 100%;
  border-radius: inherit;
}

.donut {
  width: 180px;
  height: 180px;
  margin: 28px auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.donut-center {
  width: 135px;
  height: 135px;
  border-radius: 50%;
  background: #151B2B;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-center strong {
  font-size: 30px;
}

.donut-center span {
  font-size: 12px;
  color: #94A3B8;
}

.status-row {
  padding: 12px 0;
  border-bottom: 1px solid #273044;
}

.status-row strong {
  margin-left: auto;
}

.rating-row {
  display: grid;
  grid-template-columns: 45px 1fr 30px;
  align-items: center;
  gap: 12px;
  margin: 15px 0;
  font-size: 12px;
}

.rating-row strong {
  text-align: right;
}

.error {
  color: #FCA5A5;
  background: #EF444412;
  border: 1px solid #EF444455;
  padding: 14px;
  border-radius: 9px;
  font-size: 13px;
}

@media (max-width: 850px) {
  .panels-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 550px) {
  .analytics-page {
    padding: 25px 12px 60px;
  }

  .heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .heading h1 {
    font-size: 26px;
  }

  .heading p {
    font-size: 13px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card,
  .panel {
    padding: 16px;
  }

  .stat-card strong {
    font-size: 25px;
  }

  .panel h2 {
    font-size: 17px;
  }

  .panel-heading {
    flex-wrap: wrap;
  }
}
</style>
