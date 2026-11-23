
GAMEVERS — Dokumentacja REST API
Projekt: Gamevers
Plik: docs/api.md
Wersja: 1.0
Data: 23.11.2026
Status: Projekt kontraktu API — do zatwierdzenia
Backend: Laravel / PHP
Frontend: Vue 3 / Axios
Baza danych: MySQL
Uwierzytelnianie: Laravel Sanctum (SPA Cookie Authentication)
1. Wprowadzenie
1.1. Cel dokumentu
Dokument definiuje sposób komunikacji pomiędzy frontendem Vue 3 a backendem Laravel w projekcie Gamevers.
Określa:
Wszystkie planowane endpointy.
Metody HTTP.
Parametry adresów URL.
Parametry zapytań.
Struktury danych JSON.
Wymagane pola.
Walidację.
Kody odpowiedzi.
Obsługę błędów.
Uwierzytelnianie.
Autoryzację.
Zasady paginacji.
Przykłady integracji z Vue.
Kolejność implementacji.
1.2. Główne założenia
API wykorzystuje architekturę REST.
Dane są przesyłane w formacie JSON, z wyjątkiem przesyłania plików graficznych, które wykorzystuje multipart/form-data.
Backend odpowiada za:
Przyjmowanie żądań HTTP.
Walidację danych.
Uwierzytelnianie.
Autoryzację.
Logikę biznesową.
Komunikację z MySQL.
Zwracanie odpowiedzi JSON.
Frontend odpowiada za:
Wysyłanie żądań.
Wyświetlanie danych.
Obsługę formularzy.
Prezentowanie błędów.
Zarządzanie stanem interfejsu.
Nawigację.
Frontend nie komunikuje się bezpośrednio z MySQL.
2. Konfiguracja API
2.1. Adres bazowy
Środowisko lokalne:
http://localhost:8000/api
Przykładowy adres:
GET http://localhost:8000/api/games
2.2. Nagłówki
Dla żądań JSON:
Accept: application/json
Content-Type: application/json
Dla żądań z plikami:
Accept: application/json
Content-Type: multipart/form-data
Przy korzystaniu z FormData nagłówek Content-Type powinien zostać ustawiony automatycznie przez przeglądarkę, wraz z odpowiednią granicą danych.
2.3. Format dat
Daty kalendarzowe:
YYYY-MM-DD
Przykład:
2025-06-10
Znaczniki czasu w API:
2026-11-23T12:30:00Z
Wszystkie znaczniki czasu są zwracane w UTC w formacie ISO 8601.
2.4. Typy danych
Typ
Znaczenie
integer
Liczba całkowita
string
Tekst
boolean
true / false
number
Liczba
array
Tablica
object
Obiekt
null
Brak wartości
Identyfikatory rekordów są liczbami całkowitymi.
2.5. Konwencja odpowiedzi
Pojedynczy zasób:
{
  "data": {
    "id": 1,
    "name": "Example"
  }
}
Lista zasobów:
{
  "data": [
    {
      "id": 1,
      "name": "Example"
    }
  ]
}
Operacja zakończona komunikatem:
{
  "message": "Operation completed successfully."
}
Komunikaty interfejsu mogą być tłumaczone na język polski po stronie Vue.
3. Uwierzytelnianie i autoryzacja
3.1. Laravel Sanctum
W projekcie wykorzystujemy Laravel Sanctum w trybie uwierzytelniania SPA za pomocą sesji i ciasteczek.
Nie przechowujemy tokenów uwierzytelniających w localStorage.
Frontend wysyła ciasteczka sesyjne automatycznie.
3.2. Konfiguracja lokalna
Zalecane adresy:
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Należy używać konsekwentnie localhost, a nie mieszać go z 127.0.0.1.
Przykładowe ustawienia Laravel:
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
Konfiguracja CORS musi zezwalać na adres frontendu i przesyłanie poświadczeń.
Dokładne ustawienia należy zweryfikować dla zainstalowanej wersji Laravel i Sanctum.
3.3. Inicjalizacja CSRF
Przed logowaniem lub rejestracją frontend pobiera ciasteczko CSRF:
GET /sanctum/csrf-cookie
Jest to trasa backendu poza prefiksem /api.
Następnie frontend wysyła formularz logowania lub rejestracji.
3.4. Dostęp do zasobów
Rodzaj endpointu
Dostęp
Publiczny
Wszyscy
Auth
Zalogowani
Admin
Administratorzy
3.5. Middleware
Endpointy wymagające logowania korzystają z:
auth:sanctum
Endpointy administracyjne dodatkowo wymagają kontroli roli admin.
3.6. Kody autoryzacji
401 Unauthorized — brak aktywnego uwierzytelnienia.
403 Forbidden — użytkownik nie posiada wymaganych uprawnień.
419 Page Expired — błąd weryfikacji CSRF lub wygasła sesja w kontekście żądania chronionego przez CSRF.
4. Standardowe kody HTTP
Kod
Znaczenie
Zastosowanie
200
OK
Poprawne pobranie lub aktualizacja
201
Created
Utworzenie zasobu
204
No Content
Usunięcie bez treści odpowiedzi
400
Bad Request
Niepoprawne żądanie
401
Unauthorized
Brak uwierzytelnienia
403
Forbidden
Brak uprawnień
404
Not Found
Zasób nie istnieje
409
Conflict
Konflikt danych
419
Page Expired
Problem z CSRF lub sesją
422
Unprocessable Content
Błąd walidacji
429
Too Many Requests
Przekroczony limit żądań
500
Internal Server Error
Nieoczekiwany błąd serwera
503
Service Unavailable
Usługa niedostępna
Nie każdy endpoint zwraca wszystkie wymienione kody.
5. Standard obsługi błędów
5.1. Błąd walidacji — 422
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "Podany adres email jest już zajęty."
    ],
    "password": [
      "Hasło musi zawierać minimum 8 znaków."
    ]
  }
}
5.2. Brak uwierzytelnienia — 401
{
  "message": "Unauthenticated."
}
5.3. Brak uprawnień — 403
{
  "message": "Nie masz uprawnień do wykonania tej operacji."
}
5.4. Nieistniejący zasób — 404
{
  "message": "Nie znaleziono zasobu."
}
5.5. Konflikt — 409
{
  "message": "Ten zasób został już dodany."
}
5.6. Błąd serwera — 500
{
  "message": "Wystąpił wewnętrzny błąd serwera."
}
W środowisku produkcyjnym odpowiedzi nie mogą ujawniać ścieżek serwera, danych dostępowych ani szczegółów wyjątków.
6. Model danych zwracanych przez API
6.1. GameListItem
Wykorzystywany w katalogu i kartach gier.
{
  "id": 1,
  "title": "Example Adventure",
  "slug": "example-adventure",
  "cover_image_url": "http://localhost:8000/storage/games/covers/example.webp",
  "release_date": "2025-06-10",
  "genres": [
    {
      "id": 1,
      "name": "RPG",
      "slug": "rpg"
    }
  ],
  "average_rating": 8.5,
  "reviews_count": 12
}
average_rating może mieć wartość null.
6.2. GameDetails
{
  "id": 1,
  "title": "Example Adventure",
  "slug": "example-adventure",
  "description": "Przykładowa gra przygodowa.",
  "developer": "Example Studio",
  "publisher": "Example Publisher",
  "release_date": "2025-06-10",
  "cover_image_url": "http://localhost:8000/storage/games/covers/example.webp",
  "banner_image_url": "http://localhost:8000/storage/games/banners/example.webp",
  "is_featured": true,
  "genres": [
    {
      "id": 1,
      "name": "RPG",
      "slug": "rpg"
    }
  ],
  "platforms": [
    {
      "id": 1,
      "name": "PC",
      "slug": "pc"
    }
  ],
  "average_rating": 8.5,
  "reviews_count": 12,
  "created_at": "2026-11-23T12:30:00Z",
  "updated_at": "2026-11-23T12:30:00Z"
}
Brakujące grafiki zwracają null. Frontend wyświetla wtedy grafikę zastępczą.
6.3. User
{
  "id": 5,
  "name": "PlayerOne",
  "email": "player@example.com",
  "role": "user",
  "bio": "Lubię gry RPG.",
  "created_at": "2026-11-23T12:30:00Z"
}
Hasło i hash hasła nigdy nie są zwracane.
6.4. Review
{
  "id": 15,
  "game_id": 1,
  "user": {
    "id": 5,
    "name": "PlayerOne"
  },
  "rating": 9,
  "content": "Bardzo ciekawa gra z rozbudowaną fabułą.",
  "created_at": "2026-11-23T12:30:00Z",
  "updated_at": "2026-11-23T12:30:00Z"
}
6.5. LibraryItem
{
  "id": 20,
  "game": {
    "id": 1,
    "title": "Example Adventure",
    "slug": "example-adventure",
    "cover_image_url": null,
    "average_rating": 8.5
  },
  "status": "playing",
  "created_at": "2026-11-23T12:30:00Z",
  "updated_at": "2026-11-23T12:30:00Z"
}
7. Endpointy publiczne — gry
API-GAME-001 — Lista gier
GET /api/games
Dostęp: Publiczny.
Parametry
Parametr
Typ
Domyślnie
Opis
search
string
brak
Fragment tytułu
genre
string
brak
Slug gatunku
platform
string
brak
Slug platformy
sort
string
newest
Sortowanie
page
integer
1
Numer strony
per_page
integer
12
Liczba wyników
Dozwolone sort:
newest
title
release_date
top_rated
popular
per_page musi być liczbą od 1 do 30.
search może mieć maksymalnie 150 znaków.
Przykład
GET /api/games?search=adventure&genre=rpg&platform=pc&sort=top_rated&page=1&per_page=12
Odpowiedź — 200
{
  "data": [
    {
      "id": 1,
      "title": "Example Adventure",
      "slug": "example-adventure",
      "cover_image_url": null,
      "release_date": "2025-06-10",
      "genres": [
        {
          "id": 1,
          "name": "RPG",
          "slug": "rpg"
        }
      ],
      "average_rating": 8.5,
      "reviews_count": 12
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "last_page": 1,
    "total": 1
  },
  "links": {
    "first": "http://localhost:8000/api/games?page=1",
    "last": "http://localhost:8000/api/games?page=1",
    "prev": null,
    "next": null
  }
}
Adresy w links są przykładami; rzeczywista odpowiedź zachowuje aktywne filtry i sortowanie.
Walidacja
Niepoprawne sort → 422.
page mniejsze od 1 → 422.
per_page większe od 30 → 422.
Niepoprawny typ parametru → 422.
Uwagi
Wyszukiwanie nie rozróżnia wielkości liter.
Filtry można łączyć.
Brak wyników zwraca pustą tablicę data.
Sortowanie musi być deterministyczne, np. przez dodatkowe sortowanie po id.
API-GAME-002 — Szczegóły gry
GET /api/games/{slug}
Dostęp: Publiczny.
Przykład
GET /api/games/example-adventure
Odpowiedź — 200
{
  "data": {
    "id": 1,
    "title": "Example Adventure",
    "slug": "example-adventure",
    "description": "Przykładowa gra przygodowa.",
    "developer": "Example Studio",
    "publisher": "Example Publisher",
    "release_date": "2025-06-10",
    "cover_image_url": null,
    "banner_image_url": null,
    "is_featured": true,
    "genres": [
      {
        "id": 1,
        "name": "RPG",
        "slug": "rpg"
      }
    ],
    "platforms": [
      {
        "id": 1,
        "name": "PC",
        "slug": "pc"
      }
    ],
    "average_rating": 8.5,
    "reviews_count": 12,
    "created_at": "2026-11-23T12:30:00Z",
    "updated_at": "2026-11-23T12:30:00Z"
  }
}
Nieistniejący slug → 404.
Recenzje są pobierane osobnym endpointem.
API-GAME-003 — Wyróżniona gra
GET /api/games/featured
Dostęp: Publiczny.
Zwraca jedną wyróżnioną grę.
Odpowiedź — 200
{
  "data": {
    "id": 1,
    "title": "Example Adventure",
    "slug": "example-adventure",
    "description": "Przykładowa gra przygodowa.",
    "banner_image_url": null
  }
}
Jeżeli nie istnieje wyróżniona gra:
{
  "data": null
}
Zwracany jest status 200.
W przypadku wielu wyróżnionych gier wybierana jest najnowsza według created_at, a następnie id.
API-GAME-004 — Popularne gry
GET /api/games/popular
Dostęp: Publiczny.
Parametry
limit — liczba od 1 do 8, domyślnie 8.
Odpowiedź — 200
{
  "data": [
    {
      "id": 1,
      "title": "Example Adventure",
      "slug": "example-adventure",
      "cover_image_url": null,
      "release_date": "2025-06-10",
      "genres": [],
      "average_rating": 8.5,
      "reviews_count": 12
    }
  ]
}
Popularność określa liczba recenzji. Przy remisie decyduje średnia ocen, następnie id.
API-GAME-005 — Najwyżej oceniane gry
GET /api/games/top-rated
Dostęp: Publiczny.
Parametr limit: 1–8, domyślnie 8.
Zwraca tablicę GameListItem posortowaną malejąco według średniej ocen.
Gry bez recenzji nie uczestniczą w rankingu.
Przy remisie decyduje liczba recenzji, następnie id.
8. Endpointy słownikowe
API-GENRE-001 — Gatunki
GET /api/genres
Dostęp: Publiczny.
Odpowiedź — 200
{
  "data": [
    {
      "id": 1,
      "name": "RPG",
      "slug": "rpg"
    },
    {
      "id": 2,
      "name": "Action",
      "slug": "action"
    }
  ]
}
Wyniki sortowane alfabetycznie według name.
API-PLATFORM-001 — Platformy
GET /api/platforms
Dostęp: Publiczny.
Odpowiedź — 200
{
  "data": [
    {
      "id": 1,
      "name": "PC",
      "slug": "pc"
    },
    {
      "id": 2,
      "name": "PlayStation 5",
      "slug": "ps5"
    }
  ]
}
Wyniki sortowane alfabetycznie według name.
9. Endpointy autoryzacji
API-AUTH-001 — Rejestracja
POST /api/register
Dostęp: Gość.
Request
{
  "name": "PlayerOne",
  "email": "player@example.com",
  "password": "ExamplePassword123!",
  "password_confirmation": "ExamplePassword123!"
}
Walidacja
Pole
Reguły
name
required, string, min:3, max:30, unique:users
email
required, email, max:255, unique:users
password
required, string, min:8, confirmed
Dodatkowo stosujemy bezpieczne reguły haseł Laravel.
Odpowiedź — 201
{
  "message": "Konto zostało utworzone.",
  "data": {
    "id": 5,
    "name": "PlayerOne",
    "email": "player@example.com",
    "role": "user",
    "bio": null,
    "created_at": "2026-11-23T12:30:00Z"
  }
}
Po rejestracji użytkownik zostaje zalogowany w sesji.
Błędy
422 — błędne dane.
419 — problem CSRF.
429 — zbyt wiele prób.
500 — błąd serwera.
Rola admin nie może być nadawana przez publiczny formularz rejestracji.
API-AUTH-002 — Logowanie
POST /api/login
Dostęp: Gość.
Request
{
  "email": "player@example.com",
  "password": "ExamplePassword123!"
}
Walidacja
email: wymagany, poprawny email.
password: wymagany tekst.
Odpowiedź — 200
{
  "message": "Zalogowano pomyślnie.",
  "data": {
    "id": 5,
    "name": "PlayerOne",
    "email": "player@example.com",
    "role": "user",
    "bio": null,
    "created_at": "2026-11-23T12:30:00Z"
  }
}
Po poprawnym logowaniu backend regeneruje identyfikator sesji.
Błędy
422 — niepoprawne dane logowania lub walidacji.
419 — problem CSRF.
429 — zbyt wiele prób.
Komunikat błędnego logowania nie powinien ujawniać, czy email istnieje.
API-AUTH-003 — Wylogowanie
POST /api/logout
Dostęp: Zalogowany użytkownik.
Odpowiedź — 200
{
  "message": "Wylogowano pomyślnie."
}
Backend unieważnia sesję i odnawia token CSRF.
Brak uwierzytelnienia → 401.
API-AUTH-004 — Aktualny użytkownik
GET /api/user
Dostęp: Zalogowany użytkownik.
Odpowiedź — 200
{
  "data": {
    "id": 5,
    "name": "PlayerOne",
    "email": "player@example.com",
    "role": "user",
    "bio": "Lubię gry RPG.",
    "created_at": "2026-11-23T12:30:00Z"
  }
}
Brak sesji → 401.
10. Endpointy profilu
API-PROFILE-001 — Pobieranie profilu
GET /api/profile
Dostęp: Zalogowany użytkownik.
Odpowiedź — 200
{
  "data": {
    "id": 5,
    "name": "PlayerOne",
    "email": "player@example.com",
    "role": "user",
    "bio": "Lubię gry RPG.",
    "created_at": "2026-11-23T12:30:00Z",
    "games_count": 12,
    "reviews_count": 4
  }
}
Statystyki dotyczą wyłącznie bieżącego użytkownika.
API-PROFILE-002 — Edycja profilu
PATCH /api/profile
Dostęp: Zalogowany użytkownik.
Request
{
  "name": "PlayerUpdated",
  "bio": "Uwielbiam gry strategiczne."
}
Walidacja
name: opcjonalne, 3–30 znaków, unikalne poza własnym rekordem.
bio: opcjonalne, nullable, maksymalnie 500 znaków.
email nie jest edytowalny w MVP.
role nie jest edytowalna.
Przynajmniej jedno z pól name lub bio musi zostać przesłane.
Odpowiedź — 200
{
  "message": "Profil został zaktualizowany.",
  "data": {
    "id": 5,
    "name": "PlayerUpdated",
    "email": "player@example.com",
    "role": "user",
    "bio": "Uwielbiam gry strategiczne.",
    "created_at": "2026-11-23T12:30:00Z"
  }
}
Błędy
401 — brak logowania.
422 — niepoprawne dane.
419 — problem CSRF.
11. Endpointy biblioteki
API-LIB-001 — Pobieranie biblioteki
GET /api/library
Dostęp: Zalogowany użytkownik.
Parametry
Parametr
Typ
Opis
status
string
Opcjonalny filtr
page
integer
Domyślnie 1
per_page
integer
Domyślnie 12, maks. 30
Dozwolone statusy:
wishlist
playing
completed
dropped
Odpowiedź — 200
{
  "data": [
    {
      "id": 20,
      "game": {
        "id": 1,
        "title": "Example Adventure",
        "slug": "example-adventure",
        "cover_image_url": null,
        "average_rating": 8.5
      },
      "status": "playing",
      "created_at": "2026-11-23T12:30:00Z",
      "updated_at": "2026-11-23T12:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "last_page": 1,
    "total": 1
  },
  "links": {
    "first": "http://localhost:8000/api/library?page=1",
    "last": "http://localhost:8000/api/library?page=1",
    "prev": null,
    "next": null
  }
}
Biblioteka jest sortowana od ostatnio zaktualizowanych wpisów.
API-LIB-002 — Dodanie gry do biblioteki
POST /api/library
Dostęp: Zalogowany użytkownik.
Request
{
  "game_id": 1,
  "status": "wishlist"
}
Walidacja
game_id: required, integer, exists:games,id.
status: opcjonalne, jedna z czterech wartości.
Domyślny status: wishlist.
Odpowiedź — 201
{
  "message": "Gra została dodana do biblioteki.",
  "data": {
    "id": 20,
    "game": {
      "id": 1,
      "title": "Example Adventure",
      "slug": "example-adventure",
      "cover_image_url": null,
      "average_rating": 8.5
    },
    "status": "wishlist",
    "created_at": "2026-11-23T12:30:00Z",
    "updated_at": "2026-11-23T12:30:00Z"
  }
}
Błędy
401 — brak logowania.
404 — gra nie istnieje.
409 — gra jest już w bibliotece.
422 — niepoprawne dane.
Duplikaty są blokowane indeksem unikalnym (user_id, game_id).
API-LIB-003 — Zmiana statusu gry
PATCH /api/library/{gameId}
Dostęp: Zalogowany użytkownik.
Request
{
  "status": "completed"
}
Walidacja
status: wymagany, jedna z wartości wishlist, playing, completed, dropped.
Odpowiedź — 200
{
  "message": "Status gry został zmieniony.",
  "data": {
    "id": 20,
    "game": {
      "id": 1,
      "title": "Example Adventure",
      "slug": "example-adventure",
      "cover_image_url": null,
      "average_rating": 8.5
    },
    "status": "completed",
    "created_at": "2026-11-23T12:30:00Z",
    "updated_at": "2026-11-23T13:00:00Z"
  }
}
Jeżeli gra nie znajduje się w bibliotece bieżącego użytkownika → 404.
API-LIB-004 — Usunięcie gry z biblioteki
DELETE /api/library/{gameId}
Dostęp: Zalogowany użytkownik.
Odpowiedź
204 No Content
Brak treści odpowiedzi.
Jeżeli gra nie znajduje się w bibliotece użytkownika → 404.
Usunięcie wpisu nie usuwa gry z katalogu.
12. Endpointy recenzji
API-REV-001 — Lista recenzji gry
GET /api/games/{id}/reviews
Dostęp: Publiczny.
Parametry
page: domyślnie 1.
per_page: domyślnie 10, maksymalnie 30.
Recenzje sortowane są od najnowszych.
Odpowiedź — 200
{
  "data": [
    {
      "id": 15,
      "game_id": 1,
      "user": {
        "id": 5,
        "name": "PlayerOne"
      },
      "rating": 9,
      "content": "Bardzo ciekawa gra z rozbudowaną fabułą.",
      "created_at": "2026-11-23T12:30:00Z",
      "updated_at": "2026-11-23T12:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "last_page": 1,
    "total": 1
  },
  "links": {
    "first": "http://localhost:8000/api/games/1/reviews?page=1",
    "last": "http://localhost:8000/api/games/1/reviews?page=1",
    "prev": null,
    "next": null
  }
}
Nieistniejąca gra → 404.
API-REV-002 — Dodanie recenzji
POST /api/games/{id}/reviews
Dostęp: Zalogowany użytkownik.
Request
{
  "rating": 9,
  "content": "Bardzo ciekawa gra z rozbudowaną fabułą."
}
Walidacja
Pole
Reguły
rating
required, integer, between 1 and 10
content
required, string, min:10, max:2000
Odpowiedź — 201
{
  "message": "Recenzja została opublikowana.",
  "data": {
    "id": 15,
    "game_id": 1,
    "user": {
      "id": 5,
      "name": "PlayerOne"
    },
    "rating": 9,
    "content": "Bardzo ciekawa gra z rozbudowaną fabułą.",
    "created_at": "2026-11-23T12:30:00Z",
    "updated_at": "2026-11-23T12:30:00Z"
  }
}
Błędy
401 — brak logowania.
404 — gra nie istnieje.
409 — użytkownik posiada już recenzję tej gry.
422 — niepoprawne dane.
Indeks unikalny (user_id, game_id) zabezpiecza przed duplikatami.
API-REV-003 — Edycja recenzji
PATCH /api/reviews/{id}
Dostęp: Autor recenzji.
Request
{
  "rating": 8,
  "content": "Zmieniona opinia o grze."
}
Przynajmniej jedno pole musi być przesłane.
Walidacja
rating: opcjonalne, integer, 1–10.
content: opcjonalne, string, 10–2000 znaków.
Odpowiedź — 200
{
  "message": "Recenzja została zaktualizowana.",
  "data": {
    "id": 15,
    "game_id": 1,
    "user": {
      "id": 5,
      "name": "PlayerOne"
    },
    "rating": 8,
    "content": "Zmieniona opinia o grze.",
    "created_at": "2026-11-23T12:30:00Z",
    "updated_at": "2026-11-23T13:00:00Z"
  }
}
Błędy
401 — brak logowania.
403 — użytkownik nie jest autorem.
404 — recenzja nie istnieje.
422 — błędne dane.
API-REV-004 — Usunięcie recenzji
DELETE /api/reviews/{id}
Dostęp: Autor recenzji.
Odpowiedź
204 No Content
Błędy
401 — brak logowania.
403 — brak uprawnień.
404 — brak recenzji.
Administrato
