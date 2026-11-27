
<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'

import { RouterLink } from 'vue-router'

import {
  getAdminGames,
  getAdminGameStats,
  getAdminGame,
  createAdminGame,
  updateAdminGame,
  updateAdminGameStatus
} from '../../services/adminGameService'

import { getCategories } from '../../services/categoryService'

import AppNotification from '../../components/ui/AppNotification.vue'
import AppLoader from '../../components/ui/AppLoader.vue'

/* STAN APLIKACJI */

const games = ref([])
const categories = ref([])
const stats = ref(null)

const loading = ref(false)
const saving = ref(false)
const editingLoading = ref(false)
const changingId = ref(null)
const categoriesReady = ref(false)

const error = ref('')
const actionError = ref('')
const statsError = ref('')
const categoriesError = ref('')
const formError = ref('')
const successMessage = ref('')

const busy = computed(() =>
  saving.value ||
  editingLoading.value ||
  changingId.value !== null
)

/* FILTRY */

const search = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const featuredFilter = ref('all')
const sort = ref('newest')
const perPage = ref(10)

/* PAGINACJA */

const currentPage = ref(1)
const lastPage = ref(1)
const totalGames = ref(0)

let requestVersion = 0
let searchTimeout = null

/* FORMULARZ */

const showForm = ref(false)
const editingId = ref(null)
const formPanel = ref(null)

const emptyForm = () => ({
  title: '',
  slug: '',
  description: '',
  short_description: '',
  thumbnail: '',
  banner: '',
  poster_url: '',
  gif_url: '',
  game_url: '',
  developer: '',
  publisher: '',
  release_date: '',
  steam_id: '',
  platforms: '',
  category_ids: [],
  is_active: true,
  is_featured: false,
  is_popular: false
})

const form = ref(emptyForm())

const mediaFields = [
  { key: 'thumbnail', label: 'URL okładki' },
  { key: 'banner', label: 'URL banera' },
  { key: 'poster_url', label: 'URL plakatu' },
  { key: 'gif_url', label: 'URL animacji GIF' }
]

/* OBSLUGA BLEDOW */

function getErrorMessage(err, fallback) {
  const status = err.response?.status

  if (status === 401) {
    return 'Sesja wygasła. Zaloguj się ponownie.'
  }

  if (status === 403) {
    return 'Nie masz uprawnień administratora.'
  }

  if (status === 419) {
    return 'Sesja wygasła. Odśwież stronę.'
  }

  if (err.response?.data?.errors) {
    return Object.values(err.response.data.errors)
      .flat()
      .join(' ')
  }

  return fallback
}

/* POBIERANIE GIER */

