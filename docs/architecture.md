
GAMEVERS — Dokumentacja architektury systemu
Nazwa projektu: Gamevers
Plik: docs/architecture.md
Wersja: 1.0
Data: 23.11.2026
Status: Architektura projektowa MVP
Czas realizacji: 3 tygodnie / 15 dni roboczych
Zespół: 2 programistów
Technologie: Vue 3, Laravel, MySQL 8, Tailwind CSS
1. Cel dokumentu
Celem dokumentu jest przedstawienie kompletnej architektury technicznej aplikacji internetowej Gamevers.
Dokument opisuje:
Architekturę całego systemu.
Technologie i ich zastosowanie.
Strukturę repozytorium.
Strukturę projektu frontendowego.
Strukturę projektu backendowego.
Organizację bazy danych.
Komunikację frontend–backend.
System uwierzytelniania i autoryzacji.
Podział aplikacji na moduły.
Przepływ danych.
Organizację komponentów Vue.
Organizację kontrolerów Laravel.
Obsługę błędów.
Bezpieczeństwo.
Integrację projektu z Figmy.
Strategię testowania.
Organizację pracy na GitHubie.
Podział obowiązków.
Harmonogram 15 dni roboczych.
Kryteria ukończenia projektu.
Dokument jest przeznaczony dla obu programistów oraz opiekuna praktyk.
2. Charakterystyka systemu
2.1. Opis
Gamevers jest portalem internetowym służącym do odkrywania, przeglądania i oceniania gier komputerowych oraz zarządzania prywatną biblioteką gier.
Użytkownicy mogą:
Przeglądać katalog gier.
Wyszukiwać gry.
Filtrować katalog.
Sortować wyniki.
Wyświetlać szczegółowe informacje.
Rejestrować konta.
Logować się.
Edytować profil.
Dodawać gry do biblioteki.
Zmieniać statusy gier.
Wystawiać oceny.
Publikować recenzje.
Edytować własne recenzje.
Usuwać własne recenzje.
Administrator może dodatkowo:
Zarządzać grami.
Zarządzać gatunkami.
Moderować recenzje.
Przeglądać podstawowe statystyki.
2.2. Zakres MVP
Projekt realizowany jest jako Minimum Viable Product.
Priorytetem jest dostarczenie kompletnej, działającej aplikacji obejmującej podstawowe funkcje portalu.
Poza zakresem MVP pozostają:
Zakupy gier.
Płatności.
Koszyk.
Uruchamianie gier.
Integracja ze Steam.
Czat.
Forum.
Powiadomienia w czasie rzeczywistym.
Aplikacje mobilne natywne.
Zaawansowany system rekomendacji.
System obserwowania użytkowników.
Rozbudowana analityka.
3. Architektura ogólna
3.1. Model architektury
System zostanie zrealizowany jako aplikacja webowa z rozdzielonym frontendem i backendem.
Wykorzystany zostanie model:
SPA + REST API + relacyjna baza danych
SPA oznacza Single Page Application.
Frontend działa w przeglądarce i komunikuje się z backendem za pomocą żądań HTTP.
Backend obsługuje logikę biznesową i dostęp do bazy danych.
3.2. Schemat architektury
                  UŻYTKOWNIK
                      |
                      v
              PRZEGLĄDARKA WWW
                      |
                      v
              FRONTEND — VUE 3
              ----------------
              Vue Router
              Pinia
              Axios
              Tailwind CSS
                      |
                      | HTTPS / JSON
                      v
              BACKEND — LARAVEL
              -----------------
              REST API
              Controllers
              Form Requests
              API Resources
              Policies
              Eloquent ORM
                      |
                      v
                 MYSQL 8
                      |
                      v
               DANE APLIKACJI
