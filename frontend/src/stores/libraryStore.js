
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGameById } from '../data/games'

/* KONFIGURACJA */

const STORAGE_KEY = 'gamevers_library_v1'

export const LIBRARY_STATUSES = [
  {
    value: 'wishlist',
    label: 'Chcę zagrać',
    color: '#A78BFA'
  },
  {
    value: 'playing',
    label: 'Gram',
    color: '#22D3EE'
  },
  {
    value: 'completed',
    label: 'Ukończone',
    color: '#4ADE80'
  },
  {
    value: 'dropped',
    label: 'Porzucone',
    color: '#F87171'
  }
]

/* WALIDACJA STATUSU */

function isValidStatus(status) {
  return LIBRARY_STATUSES.some(
    item => item.value === status
  )
}

/* ODCZYT BIBLIOTEKI */

function loadLibrary() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return []
    }

    const seen = new Set()

    return parsed.filter(item => {
      if (
        !item ||
        !Number.isInteger(item.game_id) ||
        !getGameById(item.game_id) ||
        !isValidStatus(item.status) ||
        seen.has(item.game_id)
      ) {
        return false
      }

      seen.add(item.game_id)

      return true
    })

  } catch (error) {
    console.error(
      'Nie udało się odczytać biblioteki:',
      error
    )

    return []
  }
}

/* STORE BIBLIOTEKI */

export const useLibraryStore = defineStore(
  'library',
  () => {

    /* STAN */

    const entries = ref(loadLibrary())
    const error = ref('')

    /* ZAPISYWANIE DANYCH */

    function saveLibrary() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(entries.value)
        )

        error.value = ''

        return true

      } catch (err) {
        error.value =
          'Nie udało się zapisać biblioteki.'

        console.error(error.value, err)

        return false
      }
    }

    /* BEZPIECZNA AKTUALIZACJA */

    function commitEntries(nextEntries) {
      const previousEntries = entries.value

      entries.value = nextEntries

      if (!saveLibrary()) {
        entries.value = previousEntries
        return false
      }

      return true
    }

    /* PELNE DANE GIER */

    const library = computed(() => {
      return entries.value
        .map(entry => ({
          ...entry,
          game: getGameById(entry.game_id)
        }))
        .filter(entry => entry.game)
    })

    /* STATYSTYKI */

    const totalGames = computed(() => {
      return library.value.length
    })

    const wishlistCount = computed(() => {
      return library.value.filter(
        item => item.status === 'wishlist'
      ).length
    })

    const playingCount = computed(() => {
      return library.value.filter(
        item => item.status === 'playing'
      ).length
    })

    const completedCount = computed(() => {
      return library.value.filter(
        item => item.status === 'completed'
      ).length
    })

    const droppedCount = computed(() => {
      return library.value.filter(
        item => item.status === 'dropped'
      ).length
    })

    const completionRate = computed(() => {
      if (!totalGames.value) {
        return 0
      }

      return Math.round(
        completedCount.value /
        totalGames.value * 100
      )
    })

    const stats = computed(() => ({
      total: totalGames.value,
      wishlist: wishlistCount.value,
      playing: playingCount.value,
      completed: completedCount.value,
      dropped: droppedCount.value,
      completionRate: completionRate.value
    }))

    /* SPRAWDZANIE GRY */

    function hasGame(gameId) {
      const id = Number(gameId)

      return entries.value.some(
        item => item.game_id === id
      )
    }

    function getEntry(gameId) {
      const id = Number(gameId)

      return library.value.find(
        item => item.game_id === id
      ) || null
    }

    function getStatus(gameId) {
      return getEntry(gameId)?.status || null
    }

    function getStatusLabel(status) {
      return LIBRARY_STATUSES.find(
        item => item.value === status
      )?.label || 'Nieznany status'
    }

    /* DODAWANIE GRY */

    function addGame(
      gameId,
      status = 'wishlist'
    ) {
      error.value = ''

      const id = Number(gameId)

      if (!getGameById(id)) {
        error.value =
          'Nie znaleziono wybranej gry.'

        return false
      }

      if (!isValidStatus(status)) {
        error.value =
          'Nieprawidłowy status gry.'

        return false
      }

      if (hasGame(id)) {
        error.value =
          'Ta gra znajduje się już w bibliotece.'

        return false
      }

      const now = new Date().toISOString()

      return commitEntries([
        ...entries.value,
        {
          game_id: id,
          status,
          created_at: now,
          updated_at: now
        }
      ])
    }

    /* USUWANIE GRY */

    function removeGame(gameId) {
      error.value = ''

      const id = Number(gameId)

      if (!hasGame(id)) {
        error.value =
          'Tej gry nie ma w bibliotece.'

        return false
      }

      return commitEntries(
        entries.value.filter(
          item => item.game_id !== id
        )
      )
    }

    /* ZMIANA STATUSU */

    function updateStatus(gameId, status) {
      error.value = ''

      const id = Number(gameId)

      if (!isValidStatus(status)) {
        error.value =
          'Nieprawidłowy status gry.'

        return false
      }

      if (!hasGame(id)) {
        error.value =
          'Tej gry nie ma w bibliotece.'

        return false
      }

      return commitEntries(
        entries.value.map(item => {
          if (item.game_id !== id) {
            return item
          }

          return {
            ...item,
            status,
            updated_at: new Date().toISOString()
          }
        })
      )
    }

    /* SZYBKIE ZAPISYWANIE */

    function toggleGame(gameId) {
      if (hasGame(gameId)) {
        return removeGame(gameId)
      }

      return addGame(gameId, 'wishlist')
    }

    /* FILTROWANIE */

    function getGamesByStatus(status = 'all') {
      if (status === 'all') {
        return library.value
      }

      return library.value.filter(
        item => item.status === status
      )
    }

    /* WYSZUKIWANIE */

    function searchLibrary(query = '') {
      const normalize = value =>
        String(value ?? '')
          .toLowerCase()
          .replace(/ł/g, 'l')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

      const text = normalize(query.trim())

      if (!text) {
        return library.value
      }

      return library.value.filter(item => {
        const game = item.game

        return [
          game.title,
          game.developer,
          ...(game.genres || []),
          ...(game.platforms || [])
        ].some(value =>
          normalize(value).includes(text)
        )
      })
    }

    /* CZYSZCZENIE BIBLIOTEKI */

    function clearLibrary() {
      return commitEntries([])
    }

    /* PONOWNE WCZYTANIE */

    function reloadLibrary() {
      entries.value = loadLibrary()
      error.value = ''
    }

    /* CZYSZCZENIE BLEDU */

    function clearError() {
      error.value = ''
    }

    /* EKSPORT */

    return {
      entries,
      library,
      error,

      totalGames,
      wishlistCount,
      playingCount,
      completedCount,
      droppedCount,
      completionRate,
      stats,

      hasGame,
      getEntry,
      getStatus,
      getStatusLabel,

      addGame,
      removeGame,
      updateStatus,
      toggleGame,

      getGamesByStatus,
      searchLibrary,

      clearLibrary,
      reloadLibrary,
      clearError
    }
  }
)
