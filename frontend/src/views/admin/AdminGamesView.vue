
<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import * as gamesService from '../../services/gamesService'
import AppNotification from '../../components/ui/AppNotification.vue'

const games = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)

const error = ref('')
const successMessage = ref('')
const formError = ref('')
const search = ref('')

const showForm = ref(false)
const editingId = ref(null)

const emptyForm = () => ({
  title: '',
  description: '',
  cover_url: '',
  release_date: '',
  developer: '',
  publisher: ''
})

const form = ref(emptyForm())

const filteredGames = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return games.value

  return games.value.filter((game) =>
    String(game.title || '')
      .toLowerCase()
      .includes(query)
  )
})

function extractGames(response) {
  const payload = response.data

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return []
}

async function loadGames() {
  loading.value = true
  error.value = ''

  try {
    const response = await gamesService.getGames()
    games.value = extractGames(response)
  } catch (err) {
    error.value = 'Nie udało się pobrać katalogu gier.'
    games.value = []
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  successMessage.value = ''
  showForm.value = true
}

function openEditForm(game) {
  editingId.value = game.id

  form.value = {
    title: game.title || '',
    description: game.description || '',
    cover_url: game.cover_url || '',
    release_date: game.release_date
      ? String(game.release_date).slice(0, 10)
      : '',
    developer: game.developer || '',
    publisher: game.publisher || ''
  }

  formError.value = ''
  successMessage.value = ''
  showForm.value = true
}

function closeForm() {
  if (saving.value) return

  showForm.value = false
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
}

function validateForm() {
  if (form.value.title.trim().length < 2) {
    return 'Tytuł musi mieć minimum 2 znaki.'
  }

  if (form.value.title.trim().length > 150) {
    return 'Tytuł może mieć maksymalnie 150 znaków.'
  }

  if (form.value.description.trim().length < 10) {
    return 'Opis musi mieć minimum 10 znaków.'
  }

  if (form.value.description.trim().length > 5000) {
    return 'Opis może mieć maksymalnie 5000 znaków.'
  }

  if (
    form.value.cover_url &&
    !/^https?:\/\/.+/i.test(form.value.cover_url.trim())
  ) {
    return 'Podaj poprawny adres URL okładki.'
  }

  return ''
}

function buildPayload() {
  return {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    cover_url: form.value.cover_url.trim() || null,
    release_date: form.value.release_date || null,
    developer: form.value.developer.trim() || null,
    publisher: form.value.publisher.trim() || null
  }
}

async function saveGame() {
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
      await gamesService.updateGame(
        editingId.value,
        payload
      )

      successMessage.value =
        'Dane gry zostały zaktualizowane.'
    } else {
      await gamesService.createGame(payload)

      successMessage.value =
        'Nowa gra została dodana do katalogu.'
    }

    showForm.value = false
    editingId.value = null
    form.value = emptyForm()

    await loadGames()
  } catch (err) {
    if (err.response?.status === 422) {
      formError.value =
        'Sprawdź poprawność danych formularza.'
    } else if (err.response?.status === 403) {
      formError.value =
        'Nie masz uprawnień do tej operacji.'
    } else {
      formError.value =
        'Nie udało się zapisać gry.'
    }
  } finally {
    saving.value = false
  }
}

async function removeGame(game) {
  const confirmed = window.confirm(
    `Czy na pewno chcesz usunąć grę "${game.title}"?`
  )

  if (!confirmed) return

  deletingId.value = game.id
  error.value = ''
  successMessage.value = ''

  try {
    await gamesService.deleteGame(game.id)

    successMessage.value =
      `Gra "${game.title}" została usunięta.`

    await loadGames()
  } catch (err) {
    error.value =
      err.response?.status === 403
        ? 'Nie masz uprawnień do usunięcia gry.'
        : 'Nie udało się usunąć gry.'
  } finally {
    deletingId.value = null
  }
}

onMounted(loadGames)
</script>

