
<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'

const searchQuery = ref('')

// Dane demonstracyjne.
// Później będą pobierane z API Laravel.
const games = ref([
  {
    id: 1,
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    release_year: 2020
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    release_year: 2015
  },
  {
    id: 3,
    title: 'Minecraft',
    genre: 'Sandbox',
    release_year: 2011
  },
  {
    id: 4,
    title: 'Red Dead Redemption 2',
    genre: 'Akcja',
    release_year: 2018
  }
])

const filteredGames = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return games.value.filter(game =>
    game.title.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="admin-games-page">
    <div class="container">
      <RouterLink to="/admin" class="back-link">
        ← Panel administratora
      </RouterLink>

      <header class="page-header">
        <div>
          <h1>Zarządzanie grami</h1>
          <p>Przeglądaj i zarządzaj katalogiem Gamevers.</p>
        </div>

        <button type="button" class="add-button" disabled>
          + Dodaj grę
        </button>
      </header>

      <div class="toolbar">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Szukaj gry..."
          aria-label="Szukaj gry"
        />

        <span class="games-count">
          Liczba gier: {{ filteredGames.length }}
        </span>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tytuł</th>
              <th>Gatunek</th>
              <th>Rok</th>
              <th>Akcje</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="game in filteredGames"
              :key="game.id"
            >
              <td>{{ game.id }}</td>

              <td>
                <RouterLink :to="`/games/${game.id}`">
                  {{ game.title }}
                </RouterLink>
              </td>

              <td>{{ game.genre }}</td>
              <td>{{ game.release_year }}</td>

              <td>
                <div class="actions">
                  <button type="button" disabled>
                    Edytuj
                  </button>
                  <button
                    type="button"
                    class="delete-button"
                    disabled
                  >
                    Usuń
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredGames.length">
              <td colspan="5" class="empty-state">
                Nie znaleziono gier.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="demo-notice">
        To demonstracyjny moduł administratora.
        Dodawanie, edycja i usuwanie gier będą
        dostępne po podłączeniu API Laravel
        oraz zabezpieczeniu uprawnień.
      </p>
    </div>
  </div>
</template>

<style scoped>
.admin-games-page {
  min-height: 75vh;
  padding: 48px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 32px;
  color: #A78BFA;
  font-weight: 600;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: clamp(28px, 5vw, 42px);
  margin-bottom: 10px;
}

.page-header p,
.games-count,
.demo-notice {
  color: #94A3B8;
}

.add-button {
  padding: 13px 20px;
  background: #8B5CF6;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.toolbar input {
  width: 100%;
  max-width: 420px;
  padding: 14px 16px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #F8FAFC;
  outline: none;
}

.toolbar input:focus {
  border-color: #8B5CF6;
}

.table-wrapper {
  overflow-x: auto;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

th,
td {
  padding: 18px;
  text-align: left;
  border-bottom: 1px solid #293244;
}

th {
  color: #94A3B8;
  font-size: 13px;
}

td {
  font-size: 14px;
}

td a {
  color: #F8FAFC;
  font-weight: 600;
}

td a:hover {
  color: #A78BFA;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 12px;
  background: #293244;
  border: none;
  border-radius: 7px;
  color: #CBD5E1;
}

.actions .delete-button {
  color: #F87171;
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #94A3B8;
  padding: 32px;
}

.demo-notice {
  margin-top: 28px;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .admin-games-page {
    padding: 32px 16px;
  }

  .page-header,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar input {
    max-width: none;
  }
}
</style>
