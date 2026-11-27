
<script setup>
import {
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { RouterLink } from 'vue-router'

import {
  getAdminCategories,
  getAdminCategoryStats,
  getAdminCategory,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '../../services/adminCategoryService'

// STAN APLIKACJI

const categories = ref([])

const stats = ref({
  total_categories: 0,
  used_categories: 0,
  empty_categories: 0
})

const loading = ref(false)
const saving = ref(false)
const editingLoading = ref(false)
const deletingId = ref(null)

const error = ref('')
const statsError = ref('')
const formError = ref('')
const success = ref('')

// WYSZUKIWANIE I SORTOWANIE

const search = ref('')
const sort = ref('name')
const perPage = ref(10)

const currentPage = ref(1)
const lastPage = ref(1)
const totalCategories = ref(0)

let searchTimeout = null
let requestVersion = 0

// FORMULARZ

const showForm = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  slug: '',
  description: ''
})

// OBSLUGA BLEDOW

function getErrorMessage(err) {
  const status = err.response?.status
  const data = err.response?.data

  if (status === 401) {
    return 'Musisz się ponownie zalogować.'
  }

  if (status === 403) {
    return 'Brak uprawnień administratora.'
  }

  if (status === 419) {
    return 'Sesja wygasła. Odśwież stronę.'
  }

  if (status === 422 && data?.errors) {
    return Object.values(data.errors)
      .flat()
      .join(' ')
  }

  if (status === 409) {
    return data?.message ||
      'Kategoria posiada przypisane gry.'
  }

  return data?.message && status < 500
    ? data.message
    : 'Wystąpił błąd. Spróbuj ponownie.'
}

// POBIERANIE KATEGORII

async function loadCategories(page = 1) {
  const version = ++requestVersion

  loading.value = true
  error.value = ''

  try {
    const data = await getAdminCategories({
      page,
      search: search.value.trim(),
      sort: sort.value,
      per_page: perPage.value
    })

    if (version !== requestVersion) return

    categories.value = data.data || []
    currentPage.value = data.current_page || 1
    lastPage.value = data.last_page || 1
    totalCategories.value = data.total || 0

    if (page > lastPage.value) {
      return await loadCategories(lastPage.value)
    }
  } catch (err) {
    if (version !== requestVersion) return

    error.value = getErrorMessage(err)
  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

// POBIERANIE STATYSTYK

async function loadStats() {
  statsError.value = ''

  try {
    stats.value = await getAdminCategoryStats()
  } catch (err) {
    statsError.value = getErrorMessage(err)
  }
}

async function refreshData(page = 1) {
  await Promise.all([
    loadCategories(page),
    loadStats()
  ])
}

// GENEROWANIE SLUGA

function generateSlug(value) {
  return value
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/g, '')
}

function updateSlug() {
  if (editingId.value === null) {
    form.slug = generateSlug(form.name)
  }
}

// RESETOWANIE FORMULARZA

function resetForm() {
  form.name = ''
  form.slug = ''
  form.description = ''

  editingId.value = null
  formError.value = ''
}

// OTWIERANIE FORMULARZA DODAWANIA

function openCreateForm() {
  if (saving.value || editingLoading.value) return

  resetForm()

  success.value = ''
  error.value = ''
  showForm.value = true

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// OTWIERANIE FORMULARZA EDYCJI

async function openEditForm(categoryId) {
  if (saving.value || editingLoading.value) return

  editingLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const category = await getAdminCategory(
      categoryId
    )

    resetForm()

    editingId.value = category.id

    form.name = category.name || ''
    form.slug = category.slug || ''
    form.description = category.description || ''

    showForm.value = true

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    editingLoading.value = false
  }
}

// ZAMYKANIE FORMULARZA

function closeForm() {
  if (saving.value) return

  showForm.value = false
  resetForm()
}

// WALIDACJA FORMULARZA

function validateForm() {
  if (!form.name.trim()) {
    return 'Podaj nazwę kategorii.'
  }

  if (form.name.trim().length > 100) {
    return 'Nazwa może mieć maksymalnie 100 znaków.'
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      form.slug.trim()
    )
  ) {
    return 'Slug może zawierać małe litery, cyfry i myślniki.'
  }

  if (form.slug.trim().length > 100) {
    return 'Slug może mieć maksymalnie 100 znaków.'
  }

  if (form.description.length > 2000) {
    return 'Opis może mieć maksymalnie 2000 znaków.'
  }

  return ''
}