<template>
  <main class="admin-games-page">
    <div class="admin-container">

      <RouterLink to="/admin" class="back-link">
        ← Panel administratora
      </RouterLink>

      <!-- Nagłówek -->
      <header class="page-header">
        <div>
          <span class="eyebrow">GAMEVERS ADMIN</span>

          <h1>Zarządzanie grami</h1>

          <p>
            Dodawaj, edytuj i usuwaj gry
            dostępne w katalogu.
          </p>
        </div>

        <button
          type="button"
          class="primary-button"
          @click="openCreateForm"
        >
          + Dodaj grę
        </button>
      </header>

      <!-- Powiadomienie o sukcesie -->
      <AppNotification
        v-if="successMessage"
        type="success"
        :message="successMessage"
        @close="successMessage = ''"
      />

      <!-- Powiadomienie o błędzie -->
      <AppNotification
        v-if="error"
        type="error"
        :message="error"
        @close="error = ''"
      />

      <!-- Formularz dodawania i edycji -->
      <section v-if="showForm" class="form-panel">
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
            :disabled="saving"
            @click="closeForm"
            aria-label="Zamknij formularz"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="saveGame">
          <div class="form-grid">

            <div class="field full-width">
              <label for="game-title">
                Tytuł gry *
              </label>

              <input
                id="game-title"
                v-model="form.title"
                type="text"
                minlength="2"
                maxlength="150"
                required
                :disabled="saving"
                placeholder="Np. Hollow Knight"
              />
            </div>

            <div class="field full-width">
              <label for="game-description">
                Opis gry *
              </label>

              <textarea
                id="game-description"
                v-model="form.description"
                rows="6"
                minlength="10"
                maxlength="5000"
                required
                :disabled="saving"
                placeholder="Opisz grę..."
              ></textarea>
            </div>

            <div class="field full-width">
              <label for="game-cover">
                URL okładki
              </label>

              <input
                id="game-cover"
                v-model="form.cover_url"
                type="url"
                :disabled="saving"
                placeholder="https://example.com/cover.jpg"
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
                :disabled="saving"
              />
            </div>

            <div class="field">
              <label for="game-developer">
                Producent
              </label>

              <input
                id="game-developer"
                v-model="form.developer"
                type="text"
                maxlength="150"
                :disabled="saving"
                placeholder="Nazwa studia"
              />
            </div>

            <div class="field">
              <label for="game-publisher">
                Wydawca
              </label>

              <input
                id="game-publisher"
                v-model="form.publisher"
                type="text"
                maxlength="150"
                :disabled="saving"
                placeholder="Nazwa wydawcy"
              />
            </div>

          </div>

          <!-- Błąd formularza -->
          <div v-if="formError" class="form-notification">
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
              :disabled="saving"
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
              :disabled="saving"
              @click="closeForm"
            >
              Anuluj
            </button>
          </div>
        </form>
      </section>

      <!-- Katalog -->
      <section class="catalog-panel">
        <div class="catalog-toolbar">
          <h2>Katalog gier</h2>

          <button
            type="button"
            class="secondary-button"
            :disabled="loading"
            @click="loadGames"
          >
            Odśwież
          </button>
        </div>

        <input
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Wyszukaj grę po tytule..."
          aria-label="Wyszukaj grę po tytule"
        />

        <div v-if="loading" class="state-message">
          Ładowanie gier...
        </div>

        <div
          v-else-if="games.length === 0"
          class="state-message"
        >
          Brak gier do wyświetlenia.
        </div>

        <div
          v-else-if="filteredGames.length === 0"
          class="state-message"
        >
          Nie znaleziono gier pasujących
          do wyszukiwania.
        </div>

        <div v-else class="games-list">
          <article
            v-for="game in filteredGames"
            :key="game.id"
            class="game-row"
          >
            <div class="game-info">
              <img
                v-if="game.cover_url"
                :src="game.cover_url"
                :alt="`Okładka ${game.title}`"
                class="game-thumbnail"
              />

              <div
                v-else
                class="thumbnail-placeholder"
                aria-hidden="true"
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
              </div>
            </div>

            <div class="game-actions">
              <RouterLink
                :to="`/games/${game.id}`"
                class="view-link"
              >
                Zobacz
              </RouterLink>

              <button
                type="button"
                class="edit-button"
                :disabled="deletingId !== null"
                @click="openEditForm(game)"
              >
                Edytuj
              </button>

              <button
                type="button"
                class="delete-button"
                :disabled="deletingId !== null"
                @click="removeGame(game)"
              >
                {{
                  deletingId === game.id
                    ? 'Usuwanie...'
                    : 'Usuń'
                }}
              </button>
            </div>
          </article>
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

.page-header p {
  color: #94A3B8;
  line-height: 1.7;
}

.primary-button,
.secondary-button,
.edit-button,
.delete-button {
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

.secondary-button {
  background: #24203C;
  border: 1px solid #443B73;
  color: #C4B5FD;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-panel,
.catalog-panel {
  padding: 26px;
  margin-bottom: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
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
.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font: inherit;
  font-size: 14px;
}

.field input:focus,
.field textarea:focus,
.search-input:focus {
  outline: none;
  border-color: #8B5CF6;
}

.field textarea {
  resize: vertical;
  line-height: 1.6;
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

.notification {
  margin-bottom: 22px;
}

.search-input {
  margin-bottom: 22px;
}

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

.game-info {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.game-thumbnail,
.thumbnail-placeholder {
  width: 65px;
  height: 65px;
  flex-shrink: 0;
  border-radius: 9px;
}

.game-thumbnail {
  object-fit: cover;
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

.state-message {
  padding: 35px 20px;
  color: #94A3B8;
  text-align: center;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}
</style>