async function loadGames(page = 1) {
  const version = ++requestVersion

  loading.value = true
  error.value = ''

  try {
    const params = {
      page,
      per_page: perPage.value,
      sort: sort.value
    }

    if (search.value.trim()) {
      params.search = search.value.trim()
    }

    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value
    }

    if (categoryFilter.value !== 'all') {
      params.category = Number(categoryFilter.value)
    }

    if (featuredFilter.value !== 'all') {
      params.featured = Number(featuredFilter.value)
    }

    const data = await getAdminGames(params)

    if (version !== requestVersion) return

    games.value = data.data || []

    totalGames.value = Number(data.total || 0)

    currentPage.value = Number(
      data.current_page || 1
    )

    lastPage.value = Number(
      data.last_page || 1
    )

    if (currentPage.value > lastPage.value) {
      await loadGames(lastPage.value)
    }

  } catch (err) {
    if (version !== requestVersion) return

    games.value = []
    totalGames.value = 0

    error.value = getErrorMessage(
      err,
      'Nie udało się pobrać katalogu gier.'
    )

  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

/* STATYSTYKI */

async function loadStats() {
  statsError.value = ''

  try {
    stats.value = await getAdminGameStats()

  } catch (err) {
    stats.value = null

    statsError.value = getErrorMessage(
      err,
      'Nie udało się pobrać statystyk.'
    )
  }
}

/* KATEGORIE */

async function loadCategories() {
  categoriesReady.value = false
  categoriesError.value = ''

  try {
    const data = await getCategories()

    const items = Array.isArray(data)
      ? data
      : data.data

    if (!Array.isArray(items)) {
      throw new Error('Nieprawidłowe dane kategorii')
    }

    categories.value = items
    categoriesReady.value = true

  } catch (err) {
    categoriesError.value = getErrorMessage(
      err,
      'Nie udało się pobrać kategorii.'
    )
  }
}

/* ODSWIEZANIE */

async function refreshData(page = 1) {
  clearTimeout(searchTimeout)

  await Promise.all([
    loadGames(page),
    loadStats(),
    loadCategories()
  ])
}

/* GENEROWANIE SLUGA */

function generateSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function updateSlug() {
  if (editingId.value === null) {
    form.value.slug = generateSlug(
      form.value.title
    )
  }
}

/* ODCZYT PLATFORM */

function parsePlatforms(value) {
  let result = value

  if (typeof result === 'string') {
    try {
      result = JSON.parse(result)
    } catch {
      return result
    }
  }

  return Array.isArray(result)
    ? result.join(', ')
    : ''
}

/* OTWIERANIE FORMULARZA */

async function scrollToForm() {
  await nextTick()

  formPanel.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

async function openCreateForm() {
  if (busy.value) return

  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  successMessage.value = ''
  showForm.value = true

  await scrollToForm()
}

async function openEditForm(game) {
  if (busy.value) return

  editingLoading.value = true
  actionError.value = ''
  formError.value = ''

  try {
    const data = await getAdminGame(game.id)

    editingId.value = data.id

    form.value = {
      title: data.title || '',
      slug: data.slug || '',
      description: data.description || '',
      short_description: data.short_description || '',
      thumbnail: data.thumbnail || '',
      banner: data.banner || '',
      poster_url: data.poster_url || '',
      gif_url: data.gif_url || '',
      game_url: data.game_url || '',
      developer: data.developer || '',
      publisher: data.publisher || '',

      release_date: data.release_date
        ? String(data.release_date).slice(0, 10)
        : '',

      steam_id: data.steam_id ?? '',

      platforms: parsePlatforms(data.platforms),

      category_ids: (data.categories || [])
        .map(category => Number(category.id)),

      is_active: Boolean(Number(data.is_active)),
      is_featured: Boolean(Number(data.is_featured)),
      is_popular: Boolean(Number(data.is_popular))
    }

    showForm.value = true
    successMessage.value = ''

    await scrollToForm()

  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Nie udało się pobrać danych gry.'
    )

  } finally {
    editingLoading.value = false
  }
}

function closeForm() {
  if (busy.value) return

  showForm.value = false
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
}

/* WALIDACJA FORMULARZA */

function validateForm() {
  if (!categoriesReady.value) {
    return 'Najpierw pobierz listę kategorii.'
  }

  if (!form.value.title.trim()) {
    return 'Podaj tytuł gry.'
  }

  if (!form.value.description.trim()) {
    return 'Podaj opis gry.'
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
      .test(form.value.slug)
  ) {
    return 'Slug może zawierać małe litery, cyfry i myślniki.'
  }

  return ''
}

/* BUDOWANIE DANYCH DLA API */

function nullableText(value) {
  return String(value ?? '').trim() || null
}

function buildPayload() {
  return {
    title: form.value.title.trim(),
    slug: form.value.slug.trim(),
    description: form.value.description.trim(),

    short_description:
      nullableText(form.value.short_description),

    thumbnail: nullableText(form.value.thumbnail),
    banner: nullableText(form.value.banner),
    poster_url: nullableText(form.value.poster_url),
    gif_url: nullableText(form.value.gif_url),

    game_url: nullableText(form.value.game_url),

    developer: nullableText(form.value.developer),
    publisher: nullableText(form.value.publisher),

    release_date: form.value.release_date || null,

    steam_id: form.value.steam_id === ''
      ? null
      : Number(form.value.steam_id),

    platforms: [...new Set(
      form.value.platforms
        .split(',')
        .map(platform => platform.trim())
        .filter(Boolean)
    )],

    category_ids: form.value.category_ids.map(Number),

    is_active: form.value.is_active,
    is_featured: form.value.is_featured,
    is_popular: form.value.is_popular
  }
}

/* ZAPISYWANIE GRY */

async function saveGame() {
  if (busy.value) return

  formError.value = ''
  successMessage.value = ''

  const validation = validateForm()

  if (validation) {
    formError.value = validation
    return
  }

  saving.value = true

  try {
    const payload = buildPayload()

    if (editingId.value !== null) {
      await updateAdminGame(
        editingId.value,
        payload
      )

      successMessage.value =
        'Dane gry zostały zaktualizowane.'

    } else {
      await createAdminGame(payload)

      successMessage.value =
        'Nowa gra została dodana do katalogu.'
    }

    showForm.value = false
    editingId.value = null
    form.value = emptyForm()

    clearTimeout(searchTimeout)

    await Promise.all([
      loadGames(1),
      loadStats()
    ])

  } catch (err) {
    formError.value = getErrorMessage(
      err,
      'Nie udało się zapisać gry.'
    )

  } finally {
    saving.value = false
  }
}

/* AKTYWACJA I DEZAKTYWACJA */

async function toggleGameStatus(game) {
  if (busy.value || loading.value) return

  const newStatus = !Boolean(
    Number(game.is_active)
  )

  const action = newStatus
    ? 'aktywować'
    : 'dezaktywować'

  const confirmed = window.confirm(
    `Czy na pewno chcesz ${action} grę "${game.title}"?`
  )

  if (!confirmed) return

  changingId.value = game.id
  actionError.value = ''
  successMessage.value = ''

  try {
    await updateAdminGameStatus(
      game.id,
      newStatus
    )

    successMessage.value = newStatus
      ? 'Gra została aktywowana.'
      : 'Gra została dezaktywowana.'

    if (editingId.value === game.id) {
      form.value.is_active = newStatus
    }

    await Promise.all([
      loadGames(currentPage.value),
      loadStats()
    ])

  } catch (err) {
    actionError.value = getErrorMessage(
      err,
      'Nie udało się zmienić statusu gry.'
    )

  } finally {
    changingId.value = null
  }
}

/* PAGINACJA */

function changePage(page) {
  if (
    page < 1 ||
    page > lastPage.value ||
    loading.value ||
    busy.value
  ) return

  clearTimeout(searchTimeout)
  loadGames(page)
}

/* FILTRY */

function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
  categoryFilter.value = 'all'
  featuredFilter.value = 'all'
  sort.value = 'newest'
  perPage.value = 10
}