// ZAPIS KATEGORII

async function saveCategory() {
  if (saving.value) return

  formError.value = validateForm()

  if (formError.value) return

  saving.value = true
  success.value = ''

  const payload = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null
  }

  try {
    let response

    if (editingId.value !== null) {
      response = await updateAdminCategory(
        editingId.value,
        payload
      )
    } else {
      response = await createAdminCategory(
        payload
      )
    }

    success.value = response.message ||
      'Kategoria została zapisana.'

    showForm.value = false
    resetForm()

    await refreshData(1)
  } catch (err) {
    formError.value = getErrorMessage(err)
  } finally {
    saving.value = false
  }
}

// USUWANIE KATEGORII

async function removeCategory(category) {
  if (
    deletingId.value !== null ||
    saving.value ||
    editingLoading.value
  ) return

  if (Number(category.games_count) > 0) {
    error.value =
      'Nie można usunąć kategorii przypisanej do gier.'

    return
  }

  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć kategorię "${category.name}"?`
  )

  if (!confirmed) return

  deletingId.value = category.id

  error.value = ''
  success.value = ''

  try {
    const response = await deleteAdminCategory(
      category.id
    )

    success.value = response.message ||
      'Kategoria została usunięta.'

    if (editingId.value === category.id) {
      closeForm()
    }

    await refreshData(currentPage.value)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    deletingId.value = null
  }
}

// PAGINACJA

function changePage(page) {
  if (
    page < 1 ||
    page > lastPage.value ||
    loading.value
  ) return

  loadCategories(page)
}

// OBSERWOWANIE FILTROW

watch(search, () => {
  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    loadCategories(1)
  }, 350)
})

watch([sort, perPage], () => {
  clearTimeout(searchTimeout)
  loadCategories(1)
})

// URUCHOMIENIE WIDOKU

onMounted(() => {
  refreshData()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  requestVersion++
})
</script>

<template>
  <main class="admin-categories">

    <!-- NAGLOWEK -->

    <header class="page-header">
      <div>
        <RouterLink
          to="/admin"
          class="back-link"
        >
          ← Panel administratora
        </RouterLink>

        <h1>Zarządzanie kategoriami</h1>

        <p>
          Twórz i organizuj kategorie gier
          dostępnych w Gamevers.
        </p>
      </div>

      <button
        class="btn btn-primary"
        :disabled="saving || editingLoading"
        @click="openCreateForm"
      >
        + Dodaj kategorię
      </button>
    </header>

    <!-- STATYSTYKI -->

    <section class="stats-grid">
      <article class="stat-card">
        <span>Wszystkie kategorie</span>
        <strong>{{ stats.total_categories }}</strong>
      </article>

      <article class="stat-card">
        <span>Używane kategorie</span>
        <strong class="green">
          {{ stats.used_categories }}
        </strong>
      </article>

      <article class="stat-card">
        <span>Puste kategorie</span>
        <strong class="orange">
          {{ stats.empty_categories }}
        </strong>
      </article>
    </section>

    <!-- KOMUNIKATY -->

    <div
      v-if="success"
      class="notification notification-success"
      role="status"
    >
      {{ success }}

      <button @click="success = ''">
        ×
      </button>
    </div>

    <div
      v-if="error"
      class="notification notification-error"
      role="alert"
    >
      {{ error }}

      <button @click="error = ''">
        ×
      </button>
    </div>

    <div
      v-if="statsError"
      class="notification notification-error"
    >
      Nie udało się pobrać statystyk:
      {{ statsError }}
    </div>

    <!-- FORMULARZ -->

    <section
      v-if="showForm"
      class="panel form-panel"
    >
      <div class="section-header">
        <h2>
          {{
            editingId !== null
              ? 'Edytuj kategorię'
              : 'Dodaj kategorię'
          }}
        </h2>

        <button
          class="btn btn-secondary"
          :disabled="saving"
          @click="closeForm"
        >
          Zamknij
        </button>
      </div>

      <form @submit.prevent="saveCategory">

        <div
          v-if="formError"
          class="notification notification-error"
          role="alert"
        >
          {{ formError }}
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label for="category-name">
              Nazwa kategorii *
            </label>

            <input
              id="category-name"
              v-model="form.name"
              maxlength="100"
              placeholder="np. Gry przygodowe"
              required
              :disabled="saving"
              @input="updateSlug"
            />
          </div>

          <div class="form-group">
            <label for="category-slug">
              Slug *
            </label>

            <input
              id="category-slug"
              v-model="form.slug"
              maxlength="100"
              placeholder="np. gry-przygodowe"
              required
              :disabled="saving"
            />

            <small>
              Unikalny identyfikator kategorii.
            </small>
          </div>

          <div class="form-group full-width">
            <label for="category-description">
              Opis kategorii
            </label>

            <textarea
              id="category-description"
              v-model="form.description"
              rows="5"
              maxlength="2000"
              placeholder="Opisz kategorię..."
              :disabled="saving"
            ></textarea>

            <small>
              {{ form.description.length }}/2000
            </small>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="saving"
            @click="closeForm"
          >
            Anuluj
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            {{
              saving
                ? 'Zapisywanie...'
                : 'Zapisz kategorię'
            }}
          </button>
        </div>
      </form>
    </section>

    <!-- FILTRY -->

    <section class="panel filters">
      <div class="filter-group search-group">
        <label for="category-search">
          Wyszukiwanie
        </label>

        <input
          id="category-search"
          v-model="search"
          placeholder="Szukaj kategorii..."
        />
      </div>

      <div class="filter-group">
        <label for="category-sort">
          Sortowanie
        </label>

        <select
          id="category-sort"
          v-model="sort"
        >
          <option value="name">Nazwa A–Z</option>
          <option value="name_desc">Nazwa Z–A</option>
          <option value="newest">Najnowsze</option>
          <option value="oldest">Najstarsze</option>
          <option value="popular">
            Najwięcej gier
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="category-limit">
          Na stronie
        </label>

        <select
          id="category-limit"
          v-model.number="perPage"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </section>

    <!-- LISTA KATEGORII -->

    <section class="panel categories-panel">
      <div class="section-header">
        <h2>Lista kategorii</h2>

        <span class="muted">
          Wyniki: {{ totalCategories }}
        </span>
      </div>

      <div
        v-if="loading"
        class="empty-state"
      >
        <div class="spinner"></div>
        <p>Pobieranie kategorii...</p>
      </div>

      <div
        v-else-if="categories.length === 0"
        class="empty-state"
      >
        <h3>Brak kategorii</h3>
        <p>Nie znaleziono pasujących wyników.</p>
      </div>

      <div
        v-else
        class="category-list"
      >
        <article
          v-for="category in categories"
          :key="category.id"
          class="category-card"
        >
          <div class="category-main">
            <div class="category-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                aria-hidden="true"
              >
                <path
                  d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                />
              </svg>
            </div>

            <div class="category-info">
              <h3>{{ category.name }}</h3>

              <span class="slug">
                {{ category.slug }}
              </span>

              <p>
                {{
                  category.description ||
                  'Brak opisu kategorii.'
                }}
              </p>
            </div>

            <span
              class="game-count"
              :class="{
                used: Number(category.games_count) > 0
              }"
            >
              Gier: {{ category.games_count }}
            </span>
          </div>

          <div class="category-actions">
            <button
              class="btn btn-edit"
              :disabled="
                editingLoading ||
                saving ||
                deletingId !== null
              "
              @click="openEditForm(category.id)"
            >
              Edytuj
            </button>

            <button
              class="btn btn-danger"
              :disabled="
                Number(category.games_count) > 0 ||
                deletingId !== null ||
                saving ||
                editingLoading
              "
              :title="
                Number(category.games_count) > 0
                  ? 'Kategoria posiada przypisane gry'
                  : 'Usuń kategorię'
              "
              @click="removeCategory(category)"
            >
              {{
                deletingId === category.id
                  ? 'Usuwanie...'
                  : 'Usuń'
              }}
            </button>
          </div>
        </article>
      </div>

      <!-- PAGINACJA -->

      <div
        v-if="lastPage > 1"
        class="pagination"
      >
        <button
          class="btn btn-secondary"
          :disabled="currentPage === 1 || loading"
          @click="changePage(currentPage - 1)"
        >
          ← Poprzednia
        </button>

        <span>
          {{ currentPage }} / {{ lastPage }}
        </span>

        <button
          class="btn btn-secondary"
          :disabled="
            currentPage === lastPage || loading
          "
          @click="changePage(currentPage + 1)"
        >
          Następna →
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-categories {
  max-width: 1250px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  color: #f8fafc;
}

.admin-categories * {
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 30px;
}

.back-link {
  color: #a78bfa;
  text-decoration: none;
  font-size: 14px;
}

.page-header h1 {
  margin: 14px 0 8px;
  font-size: clamp(25px, 4vw, 36px);
  line-height: 1.2;
}

.page-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #151b2b;
  border: 1px solid #273044;
  border-radius: 16px;
  padding: 24px;
}

.stat-card span {
  color: #94a3b8;
  font-size: 14px;
}

.stat-card strong {
  font-size: 34px;
  color: #a78bfa;
}

.stat-card strong.green {
  color: #34d399;
}

.stat-card strong.orange {
  color: #fbbf24;
}

.panel {
  background: #151b2b;
  border: 1px solid #273044;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 21px;
  margin: 0;
}

.muted {
  color: #94a3b8;
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group,
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
}

input,
textarea,
select {
  width: 100%;
  min-width: 0;
  padding: 13px 15px;
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 9px;
  color: #f8fafc;
  font: inherit;
  font-size: 14px;
  outline: none;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px #8b5cf622;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

small {
  font-size: 12px;
  color: #94a3b8;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 11px 18px;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s, opacity 0.2s;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  color: white;
  background: #7c3aed;
}

.btn-primary:hover:not(:disabled) {
  background: #6d28d9;
}

.btn-secondary {
  background: #20283b;
  border-color: #334155;
  color: #e2e8f0;
}

.btn-edit {
  color: #c4b5fd;
  background: #8b5cf61a;
  border-color: #8b5cf644;
}

.btn-danger {
  color: #fca5a5;
  background: #ef44441a;
  border-color: #ef444444;
}

.btn-danger:hover:not(:disabled) {
  background: #ef444433;
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.search-group {
  flex: 1;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #111827;
  border: 1px solid #273044;
  border-radius: 12px;
  padding: 18px;
}

.category-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.category-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #8b5cf61a;
  color: #a78bfa;
}

.category-icon svg {
  width: 26px;
  height: 26px;
}

.category-info {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.category-info h3 {
  font-size: 17px;
  margin: 0 0 5px;
}

.slug {
  font-size: 12px;
  color: #a78bfa;
}

.category-info p {
  font-size: 13px;
  color: #94a3b8;
  margin: 7px 0 0;
  line-height: 1.5;
}

.game-count {
  flex-shrink: 0;
  font-size: 12px;
  padding: 7px 12px;
  border-radius: 20px;
  color: #94a3b8;
  background: #20283b;
}

.game-count.used {
  color: #6ee7b7;
  background: #10b9811a;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.notification {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.notification-success {
  background: #10b98112;
  color: #6ee7b7;
  border-color: #10b98155;
}

.notification-error {
  background: #ef444412;
  color: #fca5a5;
  border-color: #ef444455;
}

.notification button {
  background: transparent;
  color: inherit;
  border: 0;
  font-size: 24px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #334155;
  border-top-color: #8b5cf6;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  color: #94a3b8;
  font-size: 14px;
}

@media (max-width: 800px) {
  .category-card {
    flex-direction: column;
    align-items: stretch;
  }

  .category-actions {
    justify-content: flex-end;
    padding-top: 12px;
    border-top: 1px solid #273044;
  }

  .filters {
    flex-wrap: wrap;
  }

  .search-group {
    flex-basis: 100%;
  }

  .filter-group {
    flex-grow: 1;
  }
}

@media (max-width: 550px) {
  .admin-categories {
    padding: 20px 14px 40px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-card {
    padding: 12px 9px;
  }

  .stat-card span {
    font-size: 11px;
  }

  .stat-card strong {
    font-size: 26px;
  }

  .panel {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .category-main {
    flex-wrap: wrap;
    gap: 10px;
  }

  .category-icon {
    width: 40px;
    height: 40px;
  }

  .category-info {
    flex-basis: calc(100% - 50px);
  }

  .category-actions .btn {
    flex: 1;
  }

  .pagination {
    gap: 8px;
  }

  .pagination .btn {
    font-size: 12px;
    padding: 10px;
  }

  .section-header h2 {
    font-size: 18px;
  }
}
</style>