Dodatkowo backend korzysta z systemu plików do przechowywania grafik gier.
3.3. Odpowiedzialności warstw
Frontend
Odpowiada za:
Renderowanie interfejsu.
Nawigację.
Formularze.
Wyświetlanie danych.
Obsługę interakcji.
Zarządzanie stanem.
Komunikację z API.
Prezentowanie błędów.
Responsywność.
Backend
Odpowiada za:
Przetwarzanie żądań.
Walidację.
Logikę biznesową.
Uwierzytelnianie.
Autoryzację.
Zapisywanie danych.
Pobieranie danych.
Obsługę plików.
Przygotowywanie odpowiedzi JSON.
Baza danych
Odpowiada za trwałe przechowywanie:
Użytkowników.
Gier.
Gatunków.
Platform.
Recenzji.
Bibliotek użytkowników.
Relacji pomiędzy rekordami.
4. Technologie
4.1. Frontend
Technologia
Zastosowanie
Vue 3
Budowanie interfejsu
Vite
Środowisko developerskie
Vue Router
Nawigacja
Pinia
Stan aplikacji
Axios
Komunikacja HTTP
Tailwind CSS
Stylowanie
JavaScript
Logika frontendu
W projekcie stosowany będzie Vue 3 Composition API.
Preferowany zapis komponentów:
<script setup>
</script>

<template>
</template>