watch(search, () => {
  clearTimeout(searchTimeout)

  requestVersion++
  loading.value = true

  searchTimeout = setTimeout(() => {
    loadGames(1)
  }, 350)
})

watch(
  [
    statusFilter,
    categoryFilter,
    featuredFilter,
    sort,
    perPage
  ],
  () => {
    clearTimeout(searchTimeout)
    loadGames(1)
  }
)

/* URUCHOMIENIE */

onMounted(() => {
  refreshData()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  requestVersion++
})
</script>

<template>
  <main class="admin-games-page">
    <div class="admin-container">

      <RouterLink to="/admin" class="back-link">
        ← Panel administratora
      </RouterLink>

      <!-- NAGLOWEK -->

      <header class="page-header">
        <div>
          <span class="eyebrow">GAMEVERS ADMIN</span>

          <h1>Zarządzanie grami</h1>

          <p>
            Dodawaj, edytuj i zarządzaj
            widocznością gier w katalogu.
          </p>
        </div>

        <button
          type="button"
          class="primary-button"
          :disabled="busy || showForm"
          @click="openCreateForm"
        >
          + Dodaj grę
        </button>
      </header>

      <!-- STATYSTYKI -->

      <section class="stats-grid">

        <article class="stat-card">
          <span>🎮 Wszystkie gry</span>
          <strong>{{ stats?.total_games ?? '—' }}</strong>
        </article>

        <article class="stat-card">
          <span>Aktywne gry</span>
          <strong class="green">
            {{ stats?.active_games ?? '—' }}
          </strong>
        </article>

        <article class="stat-card">
          <span>Nieaktywne gry</span>
          <strong>
            {{ stats?.inactive_games ?? '—' }}
          </strong>
        </article>

        <article class="stat-card">
          <span>⭐ Wyróżnione gry</span>
          <strong class="yellow">
            {{ stats?.featured_games ?? '—' }}
          </strong>
        </article>

        <article class="stat-card">
          <span>🔥 Popularne gry</span>
          <strong>
            {{ stats?.popular_games ?? '—' }}
          </strong>
        </article>

      </section>

      <!-- POWIADOMIENIA -->

      <div
        v-if="successMessage"
        class="notification-wrapper"
      >
        <AppNotification
          type="success"
          :message="successMessage"
          @close="successMessage = ''"
        />
      </div>

      <div
        v-for="item in [
          { key: 'list', message: error },
          { key: 'action', message: actionError },
          { key: 'stats', message: statsError },
          { key: 'categories', message: categoriesError }
        ].filter(item => item.message)"
        :key="item.key"
        class="notification-wrapper"
      >
        <AppNotification
          type="error"
          :message="item.message"
          @close="
            item.key === 'list' ? error = '' :
            item.key === 'action' ? actionError = '' :
            item.key === 'stats' ? statsError = '' :
            categoriesError = ''
          "
        />
      </div>

      <!-- FORMULARZ -->

      <section
        v-if="showForm"
        ref="formPanel"
        class="form-panel"
      >

        <div class="form-heading">

          <h2>
            {{
              editingId !== null
                ? 'Edytuj grę'
                : 'Dodaj nową grę'
            }}
          </h2>

          <button
            type="button"
            class="close-button"
            :disabled="busy"
            aria-label="Zamknij formularz"
            @click="closeForm"
          >
            ×
          </button>

        </div>

        <form @submit.prevent="saveGame">

          <fieldset :disabled="busy">

            <h3 class="form-section-title">
              1. Podstawowe informacje
            </h3>

            <div class="form-grid">

              <div class="field">
                <label for="game-title">Tytuł gry *</label>

                <input
                  id="game-title"
                  v-model="form.title"
                  maxlength="255"
                  required
                  @input="updateSlug"
                />
              </div>

              <div class="field">
                <label for="game-slug">Slug *</label>

                <input
                  id="game-slug"
                  v-model="form.slug"
                  maxlength="255"
                  required
                  placeholder="nazwa-gry"
                />

                <small>
                  Zmiana sluga zmienia adres strony gry.
                </small>
              </div>

              <div class="field full-width">
                <label for="game-short">
                  Krótki opis
                </label>

                <textarea
                  id="game-short"
                  v-model="form.short_description"
                  maxlength="500"
                  rows="3"
                ></textarea>
              </div>

              <div class="field full-width">
                <label for="game-description">
                  Pełny opis *
                </label>

                <textarea
                  id="game-description"
                  v-model="form.description"
                  maxlength="20000"
                  rows="6"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="game-developer">
                  Producent
                </label>

                <input
                  id="game-developer"
                  v-model="form.developer"
                  maxlength="255"
                />
              </div>

              <div class="field">
                <label for="game-publisher">
                  Wydawca
                </label>

                <input
                  id="game-publisher"
                  v-model="form.publisher"
                  maxlength="255"
                />
              </div>

              <div class="field">
                <label for="game-release">
                  Data premiery
                </label>

                <input
                  id="game-release"
                  v-model="form.release_date"
                  type="date"
                />
              </div>

              <div class="field">
                <label for="game-steam">
                  Steam ID
                </label>

                <input
                  id="game-steam"
                  v-model="form.steam_id"
                  type="number"
                  min="1"
                  max="9007199254740991"
                  step="1"
                />
              </div>

              <div class="field full-width">
                <label for="game-platforms">
                  Platformy
                </label>

                <input
                  id="game-platforms"
                  v-model="form.platforms"
                  placeholder="PC, PlayStation 5, Xbox"
                />

                <small>
                  Oddziel nazwy platform przecinkami.
                </small>
              </div>

              <div class="field full-width">
                <label for="game-url">
                  Link do gry lub sklepu
                </label>

                <input
                  id="game-url"
                  v-model="form.game_url"
                  type="url"
                  maxlength="2048"
                  placeholder="https://..."
                />
              </div>

            </div>

            <!-- GRAFIKI -->

            <h3 class="form-section-title">
              2. Grafiki i multimedia
            </h3>

            <div class="form-grid">

              <div
                v-for="field in mediaFields"
                :key="field.key"
                class="field"
              >
                <label :for="`media-${field.key}`">
                  {{ field.label }}
                </label>

                <input
                  :id="`media-${field.key}`"
                  v-model="form[field.key]"
                  maxlength="255"
                  placeholder="https://..."
                />
              </div>

            </div>

            <!-- KATEGORIE -->

            <h3 class="form-section-title">
              3. Kategorie gry
            </h3>

            <p class="helper-text">
              Możesz przypisać grę do wielu kategorii.
            </p>

            <div
              v-if="categoriesReady"
              class="category-grid"
            >

              <label
                v-for="category in categories"
                :key="category.id"
                class="checkbox-card"
                :class="{
                  selected: form.category_ids.includes(
                    Number(category.id)
                  )
                }"
              >
                <input
                  v-model="form.category_ids"
                  type="checkbox"
                  :value="Number(category.id)"
                />

                {{ category.name }}
              </label>

              <p v-if="categories.length === 0">
                Brak dostępnych kategorii.
              </p>

            </div>

            <div v-else>
              <p class="helper-text">
                Lista kategorii jest niedostępna.
              </p>

              <button
                type="button"
                class="secondary-button"
                @click="loadCategories"
              >
                Pobierz ponownie
              </button>
            </div>

            <!-- STATUS -->

            <h3 class="form-section-title">
              4. Widoczność i promocja
            </h3>

            <div class="status-grid">

              <label class="checkbox-card">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                />

                <div>
                  <strong>Gra aktywna</strong>
                  <small>Widoczna w publicznym katalogu</small>
                </div>
              </label>

              <label class="checkbox-card">
                <input
                  v-model="form.is_featured"
                  type="checkbox"
                />

                <div>
                  <strong>Gra wyróżniona</strong>
                  <small>Oznaczona jako wyróżniona</small>
                </div>
              </label>

              <label class="checkbox-card">
                <input
                  v-model="form.is_popular"
                  type="checkbox"
                />

                <div>
                  <strong>Gra popularna</strong>
                  <small>Oznaczenie w katalogu</small>
                </div>
              </label>

            </div>

          </fieldset>

          <div
            v-if="formError"
            class="form-notification"
          >
            <AppNotification
              type="error"
              :message="formError"
              @close="formError = ''"
            />
          </div>

          <div class="form-actions">

            <button
              type="submit"
              class="primary-button"
              :disabled="busy || !categoriesReady"
            >
              {{
                saving
                  ? 'Zapisywanie...'
                  : editingId !== null
                    ? 'Zapisz zmiany'
                    : 'Dodaj grę'
              }}
            </button>

            <button
              type="button"
              class="secondary-button"
              :disabled="busy"
              @click="closeForm"
            >
              Anuluj
            </button>

          </div>

        </form>

      </section>

      <!-- KATALOG -->

      <section class="catalog-panel">

        <div class="catalog-toolbar">

          <div>
            <h2>Katalog gier</h2>

            <p class="helper-text">
              Wyświetlane: {{ games.length }}
              z {{ totalGames }}
            </p>
          </div>

          <button
            type="button"
            class="secondary-button"
            :disabled="loading || busy"
            @click="refreshData(currentPage)"
          >
            Odśwież
          </button>

        </div>

        <!-- FILTRY -->

        <div class="filters-grid">

          <div class="field full-width">
            <label for="search">Wyszukaj grę</label>

            <input
              id="search"
              v-model="search"
              type="search"
              maxlength="255"
              :disabled="busy"
              placeholder="Tytuł, producent, wydawca..."
            />
          </div>

          <div class="field">
            <label for="status-filter">Status</label>

            <select
              id="status-filter"
              v-model="statusFilter"
              :disabled="busy"
            >
              <option value="all">Wszystkie</option>
              <option value="active">Aktywne</option>
              <option value="inactive">Nieaktywne</option>
            </select>
          </div>

          <div class="field">
            <label for="category-filter">
              Kategoria
            </label>

            <select
              id="category-filter"
              v-model="categoryFilter"
              :disabled="busy || !categoriesReady"
            >
              <option value="all">
                Wszystkie kategorie
              </option>

              <option
                v-for="category in categories"
                :key="category.id"
                :value="String(category.id)"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="featured-filter">
              Wyróżnienie
            </label>

            <select
              id="featured-filter"
              v-model="featuredFilter"
              :disabled="busy"
            >
              <option value="all">Wszystkie</option>
              <option value="1">Wyróżnione</option>
              <option value="0">Standardowe</option>
            </select>
          </div>

          <div class="field">
            <label for="sort-filter">
              Sortowanie
            </label>

            <select
              id="sort-filter"
              v-model="sort"
              :disabled="busy"
            >
              <option value="newest">
                Ostatnio dodane
              </option>

              <option value="oldest">
                Najstarsze
              </option>

              <option value="name">Nazwa A–Z</option>
              <option value="name_desc">Nazwa Z–A</option>
              <option value="popular">Wyświetlenia</option>
              <option value="rating">Najlepiej oceniane</option>
            </select>
          </div>

          <div class="field">
            <label for="per-page">
              Wyniki na stronie
            </label>

            <select
              id="per-page"
              v-model.number="perPage"
              :disabled="busy"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <div class="filter-actions">
            <button
              type="button"
              class="secondary-button"
              :disabled="busy"
              @click="resetFilters"
            >
              Wyczyść filtry
            </button>
          </div>

        </div>

        <!-- LADOWANIE -->

        <AppLoader
          v-if="loading"
          size="medium"
          message="Ładowanie gier..."
          description="Pobieramy katalog gier z serwera Gamevers."
        />

        <div
          v-else-if="error"
          class="state-message"
        >
          Nie można wyświetlić katalogu gier.
        </div>

        <div
          v-else-if="games.length === 0"
          class="state-message"
        >
          Nie znaleziono gier.
        </div>

        <!-- LISTA GIER -->

        <div v-else class="games-list">

          <article
            v-for="game in games"
            :key="game.id"
            class="game-row"
          >

            <div class="game-info">

              <img
                v-if="game.thumbnail"
                :src="game.thumbnail"
                :alt="`Okładka ${game.title}`"
                class="game-thumbnail"
                loading="lazy"
              />

              <div
                v-else
                class="thumbnail-placeholder"
              >
                🎮
              </div>

              <div class="game-text">

                <h3>{{ game.title }}</h3>

                <span>
                  {{
                    game.developer ||
                    'Nie podano producenta'
                  }}
                </span>

                <div class="game-badges">

                  <span
                    class="status-badge"
                    :class="
                      Number(game.is_active)
                        ? 'active-badge'
                        : 'inactive-badge'
                    "
                  >
                    {{
                      Number(game.is_active)
                        ? 'Aktywna'
                        : 'Nieaktywna'
                    }}
                  </span>

                  <span
                    v-if="Number(game.is_featured)"
                    class="featured-badge"
                  >
                    ★ Wyróżniona
                  </span>

                  <span
                    v-if="Number(game.is_popular)"
                    class="popular-badge"
                  >
                    Popularna
                  </span>

                </div>

                <div class="game-categories">
                  {{
                    (game.categories || [])
                      .map(category => category.name)
                      .join(' · ')
                  }}
                </div>

                <div class="game-meta">
                  Recenzje: {{ game.reviews_count || 0 }}
                  · Biblioteki: {{ game.favorites_count || 0 }}
                  · Wyświetlenia: {{ game.views || 0 }}
                </div>

              </div>

            </div>

            <div class="game-actions">

              <RouterLink
                v-if="Number(game.is_active)"
                :to="`/games/${game.slug}`"
                class="view-link"
              >
                Zobacz
              </RouterLink>

              <button
                type="button"
                class="edit-button"
                :disabled="busy || showForm"
                @click="openEditForm(game)"
              >
                Edytuj
              </button>

              <button
                type="button"
                :class="
                  Number(game.is_active)
                    ? 'delete-button'
                    : 'activate-button'
                "
                :disabled="busy || showForm"
                @click="toggleGameStatus(game)"
              >
                {{
                  changingId === game.id
                    ? 'Zapisywanie...'
                    : Number(game.is_active)
                      ? 'Dezaktywuj'
                      : 'Aktywuj'
                }}
              </button>

            </div>

          </article>

        </div>

        <!-- PAGINACJA -->

        <div
          v-if="lastPage > 1 && !loading && !error"
          class="pagination"
        >

          <button
            type="button"
            class="secondary-button"
            :disabled="currentPage <= 1 || busy"
            @click="changePage(currentPage - 1)"
          >
            ← Poprzednia
          </button>

          <span>
            Strona {{ currentPage }} z {{ lastPage }}
          </span>

          <button
            type="button"
            class="secondary-button"
            :disabled="currentPage >= lastPage || busy"
            @click="changePage(currentPage + 1)"
          >
            Następna →
          </button>

        </div>

      </section>

    </div>
  </main>
