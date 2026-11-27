
export function normalizeGame(game) {
  if (!game) return null

  const categories = Array.isArray(game.categories)
    ? game.categories
    : []

  const genres = categories.map(category =>
    typeof category === 'string'
      ? category
      : category.name
  ).filter(Boolean)

  let platforms = game.platforms || []

  if (typeof platforms === 'string') {
    try {
      platforms = JSON.parse(platforms)
    } catch {
      platforms = []
    }
  }

  if (!Array.isArray(platforms)) {
    platforms = []
  }

  // Liczba prawdziwych recenzji
  const reviewsCount = Number(game.reviews_count || 0)

  // Prawdziwa srednia ocen
  const realRating =
    game.average_rating != null &&
    Number.isFinite(Number(game.average_rating))
      ? Number(game.average_rating)
      : null

  // Ocena demonstracyjna
  const demoRating =
    game.demo_rating != null &&
    Number.isFinite(Number(game.demo_rating))
      ? Number(game.demo_rating)
      : null

  // Ocena wyswietlana
  const rating = realRating ?? demoRating

  const cover = game.thumbnail || game.cover_url || ''
  const banner = game.banner || game.banner_url || cover

  return {
    ...game,

    id: Number(game.id),

    genres,
    genre: genres.join(' · '),
    platforms,

    cover_url: cover,
    image: cover,
    banner_url: banner,
    poster_url: game.poster_url || cover,
    gif_url: game.gif_url || null,

    rating,
    average_rating: realRating,
    demo_rating: demoRating,
    display_rating: rating,
    reviews_count: reviewsCount,

    is_demo_rating: realRating === null && demoRating !== null,
    has_reviews: reviewsCount > 0,

    release_year: game.release_date
      ? Number(String(game.release_date).slice(0, 4))
      : null,

    views: Number(game.views || 0),

    is_featured: Boolean(Number(game.is_featured)),
    is_popular: Boolean(Number(game.is_popular)),

    featured: Boolean(Number(game.is_featured)),
    popular: Boolean(Number(game.is_popular))
  }
}

export default normalizeGame