<style scoped>
</style>
4.2. Backend
Technologia
Zastosowanie
PHP
Język backendu
Laravel
Framework
Eloquent ORM
Operacje na bazie
Laravel Sanctum
Uwierzytelnianie
Form Requests
Walidacja
API Resources
Formatowanie JSON
Policies
Autoryzacja
PHPUnit/Pest
Testowanie
Wybór PHPUnit albo Pest należy ustalić podczas inicjalizacji backendu. Wystarczy jeden framework testowy.
4.3. Baza danych
MySQL 8.
Wymagania:
Silnik InnoDB.
Kodowanie utf8mb4.
Klucze obce.
Indeksy.
Unikalne ograniczenia.
Migracje Laravel.
4.4. Narzędzia
Visual Studio Code.
Git.
GitHub.
Figma.
Postman lub Bruno.
Przeglądarka z DevTools.
Composer.
Node.js i npm.
5. Architektura repozytorium
Projekt będzie przechowywany w jednym repozytorium GitHub.
Zastosujemy strukturę monorepo.
5.1. Struktura główna
Gamevers/
│
├── frontend/
│   └── aplikacja Vue 3
│
├── backend/
│   └── aplikacja Laravel
│
├── docs/
│   ├── requirements.md
│   ├── database.md
│   ├── api.md
│   └── architecture.md
│
├── .gitignore
│
└── README.md
5.2. Zasady
Frontend i backend znajdują się w osobnych katalogach.
Każda część posiada własne zależności i konfigurację.
Frontend nie importuje bezpośrednio plików backendu.
Backend nie jest zależny od komponentów Vue.
Komunikacja odbywa się wyłącznie przez API.
6. Architektura frontendu
6.1. Założenia
Frontend będzie aplikacją Vue 3 zbudowaną z komponentów wielokrotnego użytku.
Podstawowe zasady:
Rozdzielenie widoków i komponentów.
Rozdzielenie komunikacji API od interfejsu.
Centralizacja stanu logowania.
Reużywalność elementów.
Responsywność.
Spójność z Figmą.
Unikanie powielania kodu.
6.2. Docelowa struktura katalogów
frontend/
│
├── public/
│   ├── favicon.ico
│   └── images/
│       └── placeholders/
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       └── main.css
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── AppNavbar.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── MainLayout.vue
│   │   │   ├── AuthLayout.vue
│   │   │   └── AdminLayout.vue
│   │   │
│   │   ├── ui/
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseSelect.vue
│   │   │   ├── BaseModal.vue
│   │   │   ├── BaseBadge.vue
│   │   │   ├── BaseSpinner.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── Pagination.vue
│   │   │
│   │   ├── games/
│   │   │   ├── GameCard.vue
│   │   │   ├── GameGrid.vue
│   │   │   ├── GameHero.vue
│   │   │   ├── GameFilters.vue
│   │   │   ├── GameSearch.vue
│   │   │   ├── GameRating.vue
│   │   │   └── GameInfo.vue
│   │   │
│   │   ├── reviews/
│   │   │   ├── ReviewCard.vue
│   │   │   ├── ReviewList.vue
│   │   │   └── ReviewForm.vue
│   │   │
│   │   ├── library/
│   │   │   ├── LibraryTabs.vue
│   │   │   └── LibraryStatusSelect.vue
│   │   │
│   │   └── admin/
│   │       ├── AdminSidebar.vue
│   │       ├── AdminStatsCard.vue
│   │       ├── AdminGamesTable.vue
│   │       └── AdminReviewsTable.vue
│   │
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── GamesView.vue
│   │   ├── GameDetailsView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ProfileView.vue
│   │   ├── LibraryView.vue
│   │   ├── NotFoundView.vue
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboardView.vue
│   │       ├── AdminGamesView.vue
│   │       ├── AdminGameFormView.vue
│   │       └── AdminReviewsView.vue
│   │
│   ├── router/
│   │   └── index.js
│   │
│   ├── stores/
│   │   └── authStore.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── gameService.js
│   │   ├── genreService.js
│   │   ├── platformService.js
│   │   ├── profileService.js
│   │   ├── libraryService.js
│   │   ├── reviewService.js
│   │   └── adminService.js
│   │
│   ├── composables/
│   │   ├── usePagination.js
│   │   └── useApiError.js
│   │
│   ├── App.vue
│   └── main.js
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
Struktura jest docelowa. Pliki powinny powstawać stopniowo podczas implementacji, a nie wszystkie jednocześnie.
7. Organizacja widoków Vue
7.1. HomeView.vue
Strona główna.
Odpowiada za:
Pobranie wyróżnionej gry.
Pobranie popularnych gier.
Pobranie najwyżej ocenianych gier.
Pobranie ostatnio dodanych gier.
Wyświetlenie odpowiednich sekcji.
Wykorzystywane komponenty:
GameHero.vue
GameGrid.vue
GameCard.vue
Wykorzystywane endpointy:
GET /api/games/featured
GET /api/games/popular
GET /api/games/top-rated
GET /api/games?sort=newest&per_page=8
7.2. GamesView.vue
Katalog gier.
Odpowiada za:
Wyszukiwanie.
Filtrowanie.
Sortowanie.
Paginację.
Wyświetlanie wyników.
Komponenty:
GameSearch.vue
GameFilters.vue
GameGrid.vue
Pagination.vue
Endpoint:
GET /api/games
Stan filtrów powinien być synchronizowany z parametrami adresu URL.
Przykład:
/games?search=witcher&genre=rpg&platform=pc
Pozwala to odświeżyć stronę bez utraty filtrów i udostępniać linki do wyników.
7.3. GameDetailsView.vue
Szczegóły gry.
Odpowiada za:
Pobranie danych gry.
Wyświetlenie grafiki i opisu.
Wyświetlenie gatunków i platform.
Wyświetlenie ocen.
Pobranie recenzji.
Obsługę dodawania recenzji.
Obsługę dodawania gry do biblioteki.
Endpointy:
GET /api/games/{slug}
GET /api/games/{id}/reviews
POST /api/games/{id}/reviews
POST /api/library
7.4. LoginView.vue
Formularz logowania.
Odpowiada za:
Przyjmowanie emaila i hasła.
Walidację podstawową.
Wywołanie logowania.
Wyświetlenie błędów.
Przekierowanie po zalogowaniu.
7.5. RegisterView.vue
Formularz rejestracji.
Odpowiada za:
Nazwę użytkownika.
Email.
Hasło.
Potwierdzenie hasła.
Walidację.
Obsługę odpowiedzi API.
7.6. ProfileView.vue
Profil użytkownika.
Odpowiada za:
Wyświetlenie nazwy.
Wyświetlenie emaila.
Wyświetlenie biografii.
Wyświetlenie statystyk.
Edycję nazwy i biografii.
7.7. LibraryView.vue
Biblioteka użytkownika.
Odpowiada za:
Pobieranie zapisanych gier.
Filtrowanie według statusu.
Zmianę statusów.
Usuwanie wpisów.
7.8. Widoki administratora
AdminDashboardView.vue — statystyki.
AdminGamesView.vue — tabela gier.
AdminGameFormView.vue — formularz dodawania i edycji.
AdminReviewsView.vue — moderacja recenzji.
Zarządzanie gatunkami w MVP może być umieszczone jako sekcja w panelu administracyjnym. Nie wymaga osobnego rozbudowanego widoku, o ile wszystkie wymagane operacje są dostępne.
8. Komponenty wielokrotnego użytku
8.1. GameCard.vue
Komponent pojedynczej karty gry.
Props
{
  game: Object
}
Wyświetlane dane
Okładka.
Tytuł.
Gatunek.
Średnia ocena.
Zachowanie
Kliknięcie karty prowadzi do:
/games/{slug}
Komponent nie wykonuje samodzielnie zapytań API.
Dane otrzymuje przez props.
8.2. GameGrid.vue
Odpowiada za układ kart.
Przyjmuje tablicę gier.
Przykład:
<GameGrid :games="games" />
Układ responsywny:
Desktop: 4 kolumny.
Tablet: 2 kolumny.
Telefon: 1–2 kolumny zależnie od dostępnej szerokości.
8.3. GameFilters.vue
Odpowiada za:
Gatunek.
Platformę.
Sortowanie.
Reset filtrów.
Komponent emituje zmiany do widoku nadrzędnego.
8.4. ReviewCard.vue
Wyświetla:
Autora.
Ocenę.
Treść.
Datę.
Dostępne akcje.
Przyciski edycji i usuwania są widoczne wyłącznie dla autora.
Backend niezależnie weryfikuje uprawnienia.
8.5. LibraryStatusSelect.vue
Pozwala wybrać:
wishlist
playing
completed
dropped
Teksty interfejsu:
Chcę zagrać
Gram
Ukończone
Porzucone
8.6. BaseModal.vue
Wykorzystywany do potwierdzania operacji, np. usunięcia gry lub recenzji.
8.7. BaseInput.vue
Wspólny komponent pól formularzy.
Obsługuje:
Etykietę.
Wartość.
Placeholder.
Typ pola.
Błąd walidacji.
Stan disabled.
9. Vue Router
9.1. Trasy publiczne
/
 /games
 /games/:slug
 /login
 /register
