
<script setup>
import {
  computed,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from 'vue'

import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

import {
  getAdminUsers,
  getAdminUserStats,
  updateAdminUserRole
} from '../../services/adminUserService'

// UZYTKOWNIK

const authStore = useAuthStore()

// STAN APLIKACJI

const users = ref([])

const stats = ref({
  total_users: null,
  admin_users: null,
  regular_users: null,
  today_users: null
})

const loading = ref(false)
const statsLoading = ref(false)
const changingId = ref(null)

const error = ref('')
const statsError = ref('')
const actionError = ref('')
const success = ref('')

// FILTRY

const search = ref('')
const roleFilter = ref('')
const sort = ref('newest')
const perPage = ref(10)

// PAGINACJA

const currentPage = ref(1)
const lastPage = ref(1)
const totalUsers = ref(0)

let searchTimeout
let requestVersion = 0

// STATYSTYKI

const statCards = computed(() => [
  {
    label: 'Wszystkie konta',
    value: stats.value.total_users,
    icon: '👥'
  },
  {
    label: 'Administratorzy',
    value: stats.value.admin_users,
    icon: '🛡️'
  },
  {
    label: 'Gracze',
    value: stats.value.regular_users,
    icon: '🎮'
  },
  {
    label: 'Nowe dzisiaj',
    value: stats.value.today_users,
    icon: '📈'
  }
])

// OBSLUGA BLEDOW

function getErrorMessage(err) {
  const status = err.response?.status

  if (status === 401) {
    return 'Sesja wygasła. Zaloguj się ponownie.'
  }

  if (status === 403) {
    return 'Brak uprawnień administratora.'
  }

  if (status === 419) {
    return 'Sesja wygasła. Odśwież stronę.'
  }

  if (status === 422 || status === 404) {
    return err.response?.data?.message ||
      'Nie można wykonać tej operacji.'
  }

  return 'Wystąpił błąd komunikacji z serwerem.'
}

// POBIERANIE UZYTKOWNIKOW

async function loadUsers(page = 1) {
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

    if (roleFilter.value) {
      params.role = roleFilter.value
    }

    const data = await getAdminUsers(params)

    if (version !== requestVersion) return

    if (!Array.isArray(data?.data)) {
      throw new Error('Nieprawidłowa odpowiedź API')
    }

    users.value = data.data
    currentPage.value = data.current_page
    lastPage.value = data.last_page
    totalUsers.value = data.total

    if (currentPage.value > lastPage.value) {
      await loadUsers(lastPage.value)
    }

  } catch (err) {
    if (version !== requestVersion) return

    users.value = []
    error.value = getErrorMessage(err)

  } finally {
    if (version === requestVersion) {
      loading.value = false
    }
  }
}

// POBIERANIE STATYSTYK

async function loadStats() {
  if (statsLoading.value) return

  statsLoading.value = true
  statsError.value = ''

  try {
    const data = await getAdminUserStats()

    const keys = [
      'total_users',
      'admin_users',
      'regular_users',
      'today_users'
    ]

    if (!keys.every(key =>
      Number.isInteger(data?.[key]) &&
      data[key] >= 0
    )) {
      throw new Error('Nieprawidłowe statystyki')
    }

    stats.value = data

  } catch (err) {
    statsError.value = getErrorMessage(err)

    stats.value = {
      total_users: null,
      admin_users: null,
      regular_users: null,
      today_users: null
    }

  } finally {
    statsLoading.value = false
  }
}

// ODSWIEZANIE

async function refreshData(page = 1) {
  await Promise.all([
    loadUsers(page),
    loadStats()
  ])
}

// SPRAWDZANIE WLASNEGO KONTA

function isOwnAccount(user) {
  return Number(user.id) ===
    Number(authStore.user?.id)
}

// FORMATOWANIE ROLI

function roleLabel(role) {
  return role === 'admin'
    ? 'Administrator'
    : 'Gracz'
}

// FORMATOWANIE DATY

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// AVATAR

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase()
    || '?'
}

// ZMIANA ROLI

async function changeRole(user) {
  if (
    !authStore.isAdmin ||
    isOwnAccount(user) ||
    changingId.value !== null ||
    loading.value
  ) {
    return
  }

  const newRole = user.role === 'admin'
    ? 'user'
    : 'admin'

  const confirmed = window.confirm(
    `Czy na pewno chcesz zmienić rolę ` +
    `użytkownika ${user.name} na ` +
    `${roleLabel(newRole)}?`
  )

  if (!confirmed) return

  changingId.value = user.id
  actionError.value = ''
  success.value = ''

  try {
    await updateAdminUserRole(
      user.id,
      newRole
    )

    success.value =
      'Rola użytkownika została zmieniona.'

    await refreshData(currentPage.value)

  } catch (err) {
    actionError.value = getErrorMessage(err)

  } finally {
    changingId.value = null
  }
}

