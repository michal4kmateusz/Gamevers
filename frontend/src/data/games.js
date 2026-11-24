
/*
|--------------------------------------------------------------------------
| GAMEVERS - DEMONSTRACYJNA BAZA GIER
|--------------------------------------------------------------------------
|
| Wspólne źródło danych dla frontendu.
| Oceny są przykładowe.
| W przyszłości dane zostaną zastąpione przez API Laravel.
|
*/

function steamImage(appId, file = 'header.jpg') {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/${file}`
}

const rawGames = [
  {
    id: 1,
    steam_id: 1091500,
    title: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    genres: ['RPG', 'Akcja', 'Otwarty świat'],
    platforms: ['PC', 'PS5', 'Xbox'],
    release_date: '2020-12-10',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    rating: 9.8,
    popular: true,
    featured: true,
    description: 'Futurystyczna gra RPG rozgrywająca się w Night City. Rozwijaj swoją postać, podejmuj decyzje i odkrywaj rozbudowany świat przyszłości.'
  },
  {
    id: 2,
    steam_id: 1245620,
    title: 'Elden Ring',
    slug: 'elden-ring',
    genres: ['RPG', 'Akcja', 'Otwarty świat'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    release_date: '2022-02-25',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    rating: 9.3,
    popular: true,
    featured: true,
    description: 'Rozbudowana gra fantasy z otwartym światem, wymagającą walką, eksploracją i wieloma możliwościami rozwoju postaci.'
  },
  {
    id: 3,
    steam_id: 1086940,
    title: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    genres: ['RPG', 'Turowe', 'Przygodowe'],
    platforms: ['PC', 'PS5', 'Xbox'],
    release_date: '2023-08-03',
    developer: 'Larian Studios',
    publisher: 'Larian Studios',
    rating: 9.6,
    popular: true,
    featured: true,
    description: 'Drużynowa gra RPG inspirowana Dungeons & Dragons. Rozwijaj bohaterów i podejmuj decyzje wpływające na przebieg historii.'
  },
  {
    id: 4,
    steam_id: 292030,
    title: 'Wiedźmin 3: Dziki Gon',
    slug: 'wiedzmin-3',
    genres: ['RPG', 'Akcja', 'Otwarty świat'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2015-05-19',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    rating: 9.5,
    popular: true,
    featured: false,
    description: 'Przygoda Geralta z Rivii w rozległym świecie fantasy pełnym niezwykłych postaci, tajemnic i trudnych wyborów.'
  },
  {
    id: 5,
    steam_id: 1145360,
    title: 'Hades',
    slug: 'hades',
    genres: ['Roguelike', 'Akcja', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2020-09-17',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    rating: 9.1,
    popular: true,
    featured: false,
    description: 'Dynamiczna gra roguelike inspirowana mitologią grecką, łącząca rozwój postaci z kolejnymi próbami ucieczki z podziemi.'
  },
  {
    id: 6,
    steam_id: 367520,
    title: 'Hollow Knight',
    slug: 'hollow-knight',
    genres: ['Metroidvania', 'Przygodowe', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2017-02-24',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    rating: 9.4,
    popular: false,
    featured: true,
    description: 'Odkrywaj ręcznie rysowany świat Hallownest, poznawaj jego mieszkańców i odkrywaj tajemnice zapomnianego królestwa.'
  },
  {
    id: 7,
    steam_id: 1174180,
    title: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    genres: ['Akcja', 'Przygodowe', 'Otwarty świat'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    release_date: '2018-10-26',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    rating: 9.7,
    popular: true,
    featured: false,
    description: 'Rozbudowana przygoda osadzona u schyłku epoki Dzikiego Zachodu, skupiona na historii Arthura Morgana.'
  },
  {
    id: 8,
    steam_id: 730,
    title: 'Counter-Strike 2',
    slug: 'counter-strike-2',
    genres: ['FPS', 'Akcja', 'Multiplayer'],
    platforms: ['PC'],
    release_date: '2023-09-27',
    developer: 'Valve',
    publisher: 'Valve',
    rating: 8.4,
    popular: true,
    featured: false,
    description: 'Drużynowa gra sieciowa oparta na współpracy, refleksie i rywalizacji pomiędzy graczami.'
  },
  {
    id: 9,
    steam_id: 570,
    title: 'Dota 2',
    slug: 'dota-2',
    genres: ['MOBA', 'Strategiczne', 'Multiplayer'],
    platforms: ['PC'],
    release_date: '2013-07-09',
    developer: 'Valve',
    publisher: 'Valve',
    rating: 8.7,
    popular: true,
    featured: false,
    description: 'Strategiczna gra drużynowa z rozbudowaną listą bohaterów i wieloma możliwościami współpracy.'
  },
  {
    id: 10,
    steam_id: 1172470,
    title: 'Apex Legends',
    slug: 'apex-legends',
    genres: ['FPS', 'Battle Royale', 'Multiplayer'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2019-02-04',
    developer: 'Respawn Entertainment',
    publisher: 'Electronic Arts',
    rating: 8.2,
    popular: false,
    featured: false,
    description: 'Dynamiczna gra sieciowa z unikalnymi bohaterami, specjalnymi zdolnościami i drużynową rozgrywką.'
  },
  {
    id: 11,
    steam_id: 1551360,
    title: 'Forza Horizon 5',
    slug: 'forza-horizon-5',
    genres: ['Wyścigowe', 'Otwarty świat'],
    platforms: ['PC', 'Xbox', 'PS5'],
    release_date: '2021-11-09',
    developer: 'Playground Games',
    publisher: 'Xbox Game Studios',
    rating: 9.0,
    popular: true,
    featured: false,
    description: 'Festiwal motoryzacyjny w otwartym świecie inspirowanym Meksykiem, oferujący wiele samochodów i wydarzeń wyścigowych.'
  },
  {
    id: 12,
    steam_id: 244210,
    title: 'Assetto Corsa',
    slug: 'assetto-corsa',
    genres: ['Wyścigowe', 'Symulacyjne'],
    platforms: ['PC', 'PlayStation', 'Xbox'],
    release_date: '2014-12-19',
    developer: 'Kunos Simulazioni',
    publisher: 'Kunos Simulazioni',
    rating: 8.8,
    popular: false,
    featured: false,
    description: 'Symulator wyścigów samochodowych skupiony na realistycznym modelu jazdy i odwzorowaniu torów.'
  },
  {
    id: 13,
    steam_id: 413150,
    title: 'Stardew Valley',
    slug: 'stardew-valley',
    genres: ['Symulacyjne', 'RPG', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'],
    release_date: '2016-02-26',
    developer: 'ConcernedApe',
    publisher: 'ConcernedApe',
    rating: 9.5,
    popular: true,
    featured: false,
    description: 'Spokojna gra o prowadzeniu farmy, rozwijaniu gospodarstwa, poznawaniu mieszkańców i odkrywaniu okolicy.'
  },
  {
    id: 14,
    steam_id: 105600,
    title: 'Terraria',
    slug: 'terraria',
    genres: ['Sandbox', 'Przygodowe', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'],
    release_date: '2011-05-16',
    developer: 'Re-Logic',
    publisher: 'Re-Logic',
    rating: 9.4,
    popular: false,
    featured: false,
    description: 'Dwuwymiarowy świat pełen eksploracji, budowania, tworzenia przedmiotów i odkrywania nowych obszarów.'
  },
  {
    id: 15,
    steam_id: 1623730,
    title: 'Palworld',
    slug: 'palworld',
    genres: ['Survival', 'Otwarty świat', 'Przygodowe'],
    platforms: ['PC', 'Xbox', 'PS5'],
    release_date: '2024-01-19',
    developer: 'Pocketpair',
    publisher: 'Pocketpair',
    rating: 8.5,
    popular: false,
    featured: false,
    description: 'Gra survivalowa łącząca eksplorację, budowanie bazy i kolekcjonowanie fantastycznych stworzeń.'
  },
  {
    id: 16,
    steam_id: 892970,
    title: 'Valheim',
    slug: 'valheim',
    genres: ['Survival', 'Sandbox', 'Niezależne'],
    platforms: ['PC', 'Xbox'],
    release_date: '2021-02-02',
    developer: 'Iron Gate Studio',
    publisher: 'Coffee Stain Publishing',
    rating: 8.9,
    popular: false,
    featured: false,
    description: 'Przygoda survivalowa inspirowana mitologią nordycką, z eksploracją, budowaniem i rozgrywką kooperacyjną.'
  },
  {
    id: 17,
    steam_id: 526870,
    title: 'Satisfactory',
    slug: 'satisfactory',
    genres: ['Symulacyjne', 'Strategiczne', 'Sandbox'],
    platforms: ['PC'],
    release_date: '2024-09-10',
    developer: 'Coffee Stain Studios',
    publisher: 'Coffee Stain Publishing',
    rating: 9.2,
    popular: false,
    featured: false,
    description: 'Buduj rozbudowane fabryki, automatyzuj produkcję i zarządzaj zasobami na obcej planecie.'
  },
  {
    id: 18,
    steam_id: 427520,
    title: 'Factorio',
    slug: 'factorio',
    genres: ['Strategiczne', 'Symulacyjne', 'Niezależne'],
    platforms: ['PC', 'Switch'],
    release_date: '2020-08-14',
    developer: 'Wube Software',
    publisher: 'Wube Software',
    rating: 9.6,
    popular: false,
    featured: false,
    description: 'Gra o projektowaniu fabryk, automatyzacji procesów i optymalizowaniu rozbudowanych systemów produkcyjnych.'
  },
  {
    id: 19,
    steam_id: 289070,
    title: "Sid Meier's Civilization VI",
    slug: 'civilization-6',
    genres: ['Strategiczne', 'Turowe'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'],
    release_date: '2016-10-21',
    developer: 'Firaxis Games',
    publisher: '2K',
    rating: 8.8,
    popular: false,
    featured: false,
    description: 'Rozwijaj cywilizację na przestrzeni epok, zarządzaj miastami, technologią, kulturą i dyplomacją.'
  },
  {
    id: 20,
    steam_id: 813780,
    title: 'Age of Empires II: Definitive Edition',
    slug: 'age-of-empires-2',
    genres: ['Strategiczne', 'RTS'],
    platforms: ['PC', 'Xbox'],
    release_date: '2019-11-14',
    developer: 'Forgotten Empires',
    publisher: 'Xbox Game Studios',
    rating: 9.0,
    popular: false,
    featured: false,
    description: 'Odświeżona klasyczna strategia czasu rzeczywistego, w której rozwijasz gospodarkę i historyczne cywilizacje.'
  },
  {
    id: 21,
    steam_id: 620,
    title: 'Portal 2',
    slug: 'portal-2',
    genres: ['Logiczne', 'Przygodowe'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2011-04-19',
    developer: 'Valve',
    publisher: 'Valve',
    rating: 9.7,
    popular: false,
    featured: false,
    description: 'Kreatywna gra logiczna wykorzystująca mechanikę portali, pełna zagadek przestrzennych i charakterystycznego humoru.'
  },
  {
    id: 22,
    steam_id: 1426210,
    title: 'It Takes Two',
    slug: 'it-takes-two',
    genres: ['Przygodowe', 'Platformowe', 'Kooperacja'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2021-03-26',
    developer: 'Hazelight Studios',
    publisher: 'Electronic Arts',
    rating: 9.3,
    popular: false,
    featured: false,
    description: 'Przygoda zaprojektowana dla dwóch graczy, wymagająca współpracy i rozwiązywania kreatywnych zagadek.'
  },
  {
    id: 23,
    steam_id: 504230,
    title: 'Celeste',
    slug: 'celeste',
    genres: ['Platformowe', 'Przygodowe', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2018-01-25',
    developer: 'Maddy Makes Games',
    publisher: 'Maddy Makes Games',
    rating: 9.4,
    popular: false,
    featured: false,
    description: 'Precyzyjna gra platformowa opowiadająca historię Madeline i jej niezwykłej podróży na szczyt góry.'
  },
  {
    id: 24,
    steam_id: 268910,
    title: 'Cuphead',
    slug: 'cuphead',
    genres: ['Platformowe', 'Akcja', 'Niezależne'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2017-09-29',
    developer: 'Studio MDHR',
    publisher: 'Studio MDHR',
    rating: 9.0,
    popular: false,
    featured: false,
    description: 'Wymagająca gra zręcznościowa wyróżniająca się ręcznie rysowaną animacją inspirowaną kreskówkami z lat trzydziestych.'
  },
  {
    id: 25,
    steam_id: 553850,
    title: 'Helldivers 2',
    slug: 'helldivers-2',
    genres: ['Akcja', 'Kooperacja', 'Multiplayer'],
    platforms: ['PC', 'PS5', 'Xbox'],
    release_date: '2024-02-08',
    developer: 'Arrowhead Game Studios',
    publisher: 'Sony Interactive Entertainment',
    rating: 8.8,
    popular: true,
    featured: false,
    description: 'Kooperacyjna gra science fiction, w której gracze wspólnie realizują misje na odległych planetach.'
  },
  {
    id: 26,
    steam_id: 1593500,
    title: 'God of War',
    slug: 'god-of-war',
    genres: ['Akcja', 'Przygodowe'],
    platforms: ['PC', 'PlayStation'],
    release_date: '2018-04-20',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    rating: 9.5,
    popular: false,
    featured: false,
    description: 'Przygoda Kratosa i Atreusa w świecie inspirowanym mitologią nordycką, skupiona na ich relacji i wspólnej podróży.'
  },
  {
    id: 27,
    steam_id: 1817070,
    title: "Marvel's Spider-Man Remastered",
    slug: 'spider-man-remastered',
    genres: ['Akcja', 'Przygodowe', 'Otwarty świat'],
    platforms: ['PC', 'PS5'],
    release_date: '2020-11-12',
    developer: 'Insomniac Games',
    publisher: 'Sony Interactive Entertainment',
    rating: 9.0,
    popular: false,
    featured: false,
    description: 'Wciel się w Spider-Mana i odkrywaj Nowy Jork, korzystając z wyjątkowych zdolności bohatera.'
  },
  {
    id: 28,
    steam_id: 1151640,
    title: 'Horizon Zero Dawn',
    slug: 'horizon-zero-dawn',
    genres: ['RPG', 'Akcja', 'Otwarty świat'],
    platforms: ['PC', 'PlayStation'],
    release_date: '2017-02-28',
    developer: 'Guerrilla Games',
    publisher: 'Sony Interactive Entertainment',
    rating: 8.9,
    popular: false,
    featured: false,
    description: 'Poznaj historię Aloy w niezwykłym świecie, w którym natura współistnieje z zaawansowanymi maszynami.'
  },
  {
    id: 29,
    steam_id: 264710,
    title: 'Subnautica',
    slug: 'subnautica',
    genres: ['Survival', 'Przygodowe', 'Otwarty świat'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2018-01-23',
    developer: 'Unknown Worlds Entertainment',
    publisher: 'Unknown Worlds Entertainment',
    rating: 9.2,
    popular: false,
    featured: false,
    description: 'Eksploruj podwodny świat obcej planety, odkrywaj nowe gatunki stworzeń i rozwijaj swoją bazę.'
  },
  {
    id: 30,
    steam_id: 632360,
    title: 'Risk of Rain 2',
    slug: 'risk-of-rain-2',
    genres: ['Roguelike', 'Akcja', 'Kooperacja'],
    platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'],
    release_date: '2020-08-11',
    developer: 'Hopoo Games',
    publisher: 'Gearbox Publishing',
    rating: 9.1,
    popular: false,
    featured: false,
    description: 'Trójwymiarowa gra roguelike z różnorodnymi postaciami, przedmiotami i zmieniającymi się wyzwaniami.'
  }
]

/*
|--------------------------------------------------------------------------
| PRZYGOTOWANIE DANYCH
|--------------------------------------------------------------------------
*/

export const games = rawGames.map(game => ({
  ...game,

  cover_url: steamImage(game.steam_id),

  image: steamImage(game.steam_id),

  banner_url: steamImage(
    game.steam_id,
    'library_hero.jpg'
  ),

  poster_url: steamImage(
    game.steam_id,
    'library_600x900.jpg'
  ),

  genre: game.genres.join(' · '),

  average_rating: game.rating,

  is_demo: true
}))

/*
|--------------------------------------------------------------------------
| LISTA GATUNKOW
|--------------------------------------------------------------------------
*/

export const genres = [
  ...new Set(
    games.flatMap(game => game.genres)
  )
].sort((a, b) => a.localeCompare(b, 'pl'))

/*
|--------------------------------------------------------------------------
| LISTA PLATFORM
|--------------------------------------------------------------------------
*/

export const platforms = [
  ...new Set(
    games.flatMap(game => game.platforms)
  )
].sort((a, b) => a.localeCompare(b, 'pl'))

/*
|--------------------------------------------------------------------------
| KATEGORIE STRONY GLOWNEJ
|--------------------------------------------------------------------------
*/

export const categories = [
  {
    name: 'RPG',
    description: 'Twoja postać. Twoja historia.',
    image: steamImage(1086940)
  },
  {
    name: 'Akcja',
    description: 'Dynamiczna rozgrywka i wyzwania.',
    image: steamImage(1145360)
  },
  {
    name: 'Otwarty świat',
    description: 'Odkrywaj bez ograniczeń.',
    image: steamImage(1245620)
  },
  {
    name: 'Niezależne',
    description: 'Małe studia. Wielkie pomysły.',
    image: steamImage(367520)
  }
].map(category => ({
  ...category,
  games_count: games.filter(game =>
    game.genres.includes(category.name)
  ).length
}))

/*
|--------------------------------------------------------------------------
| POBIERANIE GIER
|--------------------------------------------------------------------------
*/

export function getAllGames() {
  return [...games]
}

export function getGameById(id) {
  return games.find(game =>
    game.id === Number(id)
  ) || null
}

export function getGameBySlug(slug) {
  return games.find(game =>
    game.slug === slug
  ) || null
}

export function getPopularGames(limit = 4) {
  return games
    .filter(game => game.popular)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

export function getFeaturedGames() {
  return games.filter(game => game.featured)
}

export function getTopRatedGames(limit = 10) {
  return [...games]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}

export function getNewestGames(limit = 10) {
  return [...games]
    .sort((a, b) =>
      b.release_date.localeCompare(a.release_date)
    )
    .slice(0, limit)
}

export function getGamesByGenre(genre) {
  return games.filter(game =>
    game.genres.includes(genre)
  )
}

export function getGamesByPlatform(platform) {
  return games.filter(game =>
    game.platforms.includes(platform)
  )
}

/*
|--------------------------------------------------------------------------
| NORMALIZACJA TEKSTU
|--------------------------------------------------------------------------
*/

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim()
}

/*
|--------------------------------------------------------------------------
| WYSZUKIWARKA
|--------------------------------------------------------------------------
*/

export function searchGames(query = '') {
  const search = normalizeText(query)

  if (!search) {
    return getAllGames()
  }

  return games.filter(game => {
    const searchableText = normalizeText([
      game.title,
      game.developer,
      game.publisher,
      game.description,
      ...game.genres,
      ...game.platforms
    ].join(' '))

    return searchableText.includes(search)
  })
}

/*
|--------------------------------------------------------------------------
| FILTROWANIE I SORTOWANIE
|--------------------------------------------------------------------------
*/

export function filterGames(options = {}) {
  const {
    search = '',
    genre = '',
    platform = '',
    minRating = 0,
    sort = 'popular'
  } = options

  let result = searchGames(search)

  if (
    genre &&
    genre !== 'all' &&
    genre !== 'Wszystkie gry'
  ) {
    result = result.filter(game =>
      game.genres.some(item =>
        normalizeText(item) === normalizeText(genre)
      )
    )
  }

  if (
    platform &&
    platform !== 'all' &&
    platform !== 'Wszystkie platformy'
  ) {
    result = result.filter(game =>
      game.platforms.some(item =>
        normalizeText(item) === normalizeText(platform)
      )
    )
  }

  if (Number(minRating) > 0) {
    result = result.filter(game =>
      game.rating >= Number(minRating)
    )
  }

  switch (sort) {
    case 'rating':
      result.sort((a, b) =>
        b.rating - a.rating
      )
      break

    case 'newest':
      result.sort((a, b) =>
        b.release_date.localeCompare(a.release_date)
      )
      break

    case 'oldest':
      result.sort((a, b) =>
        a.release_date.localeCompare(b.release_date)
      )
      break

    case 'title-asc':
      result.sort((a, b) =>
        a.title.localeCompare(b.title, 'pl')
      )
      break

    case 'title-desc':
      result.sort((a, b) =>
        b.title.localeCompare(a.title, 'pl')
      )
      break

    case 'popular':
    default:
      result.sort((a, b) =>
        Number(b.popular) - Number(a.popular) ||
        b.rating - a.rating
      )
      break
  }

  return result
}

/*
|--------------------------------------------------------------------------
| PODOBNE GRY
|--------------------------------------------------------------------------
*/

export function getRelatedGames(gameId, limit = 4) {
  const currentGame = getGameById(gameId)

  if (!currentGame) {
    return []
  }

  return games
    .filter(game => game.id !== currentGame.id)
    .map(game => ({
      game,
      similarity: game.genres.filter(genre =>
        currentGame.genres.includes(genre)
      ).length
    }))
    .filter(item => item.similarity > 0)
    .sort((a, b) =>
      b.similarity - a.similarity ||
      b.game.rating - a.game.rating
    )
    .slice(0, limit)
    .map(item => item.game)
}

/*
|--------------------------------------------------------------------------
| STATYSTYKI KATALOGU
|--------------------------------------------------------------------------
*/

export function getCatalogStats() {
  return {
    totalGames: games.length,
    totalGenres: genres.length,
    totalPlatforms: platforms.length,
    popularGames: games.filter(
      game => game.popular
    ).length,
    featuredGames: games.filter(
      game => game.featured
    ).length
  }
}

export default games