9.2. Trasy użytkownika
/profile
/library
9.3. Trasy administratora
/admin
/admin/games
/admin/games/create
/admin/games/:id/edit
/admin/reviews
9.4. Konfiguracja
Przykładowa definicja:
{
  path: '/library',
  name: 'library',
  component: LibraryView,
  meta: {
    requiresAuth: true
  }
}
Trasa administratora:
{
  path: '/admin',
  name: 'admin',
  component: AdminDashboardView,
  meta: {
    requiresAuth: true,
    requiresAdmin: true
  }
}
9.5. Navigation Guards
Router sprawdza:
Czy trasa wymaga logowania.
Czy stan użytkownika został już załadowany.
Czy użytkownik jest zalogowany.
Czy trasa wymaga roli administratora.
Przy braku logowania następuje przekierowanie do /login.
Przy braku roli administratora użytkownik nie otrzymuje dostępu do panelu.
Ważne: ochrona tras Vue poprawia działanie interfejsu, ale nie zastępuje autoryzacji backendowej.
10. Zarządzanie stanem — Pinia
10.1. Zakres
W MVP wykorzystujemy jeden główny store:
authStore.js
Nie tworzymy osobnego globalnego store dla każdego modułu bez potrzeby.
Dane katalogu, szczegółów gry i recenzji mogą być przechowywane lokalnie w odpowiednich widokach.
10.2. Auth Store
Przechowywane informacje:
{
  user: null,
  isLoading: false,
  initialized: false
}
Przykładowe akcje:
fetchUser()
login()
register()
logout()
10.3. Inicjalizacja aplikacji
Po odświeżeniu strony:
Frontend uruchamia aplikację.
Sprawdza aktualną sesję.
Wywołuje GET /api/user.
Zapisuje użytkownika w Pinia.
Ustawia initialized = true.
Router podejmuje decyzję o dostępie.
Nie zakładamy, że użytkownik pozostaje zalogowany wyłącznie dlatego, że wcześniej istniał w pamięci Pinia.
11. Komunikacja HTTP — Axios
11.1. Centralna instancja
Plik:
src/services/api.js
Przykład:
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json'
  }
})