// RESETOWANIE FILTROW

function resetFilters() {
  search.value = ''
  roleFilter.value = ''
  sort.value = 'newest'
  perPage.value = 10
}

// ZMIANA STRONY

function changePage(page) {
  if (
    page < 1 ||
    page > lastPage.value ||
    loading.value ||
    changingId.value !== null
  ) {
    return
  }

  loadUsers(page)
}

// OBSERWOWANIE FILTROW

watch(
  [search, roleFilter, sort, perPage],
  () => {
    clearTimeout(searchTimeout)

    searchTimeout = setTimeout(() => {
      loadUsers(1)
    }, 350)
  }
)

// URUCHOMIENIE WIDOKU

onMounted(() => {
  refreshData()
})

// CZYSZCZENIE

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)
  requestVersion++
})
</script>

<template>
  <main class="admin-page">
    <div class="admin-container">

      <!-- POWROT -->

      <RouterLink
        to="/admin"
        class="back-link"
      >
        ← Panel administratora
      </RouterLink>

      <!-- NAGLOWEK -->

      <header class="admin-heading">
        <div>
          <span class="eyebrow">
            GAMEVERS ADMIN
          </span>

          <h1>Zarządzanie użytkownikami</h1>

          <p>
            Przeglądaj konta i zarządzaj
            uprawnieniami użytkowników.
          </p>
        </div>

        <span
          class="heading-icon"
          aria-hidden="true"
        >
          👥
        </span>
      </header>

      <!-- STATYSTYKI -->

      <section class="stats-grid">
        <article
          v-for="stat in statCards"
          :key="stat.label"
          class="stat-card"
        >
          <span class="stat-icon">
            {{ stat.icon }}
          </span>

          <span class="stat-label">
            {{ stat.label }}
          </span>

          <strong class="stat-value">
            {{
              statsLoading
                ? '...'
                : stat.value ?? '—'
            }}
          </strong>
        </article>
      </section>

      <p
        v-if="statsError"
        class="message error"
        role="alert"
      >
        {{ statsError }}
      </p>

      <!-- FILTRY -->

      <section class="filters-panel">

        <div class="section-heading">
          <h2>Lista użytkowników</h2>

          <button
            class="secondary-button"
            type="button"
            :disabled="
              loading ||
              statsLoading ||
              changingId !== null
            "
            @click="refreshData(currentPage)"
          >
            Odśwież
          </button>
        </div>

        <div class="filters-grid">

          <label class="search-field">
            <span>Wyszukaj</span>

            <input
              v-model="search"
              type="search"
              maxlength="255"
              placeholder="Nazwa lub adres e-mail"
            />
          </label>

          <label>
            <span>Rola</span>

            <select v-model="roleFilter">
              <option value="">
                Wszyscy
              </option>

              <option value="admin">
                Administratorzy
              </option>

              <option value="user">
                Gracze
              </option>
            </select>
          </label>

          <label>
            <span>Sortowanie</span>

            <select v-model="sort">
              <option value="newest">
                Najnowsi
              </option>

              <option value="oldest">
                Najstarsi
              </option>

              <option value="name">
                Nazwa A-Z
              </option>

              <option value="name_desc">
                Nazwa Z-A
              </option>
            </select>
          </label>

          <label>
            <span>Na stronę</span>

            <select v-model.number="perPage">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>

        </div>

        <div class="filter-footer">
          <span>
            Wyniki: {{ totalUsers }}
          </span>

          <button
            type="button"
            class="text-button"
            @click="resetFilters"
          >
            Wyczyść filtry
          </button>
        </div>
      </section>

      <!-- KOMUNIKATY -->

      <p
        v-if="success"
        class="message success"
        role="status"
      >
        {{ success }}
      </p>

      <p
        v-if="actionError"
        class="message error"
        role="alert"
      >
        {{ actionError }}
      </p>

      <!-- LADOWANIE -->

      <div
        v-if="loading"
        class="state-panel"
        role="status"
      >
        <div class="spinner"></div>

        <p>Pobieranie użytkowników...</p>
      </div>

      <!-- BLAD -->

      <div
        v-else-if="error"
        class="state-panel"
      >
        <p class="error-text">
          {{ error }}
        </p>

        <button
          class="secondary-button"
          type="button"
          @click="loadUsers(currentPage)"
        >
          Spróbuj ponownie
        </button>
      </div>

      <!-- BRAK WYNIKOW -->

      <div
        v-else-if="users.length === 0"
        class="state-panel"
      >
        <span class="empty-icon">👥</span>

        <h3>Nie znaleziono użytkowników</h3>

        <p>Spróbuj zmienić filtry.</p>
      </div>

      <!-- LISTA UZYTKOWNIKOW -->

      <section
        v-else
        class="users-list"
      >
        <article
          v-for="user in users"
          :key="user.id"
          class="user-card"
        >
          <div class="user-main">

            <div
              class="avatar"
              aria-hidden="true"
            >
              {{ getInitial(user.name) }}
            </div>

            <div class="user-info">
              <h3>{{ user.name }}</h3>

              <p>{{ user.email }}</p>

              <span class="user-id">
                ID: {{ user.id }}
              </span>
            </div>

            <span
              class="role-badge"
              :class="user.role"
            >
              {{ roleLabel(user.role) }}
            </span>

          </div>

          <div class="user-details">

            <div class="detail">
              <span>Gry w bibliotece</span>

              <strong>
                {{ user.favorites_count ?? '—' }}
              </strong>
            </div>

            <div class="detail">
              <span>Recenzje</span>

              <strong>
                {{ user.reviews_count ?? '—' }}
              </strong>
            </div>

            <div class="detail">
              <span>Data rejestracji</span>

              <strong>
                {{ formatDate(user.created_at) }}
              </strong>
            </div>

          </div>

          <div class="user-actions">

            <span
              v-if="isOwnAccount(user)"
              class="own-account"
            >
              Twoje konto — chronione
            </span>

            <button
              v-else
              type="button"
              class="role-button"
              :class="{
                demote: user.role === 'admin'
              }"
              :disabled="
                changingId !== null ||
                loading ||
                !authStore.isAdmin
              "
              @click="changeRole(user)"
            >
              {{
                changingId === user.id
                  ? 'Zapisywanie...'
                  : user.role === 'admin'
                    ? 'Odbierz rolę administratora'
                    : 'Nadaj rolę administratora'
              }}
            </button>

          </div>
        </article>
      </section>

      <!-- PAGINACJA -->

      <nav
        v-if="!error && lastPage > 1"
        class="pagination"
        aria-label="Strony użytkowników"
      >
        <button
          type="button"
          :disabled="
            currentPage <= 1 ||
            loading ||
            changingId !== null
          "
          @click="changePage(currentPage - 1)"
        >
          ← Poprzednia
        </button>

        <span>
          {{ currentPage }} / {{ lastPage }}
        </span>

        <button
          type="button"
          :disabled="
            currentPage >= lastPage ||
            loading ||
            changingId !== null
          "
          @click="changePage(currentPage + 1)"
        >
          Następna →
        </button>
      </nav>

      <!-- INFORMACJE O BEZPIECZENSTWIE -->

      <section class="security-panel">
        <h2>🛡️ Bezpieczeństwo kont</h2>

        <p>
          Zmiana roli wpływa na uprawnienia
          użytkownika w całym portalu.
          Nadawaj uprawnienia administratora
          wyłącznie zaufanym osobom.
        </p>

        <p>
          Nie możesz zmienić własnej roli.
          Hasła użytkowników nie są wyświetlane.
        </p>
      </section>

    </div>
  </main>
