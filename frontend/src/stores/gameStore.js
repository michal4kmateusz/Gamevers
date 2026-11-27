
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import {
  getGames,
  getGame
} from '../services/gameService'

import {
  getCategories
} from '../services/categoryService'

export const useGameStore = defineStore('games', () => {

  /* STAN */

  const games = ref([])
  const categories = ref([])
  const selectedGame = ref(null)

  const loading = ref(false)
  const categoriesLoading = ref(false)
  const gameLoading = ref(false)

  const error = ref(null)
  const categoriesError = ref(null)
  const gameError = ref(null)

  /* PAGINACJA */

  const currentPage = ref(1)
  const lastPage = ref(1)
  const totalGames = ref(0)
  const perPage = ref(12)

  /* DANE OBLICZANE */

  const featuredGames = computed(() => {
    return games.value.filter(
      game => game.is_featured
    )
  })

  const popularGames = computed(() => {
    return [...games.value].sort(
      (a, b) => Number(b.views) - Number(a.views)
    )
  })

  const hasNextPage = computed(() => {
    return currentPage.value < lastPage.value
  })

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })

  /* POBIERANIE GIER */

  async function fetchGames(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await getGames(params)

      games.value = response.data

      currentPage.value = response.current_page
      lastPage.value = response.last_page
      totalGames.value = response.total
      perPage.value = response.per_page

      return true

    } catch (err) {
      error.value = 'Nie udało się pobrać gier.'

      console.error(err)

      return false

    } finally {
      loading.value = false
    }
  }

  /* POBIERANIE KATEGORII */

  async function fetchCategories() {
    categoriesLoading.value = true
    categoriesError.value = null

    try {
      const response = await getCategories()

      categories.value = Array.isArray(response)
        ? response
        : response.data

      return true

    } catch (err) {
      categoriesError.value =
        'Nie udało się pobrać kategorii.'

      console.error(err)

      return false

    } finally {
      categoriesLoading.value = false
    }
  }

  /* POBIERANIE POJEDYNCZEJ GRY */

  async function fetchGame(slug) {
    gameLoading.value = true
    gameError.value = null
    selectedGame.value = null

    try {
      const response = await getGame(slug)

      selectedGame.value = response.data ?? response

      return true

    } catch (err) {
      gameError.value =
        err.response?.status === 404
          ? 'Nie znaleziono gry.'
          : 'Nie udało się pobrać gry.'

      console.error(err)

      return false

    } finally {
      gameLoading.value = false
    }
  }

  /* ZMIANA STRONY */

  async function changePage(page, params = {}) {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > lastPage.value
    ) {
      return false
    }

    return await fetchGames({
      ...params,
      page
    })
  }

  /* CZYSZCZENIE WYBRANEJ GRY */

  function clearSelectedGame() {
    selectedGame.value = null
    gameError.value = null
  }

  /* EKSPORT */

  return {
    games,
    categories,
    selectedGame,

    loading,
    categoriesLoading,
    gameLoading,

    error,
    categoriesError,
    gameError,

    currentPage,
    lastPage,
    totalGames,
    perPage,

    featuredGames,
    popularGames,
    hasNextPage,
    hasPreviousPage,

    fetchGames,
    fetchCategories,
    fetchGame,
    changePage,
    clearSelectedGame
  }
})