export default api
11.2. Serwisy
Każdy serwis odpowiada za jeden obszar API.
Przykład:
import api from './api'

export const getGames = (params = {}) => {
  return api.get('/games', { params })
}

export const getGame = (slug) => {
  return api.get(`/games/${encodeURIComponent(slug)}`)
}
11.3. Zasada
Komponenty Vue nie powinny zawierać bezpośrednio wpisanych adresów backendu.
Zamiast:
axios.get('http://localhost:8000/api/games')
stosujemy:
gameService.getGames()
Ułatwia to utrzymanie i zmianę konfiguracji.
12. Architektura backendu Laravel
12.1. Założenia
Backend zostanie zorganizowany zgodnie z konwencjami Laravel.
Główne elementy:
Routes.
Controllers.
Form Requests.
Models.
API Resources.
Policies.
Middleware.
Migrations.
Seeders.
Feature Tests.
12.2. Struktura backendu
backend/
│
├── app/
│   │
│   ├── Http/
│   │   │
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── GameController.php
│   │   │   ├── GenreController.php
│   │   │   ├── PlatformController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── LibraryController.php
│   │   │   ├── ReviewController.php
│   │   │   │
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php
│   │   │       ├── GameController.php
│   │   │       ├── GenreController.php
│   │   │       └── ReviewController.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── RegisterRequest.php
│   │   │   ├── LoginRequest.php
│   │   │   ├── UpdateProfileRequest.php
│   │   │   ├── StoreReviewRequest.php
│   │   │   ├── UpdateReviewRequest.php
│   │   │   ├── StoreLibraryRequest.php
│   │   │   ├── UpdateLibraryRequest.php
│   │   │   │
│   │   │   └── Admin/
│   │   │       ├── StoreGameRequest.php
│   │   │       ├── UpdateGameRequest.php
│   │   │       ├── StoreGenreRequest.php
│   │   │       └── UpdateGenreRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── GameListResource.php
│   │       ├── GameDetailResource.php
│   │       ├── UserResource.php
│   │       ├── ReviewResource.php
│   │       └── LibraryResource.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Game.php
│   │   ├── Genre.php
│   │   ├── Platform.php
│   │   ├── Review.php
│   │   └── UserGame.php
│   │
│   └── Policies/
│       ├── ReviewPolicy.php
│       └── GamePolicy.php
│
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── GenreSeeder.php
│       ├── PlatformSeeder.php
│       ├── GameSeeder.php
│       ├── ReviewSeeder.php
│       └── UserGameSeeder.php
│
├── routes/
│   ├── api.php
│   └── web.php
│
├── storage/
│   └── app/
│       └── public/
│           └── games/
│               ├── covers/
│               └── banners/
│
├── tests/
│   └── Feature/
│       ├── AuthTest.php
│       ├── GamesTest.php
│       ├── LibraryTest.php
│       ├── ReviewsTest.php
│       └── AdminTest.php
│
├── .env.example
├── artisan
└── composer.json
Laravel generuje również inne katalogi i pliki techniczne. Przedstawiona struktura pokazuje przede wszystkim elementy istotne dla Gamevers.
13. Odpowiedzialności kontrolerów
13.1. AuthController
Metody:
register()
login()
logout()
user()
Odpowiada za:
Rejestrację.
Logowanie.
Sesję.
Wylogowanie.
Dane zalogowanego użytkownika.
13.2. GameController
Metody:
index()
show()
featured()
popular()
topRated()
Odpowiada za:
Katalog.
Wyszukiwanie.
Filtrowanie.
Sortowanie.
Szczegóły.
Rankingi.
13.3. GenreController
Metoda:
index()
Zwraca gatunki.
13.4. PlatformController
Metoda:
index()
Zwraca platformy.
13.5. ProfileController
Metody:
show()
update()
Odpowiada za dane profilu.
13.6. LibraryController
Metody:
index()
store()
update()
destroy()
Odpowiada za prywatną bibliotekę użytkownika.
13.7. ReviewController
Metody:
index()
store()
update()
destroy()
Odpowiada za recenzje.
13.8. Admin/GameController
Metody:
index()
store()
update()
destroy()
Odpowiada za zarządzanie grami.
13.9. Admin/GenreController
Metody:
store()
update()
destroy()
Odpowiada za zarządzanie gatunkami.
13.10. Admin/ReviewController
Metody:
index()
destroy()
Odpowiada za moderację.
13.11. Admin/DashboardController
Metoda:
stats()
Zwraca statystyki.
14. Form Requests
14.1. Cel
Form Requests odpowiadają za walidację danych wejściowych.
Pozwalają oddzielić walidację od kontrolerów.
14.2. Przykład
public function rules(): array
{
    return [
        'rating' => ['required', 'integer', 'between:1,10'],
        'content' => ['required', 'string', 'min:10', 'max:2000'],
    ];
}
14.3. Korzyści
Mniej kodu w kontrolerach.
Łatwiejsze testowanie.
Jednolite błędy.
Czytelne reguły.
Lepsze utrzymanie.
15. API Resources
15.1. Cel
API Resources odpowiadają za format danych zwracanych przez backend.
Model Eloquent nie powinien być automatycznie zwracany z wszystkimi polami.
15.2. Przykład
public function toArray($request): array
{
    return [
        'id' => $this->id,
        'title' => $this->title,
        'slug' => $this->slug,
        'cover_image_url' => $this->cover_image_url,
        'average_rating' => $this->average_rating,
        'reviews_count' => $this->reviews_count,
    ];
}
15.3. Korzyści
Stały format JSON.
Ograniczenie zbędnych danych.
Ukrywanie pól wrażliwych.
Spójność z docs/api.md.
16. Modele Eloquent i relacje
16.1. User
Relacje:
User hasMany Review
User hasMany UserGame
User belongsToMany Game
16.2. Game
Relacje:
Game belongsToMany Genre
Game belongsToMany Platform
Game hasMany Review
Game hasMany UserGame
16.3. Genre
Genre belongsToMany Game
16.4. Platform
Platform belongsToMany Game
16.5. Review
Review belongsTo User
Review belongsTo Game
16.6. UserGame
UserGame belongsTo User
UserGame belongsTo Game
17. Architektura bazy danych
17.1. Tabele
Zgodnie z docs/database.md:
users
games
genres
platforms
game_genre
game_platform
reviews
user_games
17.2. Relacje
users
  |
  +----< reviews >---- games
  |                      |
  +----< user_games >----+
                         |
                         +----< game_genre >---- genres
                         |
                         +----< game_platform >---- platforms
17.3. Ograniczenia
Recenzje
UNIQUE(user_id, game_id)
Jeden użytkownik może opublikować jedną recenzję danej gry.
Biblioteka
UNIQUE(user_id, game_id)
Jedna gra może wystąpić tylko raz w bibliotece użytkownika.
Slug
UNIQU
