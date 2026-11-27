import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  getFavorites,
  addFavorite,
  updateFavorite,
  removeFavorite
} from '../services/favoriteService'

/* KONFIGURACJA */

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

function isValidStatus(status) {
  return LIBRARY_STATUSES.some(
    item => item.value === status
  )
}

/* STORE BIBLIOTEKI */

export const useLibraryStore = defineStore(
  'library',
  () => {

    /* STAN */

    const entries = ref([])
    const error = ref('')
    const loading = ref(false)
    const saving = ref(false)

    let sessionVersion = 0
    let requestVersion = 0

    /* PELNE DANE GIER */

    const library = computed(() => {
      return entries.value
        .filter(entry => entry.game)
        .map(entry => ({
          ...entry,
          game: {
            ...entry.game,
            genres: entry.game.categories?.map(
              category => category.name
            ) || [],
            platforms: entry.game.platforms || []
          }
        }))
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

    /* POBIERANIE BIBLIOTEKI Z API */

    async function fetchLibrary() {
      const session = sessionVersion
      const request = ++requestVersion

      loading.value = true
      error.value = ''

      try {
        const data = await getFavorites()

        if (
          session !== sessionVersion ||
          request !== requestVersion
        ) {
          return false
        }

        entries.value = data

        return true

      } catch (err) {
        if (
          session !== sessionVersion ||
          request !== requestVersion
        ) {
          return false
        }

        error.value =
          'Nie udało się pobrać biblioteki.'

        if (err.response?.status === 401) {
          entries.value = []
        }

        return false

      } finally {
        if (
          session === sessionVersion &&
          request === requestVersion
        ) {
          loading.value = false
        }
      }
    }

    /* SPRAWDZANIE GRY */

    function hasGame(gameId) {
      const id = Number(gameId)

      return entries.value.some(
        item => Number(item.game_id) === id
      )
    }

    function getEntry(gameId) {
      const id = Number(gameId)

      return library.value.find(
        item => Number(item.game_id) === id
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

    /* WSPOLNA OBSLUGA ZAPISU */

    async function performMutation(action, message) {
      if (saving.value) {
        return false
      }

      const session = sessionVersion

      saving.value = true
      error.value = ''

      try {
        await action()

        if (session !== sessionVersion) {
          return false
        }

        return await fetchLibrary()

      } catch (err) {
        if (session !== sessionVersion) {
          return false
        }

        error.value =
          err.response?.status === 401
            ? 'Musisz się zalogować.'
            : message

        return false

      } finally {
        if (session === sessionVersion) {
          saving.value = false
        }
      }
    }

    /* DODAWANIE GRY */

    async function addGame(
      gameId,
      status = 'wishlist'
    ) {
      const id = Number(gameId)

      if (!Number.isInteger(id) || id <= 0) {
        error.value = 'Nieprawidłowe ID gry.'
        return false
      }

      if (!isValidStatus(status)) {
        error.value = 'Nieprawidłowy status gry.'
        return false
      }

      if (hasGame(id)) {
        error.value =
          'Ta gra znajduje się już w bibliotece.'

        return false
      }

      return performMutation(
        () => addFavorite(id, status),
        'Nie udało się dodać gry.'
      )
    }

    /* USUWANIE GRY */

    async function removeGame(gameId) {
      const id = Number(gameId)

      if (!hasGame(id)) {
        error.value =
          'Tej gry nie ma w bibliotece.'

        return false
      }

      return performMutation(
        () => removeFavorite(id),
        'Nie udało się usunąć gry.'
      )
    }

    /* ZMIANA STATUSU */

    async function updateStatus(gameId, status) {
      const id = Number(gameId)

      if (!isValidStatus(status)) {
        error.value = 'Nieprawidłowy status gry.'
        return false
      }

      if (!hasGame(id)) {
        error.value =
          'Tej gry nie ma w bibliotece.'

        return false
      }

      return performMutation(
        () => updateFavorite(id, status),
        'Nie udało się zmienić statusu gry.'
      )
    }

    /* SZYBKIE ZAPISYWANIE */

    async function toggleGame(gameId) {
      if (hasGame(gameId)) {
        return await removeGame(gameId)
      }

      return await addGame(gameId, 'wishlist')
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

    /* CZYSZCZENIE LOKALNEGO STANU */

    function clearLibrary() {
      sessionVersion++
      requestVersion++

      entries.value = []
      error.value = ''
      loading.value = false
      saving.value = false

      return true
    }

    /* PONOWNE WCZYTANIE */

    async function reloadLibrary() {
      return await fetchLibrary()
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
      loading,
      saving,

      totalGames,
      wishlistCount,
      playingCount,
      completedCount,
      droppedCount,
      completionRate,
      stats,

      fetchLibrary,

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