</template>

<style scoped>
.admin-page {
  min-height: 80vh;
  padding: 40px 20px 80px;
  color: #F8FAFC;
}

.admin-page * {
  box-sizing: border-box;
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

.back-link:hover {
  color: #DDD6FE;
}

.admin-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 35px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.admin-heading h1 {
  margin: 12px 0;
  font-size: 34px;
}

.admin-heading p {
  color: #94A3B8;
  line-height: 1.7;
}

.heading-icon {
  font-size: 52px;
}

.stats-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 23px;
  min-width: 0;
  background: #151B2B;
  border: 1px solid #273044;
  border-radius: 16px;
}

.stat-icon {
  font-size: 27px;
}

.stat-label {
  font-size: 13px;
  color: #94A3B8;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
}

.filters-panel {
  padding: 24px;
  margin-bottom: 24px;
  background: #151B2B;
  border: 1px solid #273044;
  border-radius: 16px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 24px;
}

.section-heading h2 {
  margin: 0;
  font-size: 21px;
}

.filters-grid {
  display: grid;
  grid-template-columns:
    2fr 1fr 1fr 0.7fr;
  gap: 15px;
}

.filters-grid label {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.filters-grid label span {
  color: #CBD5E1;
  font-size: 13px;
}

.filters-grid input,
.filters-grid select {
  width: 100%;
  min-width: 0;
  padding: 12px;
  background: #0B0F19;
  border: 1px solid #334155;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 13px;
}

.filters-grid input:focus,
.filters-grid select:focus {
  outline: 2px solid #8B5CF6;
  outline-offset: 1px;
}

.filter-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  color: #94A3B8;
  font-size: 13px;
}