</template>

<style scoped>
.admin-games-page {
  min-height: 80vh;
  padding: 50px 20px 90px;
  color: #F8FAFC;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 28px;
  color: #A78BFA;
  font-size: 14px;
  text-decoration: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-header h1 {
  margin: 12px 0;
  font-size: 34px;
}

.page-header p,
.helper-text {
  color: #94A3B8;
  line-height: 1.7;
}

.helper-text {
  font-size: 13px;
}

.primary-button,
.secondary-button,
.edit-button,
.delete-button,
.activate-button {
  padding: 12px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  background: #8B5CF6;
  border: none;
  color: #FFFFFF;
}

.primary-button:hover:not(:disabled) {
  background: #7C3AED;
}

.secondary-button,
.edit-button {
  background: #24203C;
  border: 1px solid #443B73;
  color: #C4B5FD;
}

.delete-button {
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  color: #FCA5A5;
}

.activate-button {
  background: #143524;
  border: 1px solid #166534;
  color: #86EFAC;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* STATYSTYKI */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

.stat-card span {
  color: #94A3B8;
  font-size: 13px;
}

.stat-card strong {
  font-size: 28px;
  color: #C4B5FD;
}

.stat-card .green {
  color: #4ADE80;
}

.stat-card .yellow {
  color: #FBBF24;
}

.notification-wrapper {
  margin-bottom: 22px;
}

/* FORMULARZ */

.form-panel,
.catalog-panel {
  padding: 26px;
  margin-bottom: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.form-panel {
  scroll-margin-top: 100px;
}

.form-heading,
.catalog-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.form-heading h2,
.catalog-toolbar h2 {
  margin: 0;
  font-size: 22px;
}

.close-button {
  background: transparent;
  border: none;
  color: #94A3B8;
  font-size: 30px;
  cursor: pointer;
}

fieldset {
  padding: 0;
  margin: 0;
  border: none;
  min-width: 0;
}

.form-section-title {
  margin: 28px 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #293244;
  color: #C4B5FD;
  font-size: 17px;
}

.form-grid,
.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.filters-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.field label {
  color: #CBD5E1;
  font-size: 13px;
  font-weight: 600;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 14px;
  color-scheme: dark;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: none;
  border-color: #8B5CF6;
}

.field textarea {
  resize: vertical;
  line-height: 1.6;
}

.field small {
  color: #94A3B8;
  font-size: 12px;
}

.form-notification {
  margin-top: 20px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

/* KATEGORIE */

.category-grid,
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.checkbox-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
}

.checkbox-card.selected {
  border-color: #8B5CF6;
  background: #24203C;
}

.checkbox-card input {
  accent-color: #8B5CF6;
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.checkbox-card small {
  display: block;
  margin-top: 6px;
  color: #94A3B8;
  line-height: 1.5;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

/* LISTA GIER */

.games-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 12px;
}

.game-row:hover {
  border-color: #443B73;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.game-thumbnail,
.thumbnail-placeholder {
  width: 100px;
  height: 85px;
  flex-shrink: 0;
  border-radius: 9px;
}

.game-thumbnail {
  object-fit: cover;
  background: #22203A;
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #22203A;
  font-size: 25px;
}

.game-text {
  min-width: 0;
}

.game-text h3 {
  margin: 0 0 8px;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.game-text span {
  color: #94A3B8;
  font-size: 12px;
}

.game-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.game-badges span {
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.game-badges .active-badge {
  background: #143524;
  color: #86EFAC;
}

.game-badges .inactive-badge {
  background: #293244;
  color: #CBD5E1;
}

.game-badges .featured-badge {
  background: #30291A;
  color: #FBBF24;
}

.game-badges .popular-badge {
  background: #24203C;
  color: #C4B5FD;
}

.game-categories {
  margin-top: 9px;
  color: #A78BFA;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.game-meta {
  margin-top: 8px;
  color: #94A3B8;
  font-size: 11px;
}

.game-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}

.view-link {
  padding: 11px;
  color: #22D3EE;
  font-size: 13px;
  text-decoration: none;
}

.state-message {
  padding: 35px 20px;
  color: #94A3B8;
  text-align: center;
}

/* PAGINACJA */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 28px;
}

.pagination span {
  color: #94A3B8;
  font-size: 13px;
}

/* RESPONSYWNOSC */

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .category-grid,
  .status-grid,
  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .game-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .game-actions {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .admin-games-page {
    padding: 35px 16px 70px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .form-panel,
  .catalog-panel {
    padding: 18px;
  }

  .stats-grid,
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid,
  .filters-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .game-thumbnail,
  .thumbnail-placeholder {
    width: 70px;
    height: 80px;
  }

  .stat-card {
    padding: 15px;
  }

  .stat-card strong {
    font-size: 24px;
  }
}
</style>
