import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLibraryStore } from './libraryStore'

export const useFavoriteStore = defineStore(
  'favorites',
  () => {
    const libraryStore = useLibraryStore()

    const favorites = computed(() => {
      return libraryStore.library.map(
        entry => entry.game
      )
    })

    const loading = computed(() => {
      return libraryStore.loading
    })

    const error = computed(() => {
      return libraryStore.error
    })

    const favoriteCount = computed(() => {
      return libraryStore.totalGames
    })

    function isFavorite(gameId) {
      return libraryStore.hasGame(gameId)
    }

    async function fetchFavorites() {
      return await libraryStore.fetchLibrary()
    }

    async function addGame(gameId) {
      return await libraryStore.addGame(gameId)
    }

    async function removeGame(gameId) {
      return await libraryStore.removeGame(gameId)
    }

    async function toggleFavorite(gameId) {
      return await libraryStore.toggleGame(gameId)
    }

    function clearFavorites() {
      return libraryStore.clearLibrary()
    }

    return {
      favorites,
      loading,
      error,
      favoriteCount,

      isFavorite,
      fetchFavorites,
      addGame,
      removeGame,
      toggleFavorite,
      clearFavorites
    }
  }
)