button {
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

button:focus-visible {
  outline: 2px solid #A78BFA;
  outline-offset: 3px;
}

.secondary-button {
  padding: 10px 15px;
  background: #20283A;
  border: 1px solid #334155;
  border-radius: 9px;
  color: #E2E8F0;
  font-size: 13px;
}

.secondary-button:hover:not(:disabled) {
  border-color: #8B5CF6;
}

.text-button {
  padding: 5px;
  background: transparent;
  border: 0;
  color: #A78BFA;
  font-size: 13px;
}

.users-list {
  display: grid;
  gap: 16px;
}

.user-card {
  padding: 24px;
  background: #151B2B;
  border: 1px solid #273044;
  border-radius: 16px;
}

.user-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  background: #8B5CF62B;
  border: 1px solid #8B5CF655;
  border-radius: 50%;
  color: #C4B5FD;
  font-size: 23px;
  font-weight: 800;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h3 {
  margin: 0 0 6px;
  font-size: 17px;
  overflow-wrap: anywhere;
}

.user-info p {
  margin: 0 0 6px;
  color: #94A3B8;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.user-id {
  color: #94A3B8;
  font-size: 11px;
}

.role-badge {
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin {
  background: #8B5CF625;
  color: #C4B5FD;
}

.role-badge.user {
  background: #334155;
  color: #CBD5E1;
}

.user-details {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
  padding: 20px 0;
  margin-top: 18px;
  border-top: 1px solid #273044;
  border-bottom: 1px solid #273044;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail span {
  color: #94A3B8;
  font-size: 12px;
}

.detail strong {
  font-size: 17px;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.role-button {
  padding: 11px 16px;
  background: #8B5CF61A;
  border: 1px solid #8B5CF655;
  border-radius: 9px;
  color: #C4B5FD;
  font-size: 13px;
  font-weight: 600;
}

.role-button:hover:not(:disabled) {
  background: #8B5CF635;
}

.role-button.demote {
  background: #EF444412;
  border-color: #EF444455;
  color: #FCA5A5;
}

.role-button.demote:hover:not(:disabled) {
  background: #EF444425;
}

.own-account {
  color: #34D399;
  font-size: 13px;
}

.message {
  padding: 15px;
  margin-bottom: 18px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 14px;
}

.message.success {
  background: #10B98112;
  border-color: #10B98155;
  color: #6EE7B7;
}

.message.error {
  background: #EF444412;
  border-color: #EF444455;
  color: #FCA5A5;
}

.state-panel {
  padding: 50px 20px;
  background: #151B2B;
  border: 1px solid #273044;
  border-radius: 16px;
  text-align: center;
  color: #94A3B8;
}

.state-panel h3 {
  color: #F8FAFC;
}

.empty-icon {
  font-size: 42px;
}

.error-text {
  color: #FCA5A5;
}

.spinner {
  width: 35px;
  height: 35px;
  margin: 0 auto 20px;
  border: 3px solid #334155;
  border-top-color: #A78BFA;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 28px;
}

.pagination button {
  padding: 10px 16px;
  background: #151B2B;
  border: 1px solid #334155;
  border-radius: 9px;
  color: #E2E8F0;
  font-size: 13px;
}

.pagination span {
  color: #94A3B8;
  font-size: 14px;
}

.security-panel {
  padding: 24px;
  margin-top: 35px;
  background: #111827;
  border: 1px solid #273044;
  border-radius: 16px;
}

.security-panel h2 {
  margin-top: 0;
  font-size: 19px;
}

.security-panel p {
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filters-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 550px) {
  .admin-page {
    padding: 25px 12px 60px;
  }

  .admin-heading h1 {
    font-size: 25px;
  }

  .admin-heading p {
    font-size: 13px;
  }

  .heading-icon {
    font-size: 32px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 26px;
  }

  .filters-panel,
  .user-card {
    padding: 16px;
  }

  .search-field {
    grid-column: 1 / -1;
  }

  .user-main {
    flex-wrap: wrap;
    gap: 10px;
  }

  .avatar {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .user-info h3 {
    font-size: 15px;
  }

  .user-info p {
    font-size: 12px;
  }

  .user-details {
    gap: 8px;
  }

  .detail span {
    font-size: 10px;
  }

  .detail strong {
    font-size: 13px;
  }

  .role-button {
    width: 100%;
    font-size: 12px;
  }

  .pagination {
    gap: 9px;
  }

  .pagination button {
    padding: 10px;
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
