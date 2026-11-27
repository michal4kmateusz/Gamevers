🎮 Gamevers — Gaming Community Platform

Gamevers to nowoczesny portal społecznościowo-gamingowy tworzony w ramach projektu informatycznego przez dwuosobowy zespół programistów.

Aplikacja umożliwia użytkownikom odkrywanie gier, przeglądanie szczegółowych informacji, zarządzanie własną biblioteką, wystawianie ocen oraz publikowanie recenzji.

Projekt wykorzystuje Laravel (PHP) jako backend, Vue 3 jako frontend oraz MySQL jako relacyjną bazę danych.

«Status projektu: Planowanie i przygotowanie środowiska
Wersja: 0.1.0 — etap przygotowawczy
Czas realizacji: 3 tygodnie (15 dni roboczych)
Zespół: 2 programistów
Architektura: REST API + Single Page Application (SPA)»

---

📋 Spis treści

1. "Opis projektu" (#1-opis-projektu)
2. "Cele projektu" (#2-cele-projektu)
3. "Funkcjonalności" (#3-funkcjonalności)
4. "Technologie" (#4-technologie)
5. "Architektura systemu" (#5-architektura-systemu)
6. "Struktura katalogów" (#6-struktura-katalogów)
7. "Frontend" (#7-frontend)
8. "Backend" (#8-backend)
9. "Baza danych" (#9-baza-danych)
10. "REST API" (#10-rest-api)
11. "Autoryzacja i bezpieczeństwo" (#11-autoryzacja-i-bezpieczeństwo)
12. "Instalacja i uruchomienie" (#12-instalacja-i-uruchomienie)
13. "Podział obowiązków" (#13-podział-obowiązków)
14. "Harmonogram realizacji" (#14-harmonogram-realizacji)
15. "Testowanie" (#15-testowanie)
16. "Git i zasady współpracy" (#16-git-i-zasady-współpracy)
17. "Możliwości rozwoju" (#17-możliwości-rozwoju)
18. "Kryteria ukończenia" (#18-kryteria-ukończenia)

---

1. Opis projektu

Gamevers jest aplikacją internetową przeznaczoną dla osób zainteresowanych grami komputerowymi i konsolowymi.

Głównym założeniem jest stworzenie miejsca, w którym użytkownicy mogą wyszukiwać gry, sprawdzać informacje o nich, prowadzić własną bibliotekę oraz dzielić się opiniami.

Projekt łączy funkcjonalność katalogu gier z podstawowymi elementami portalu społecznościowego.

1.1. Grupa docelowa

- Gracze komputerowi i konsolowi.
- Osoby szukające nowych gier.
- Użytkownicy chcący prowadzić listę ukończonych gier.
- Osoby zainteresowane ocenianiem i recenzowaniem gier.

1.2. Założenia

- Nowoczesny interfejs w ciemnej kolorystyce.
- Responsywność na komputerach i telefonach.
- Prosta i intuicyjna nawigacja.
- Rozdzielenie frontendu i backendu.
- Bezpieczne zarządzanie kontami.
- Możliwość dalszej rozbudowy systemu.

1.3. Zakres MVP

Pierwsza wersja aplikacji obejmuje katalog gier, konta użytkowników, bibliotekę, recenzje oraz podstawowy panel administratora.

Projekt nie obejmuje uruchamiania gier w przeglądarce, czatu, forum ani integracji z zewnętrznymi platformami gamingowymi.

---

2. Cele projektu

Cel główny

Zaprojektowanie i stworzenie funkcjonalnego portalu gamingowego wykorzystującego nowoczesne technologie webowe.

Cele szczegółowe

1. Stworzenie responsywnego interfejsu użytkownika.
2. Zaprojektowanie relacyjnej bazy danych.
3. Implementacja REST API.
4. Stworzenie systemu rejestracji i logowania.
5. Implementacja katalogu gier.
6. Dodanie wyszukiwarki i filtrowania.
7. Stworzenie biblioteki użytkownika.
8. Implementacja ocen i recenzji.
9. Utworzenie panelu administratora.
10. Przeprowadzenie testów aplikacji.
11. Przygotowanie dokumentacji technicznej.
12. Poznanie zasad współpracy zespołowej z wykorzystaniem Git i GitHub.

---

3. Funkcjonalności

3.1. Strona główna

Strona główna stanowi punkt wejścia do aplikacji.

Planowane elementy:

- Pasek nawigacyjny z logo Gamevers.
- Menu główne.
- Wyszukiwarka gier.
- Baner wyróżnionej gry.
- Sekcja popularnych gier.
- Sekcja najwyżej ocenianych gier.
- Sekcja ostatnio dodanych gier.
- Stopka strony.

3.2. Katalog gier

Katalog umożliwia przeglądanie wszystkich gier zapisanych w bazie danych.

Funkcjonalności:

- Wyświetlanie gier w formie kart.
- Wyszukiwanie po tytule.
- Filtrowanie według gatunku.
- Filtrowanie według platformy.
- Sortowanie według nazwy, daty dodania, premiery i ocen.
- Paginacja wyników.
- Przejście do szczegółów wybranej gry.

3.3. Szczegóły gry

Każda gra posiada własną podstronę.

Wyświetlane informacje:

- Tytuł gry.
- Okładka i baner.
- Opis.
- Producent.
- Wydawca.
- Data premiery.
- Gatunki.
- Dostępne platformy.
- Średnia ocen użytkowników.
- Liczba recenzji.
- Lista recenzji.

Zalogowani użytkownicy mogą dodatkowo dodawać gry do biblioteki oraz publikować oceny i recenzje.

3.4. System użytkowników

System umożliwia:

- Rejestrację konta.
- Logowanie.
- Wylogowanie.
- Pobieranie danych aktualnie zalogowanego użytkownika.
- Edycję podstawowych danych profilu.
- Ochronę stron wymagających logowania.

3.5. Profil użytkownika

Profil zawiera:

- Nazwę użytkownika.
- Awatar zastępczy z inicjałami.
- Opis profilu.
- Datę utworzenia konta.
- Liczbę gier w bibliotece.
- Liczbę napisanych recenzji.

3.6. Biblioteka użytkownika

Każdy zalogowany użytkownik może tworzyć własną bibliotekę gier.

Dostępne statusy:

Status| Znaczenie
"wishlist"| Chcę zagrać
"playing"| Aktualnie gram
"completed"| Ukończone
"dropped"| Porzucone

Użytkownik może dodawać gry, zmieniać ich status oraz usuwać je z biblioteki.

Jedna gra może występować w bibliotece danego użytkownika tylko raz.

3.7. Oceny i recenzje

Zalogowany użytkownik może:

- Wystawić ocenę od 1 do 10.
- Napisać recenzję.
- Edytować własną recenzję.
- Usunąć własną recenzję.
- Przeglądać recenzje innych użytkowników.

Jeden użytkownik może opublikować maksymalnie jedną recenzję konkretnej gry.

Średnia ocena gry jest obliczana na podstawie ocen użytkowników.

3.8. Panel administratora

Administrator posiada dostęp do panelu zarządzania.

Funkcjonalności:

- Podgląd podstawowych statystyk.
- Dodawanie gier.
- Edytowanie gier.
- Usuwanie gier.
- Przesyłanie okładek i banerów.
- Przypisywanie gatunków i platform.
- Zarządzanie gatunkami.
- Przeglądanie recenzji.
- Usuwanie nieodpowiednich recenzji.

Dostęp do panelu jest ograniczony do kont posiadających rolę administratora.

---

4. Technologie

Frontend

Technologia| Zastosowanie
Vue 3| Budowanie interfejsu
JavaScript| Logika po stronie klienta
Vite| Środowisko developerskie
Vue Router| Routing
Pinia| Zarządzanie stanem
Axios| Komunikacja HTTP
Tailwind CSS| Stylowanie

Backend

Technologia| Zastosowanie
PHP| Język backendu
Laravel| Framework aplikacji
Eloquent ORM| Obsługa modeli i relacji
Laravel Sanctum| Uwierzytelnianie
Form Requests| Walidacja
Policies| Autoryzacja operacji

Baza danych

- MySQL.
- Relacyjny model danych.
- Klucze główne i obce.
- Migracje Laravel.
- Seedery danych testowych.

Narzędzia

- Visual Studio Code.
- Git.
- GitHub.
- Composer.
- Node.js i npm.
- Postman lub podobny klient API.
- Narzędzia developerskie przeglądarki.

---

5. Architektura systemu

Projekt wykorzystuje architekturę klient–serwer.

Frontend Vue 3 odpowiada za prezentowanie danych i interakcję z użytkownikiem.

Backend Laravel odpowiada za logikę biznesową, walidację, autoryzację i komunikację z bazą danych.

MySQL przechowuje dane użytkowników, gier, recenzji i bibliotek.

Schemat komunikacji

UŻYTKOWNIK
    |
    v
FRONTEND — VUE 3
    |
    | HTTP / JSON
    v
REST API — LARAVEL
    |
    | Eloquent ORM
    v
BAZA DANYCH — MYSQL

Przykładowy przepływ danych

1. Użytkownik otwiera katalog gier.
2. Vue wysyła zapytanie GET do Laravel.
3. Laravel pobiera gry z MySQL.
4. Backend zwraca odpowiedź JSON.
5. Vue wyświetla gry w postaci kart.

---

6. Struktura katalogów

Docelowa struktura repozytorium:

Gamevers/
|
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── games/
│   │   │   ├── reviews/
│   │   │   ├── library/
│   │   │   ├── admin/
│   │   │   └── ui/
│   │   ├── views/
│   │   │   └── admin/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── composables/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
|
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   └── Policies/
│   ├── bootstrap/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── composer.json
│   └── artisan
|
├── docs/
│   ├── requirements.md
│   ├── database.md
│   ├── api.md
│   └── architecture.md
|
├── .gitignore
└── README.md

Struktura jest docelowa. Na etapie przygotowania repozytorium nie wszystkie katalogi i pliki muszą jeszcze istnieć.

---

7. Frontend

Frontend jest tworzony z wykorzystaniem Vue 3.

Główne widoki

Plik| Funkcjonalność
"HomeView.vue"| Strona główna
"GamesView.vue"| Katalog gier
"GameDetailsView.vue"| Szczegóły gry
"LoginView.vue"| Logowanie
"RegisterView.vue"| Rejestracja
"ProfileView.vue"| Profil
"LibraryView.vue"| Biblioteka
"NotFoundView.vue"| Strona 404
"AdminDashboardView.vue"| Dashboard administratora
"AdminGamesView.vue"| Zarządzanie grami
"AdminGameFormView.vue"| Formularz gry
"AdminReviewsView.vue"| Moderacja recenzji

Główne komponenty

Layout:

- "AppNavbar.vue"
- "AppFooter.vue"
- "AppLayout.vue"

Gry:

- "GameCard.vue"
- "GameGrid.vue"
- "GameFilters.vue"
- "GameSearch.vue"
- "GameHero.vue"
- "GameInfo.vue"

Recenzje:

- "ReviewCard.vue"
- "ReviewList.vue"
- "ReviewForm.vue"

Biblioteka:

- "LibraryCard.vue"
- "LibraryStatusSelect.vue"

Panel administratora:

- "AdminSidebar.vue"
- "GameForm.vue"
- "AdminStats.vue"

Elementy wielokrotnego użytku:

- "BaseButton.vue"
- "BaseInput.vue"
- "BaseModal.vue"
- "BaseLoader.vue"
- "BasePagination.vue"
- "BaseAlert.vue"

Warstwa komunikacji API

Planowane pliki:

- "api.js" — konfiguracja Axios.
- "authService.js" — autoryzacja.
- "gameService.js" — katalog gier.
- "reviewService.js" — recenzje.
- "libraryService.js" — biblioteka.
- "adminService.js" — operacje administracyjne.

Routing

Publiczne trasy:

/
/games
/games/:slug
/login
/register

Trasy wymagające logowania:

/profile
/library

Trasy administratora:

/admin
/admin/games
/admin/games/create
/admin/games/:id/edit
/admin/reviews

Styl interfejsu

Gamevers wykorzystuje ciemny motyw inspirowany nowoczesnymi portalami gamingowymi.

Element| Kolor
Tło| "#0B0F19"
Karty| "#151B2B"
Akcent główny| "#8B5CF6"
Akcent dodatkowy| "#22D3EE"
Tekst główny| "#F8FAFC"
Tekst pomocniczy| "#94A3B8"

Interfejs będzie responsywny i dostosowany do telefonów, tabletów oraz komputerów.

---

8. Backend

Backend jest realizowany przy użyciu Laravel.

Modele

Model| Odpowiedzialność
"User.php"| Konta użytkowników
"Game.php"| Gry
"Genre.php"| Gatunki
"Platform.php"| Platformy
"Review.php"| Oceny i recenzje
"UserGame.php"| Biblioteka użytkownika

Kontrolery

Kontroler| Odpowiedzialność
"AuthController.php"| Rejestracja i logowanie
"GameController.php"| Katalog i szczegóły gier
"GenreController.php"| Lista gatunków
"PlatformController.php"| Lista platform
"ReviewController.php"| Recenzje
"LibraryController.php"| Biblioteka
"ProfileController.php"| Profil
"Admin/GameController.php"| Zarządzanie grami
"Admin/ReviewController.php"| Moderacja
"Admin/DashboardController.php"| Statystyki

Walidacja

Laravel będzie walidował wszystkie dane przesyłane przez użytkowników.

Przykładowe zasady:

- Nazwa użytkownika: 3–30 znaków.
- Email: poprawny i unikalny.
- Hasło: minimum 8 znaków.
- Tytuł gry: 2–150 znaków.
- Recenzja: 10–2000 znaków.
- Ocena: liczba całkowita od 1 do 10.
- Grafika: JPG, PNG lub WebP, maksymalnie 2 MB.

---

9. Baza danych

System wykorzystuje bazę MySQL.

Główne tabele

Tabela| Przeznaczenie
"users"| Użytkownicy
"games"| Katalog gier
"genres"| Gatunki
"platforms"| Platformy
"game_genre"| Powiązania gier z gatunkami
"game_platform"| Powiązania gier z platformami
"reviews"| Recenzje
"user_games"| Biblioteki użytkowników

Tabela users

id
name
email
password
role
bio
email_verified_at
remember_token
created_at
updated_at

Tabela games

id
title
slug
description
developer
publisher
release_date
cover_image
banner_image
is_featured
created_at
updated_at

Tabela genres

id
name
slug
created_at
updated_at

Tabela platforms

id
name
slug
created_at
updated_at

Tabela reviews

id
user_id
game_id
rating
content
created_at
updated_at

Tabela user_games

id
user_id
game_id
status
created_at
updated_at

Tabele pośrednie

"game_genre":

game_id
genre_id

"game_platform":

game_id
platform_id

Relacje

- User → Reviews: jeden do wielu.
- User → UserGames: jeden do wielu.
- Game → Reviews: jeden do wielu.
- Game → UserGames: jeden do wielu.
- Game ↔ Genres: wiele do wielu.
- Game ↔ Platforms: wiele do wielu.

Ograniczenia

- Email i nazwa użytkownika są unikalne.
- Slug gry jest unikalny.
- Użytkownik może napisać jedną recenzję danej gry.
- Gra może występować tylko raz w bibliotece użytkownika.
- Klucze obce zapewniają integralność danych.

---

10. REST API

Bazowy adres API w środowisku lokalnym:

http://localhost:8000/api

Endpointy publiczne

Metoda| Endpoint| Opis
GET| "/games"| Lista gier
GET| "/games/{slug}"| Szczegóły gry
GET| "/games/featured"| Wyróżniona gra
GET| "/games/popular"| Popularne gry
GET| "/games/top-rated"| Najwyżej oceniane gry
GET| "/games/{id}/reviews"| Recenzje gry
GET| "/genres"| Lista gatunków
GET| "/platforms"| Lista platform

Autoryzacja

Metoda| Endpoint| Opis
POST| "/register"| Rejestracja
POST| "/login"| Logowanie
POST| "/logout"| Wylogowanie
GET| "/user"| Dane użytkownika

Profil i biblioteka

Metoda| Endpoint| Opis
GET| "/profile"| Profil
PATCH| "/profile"| Edycja profilu
GET| "/library"| Biblioteka
POST| "/library"| Dodanie gry
PATCH| "/library/{gameId}"| Zmiana statusu
DELETE| "/library/{gameId}"| Usunięcie gry

Recenzje

Metoda| Endpoint| Opis
POST| "/games/{id}/reviews"| Dodanie recenzji
PATCH| "/reviews/{id}"| Edycja recenzji
DELETE| "/reviews/{id}"| Usunięcie recenzji

Administracja

Metoda| Endpoint| Opis
GET| "/admin/stats"| Statystyki
GET| "/admin/games"| Lista gier
POST| "/admin/games"| Dodanie gry
PATCH| "/admin/games/{id}"| Edycja gry
DELETE| "/admin/games/{id}"| Usunięcie gry
GET| "/admin/reviews"| Lista recenzji
DELETE| "/admin/reviews/{id}"| Usunięcie recenzji
POST| "/admin/genres"| Dodanie gatunku
PATCH| "/admin/genres/{id}"| Edycja gatunku
DELETE| "/admin/genres/{id}"| Usunięcie gatunku

Uwaga: Endpointy stanowią planowany kontrakt API. Ich implementacja nastąpi podczas realizacji backendu.

---

11. Autoryzacja i bezpieczeństwo

Planowane mechanizmy:

- Laravel Sanctum do uwierzytelniania SPA.
- Sesje i bezpieczne ciasteczka HTTP-only.
- Ochrona CSRF.
- Hashowanie haseł.
- Walidacja danych po stronie serwera.
- Middleware sprawdzające logowanie.
- Middleware sprawdzające rolę administratora.
- Policies ograniczające edycję cudzych danych.
- Ochrona przed nieautoryzowanym dostępem.
- Ograniczanie częstotliwości żądań.
- Bezpieczna obsługa przesyłanych plików.

Hasła, klucze aplikacji i dane dostępowe nie będą przechowywane w repozytorium.

---

12. Instalacja i uruchomienie

Instrukcja dotyczy docelowej struktury po wygenerowaniu projektów Vue i Laravel.

12.1. Wymagania

Przed uruchomieniem należy zainstalować:

- Git.
- PHP w wersji zgodnej z wybraną wersją Laravel.
- Composer.
- Node.js w wersji zgodnej z Vite.
- npm.
- MySQL.

12.2. Klonowanie repozytorium

git clone https://github.com/OWNER/Gamevers.git
cd Gamevers

"OWNER" należy zastąpić nazwą właściciela repozytorium.

12.3. Uruchomienie backendu

cd backend
composer install

Skopiowanie konfiguracji:

cp .env.example .env

Na Windows można użyć odpowiedniego polecenia PowerShell.

Następnie:

php artisan key:generate

W pliku ".env" należy skonfigurować połączenie z MySQL:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gamevers
DB_USERNAME=root
DB_PASSWORD=

Podane wartości są przykładowe i wymagają dostosowania do lokalnej konfiguracji.

Następnie:

php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve

Backend będzie domyślnie dostępny pod adresem:

http://localhost:8000

12.4. Uruchomienie frontendu

W drugim terminalu:

cd frontend
npm install
npm run dev

Frontend będzie zwykle dostępny pod adresem:

http://localhost:5173

12.5. Konfiguracja komunikacji

W frontendzie można zastosować:

VITE_API_URL=http://localhost:8000/api

Konfiguracja Axios powinna korzystać z tej zmiennej.

W przypadku uwierzytelniania Sanctum należy dodatkowo skonfigurować dozwolone domeny aplikacji, ciasteczka, CORS i obsługę CSRF.

---

13. Podział obowiązków

Projekt realizują dwie osoby.

Programista 1 — Frontend

Odpowiedzialność:

- Konfiguracja Vue 3.
- Konfiguracja Vue Router.
- Konfiguracja Pinia.
- Konfiguracja Tailwind CSS.
- Projektowanie interfejsu.
- Tworzenie komponentów.
- Tworzenie widoków.
- Formularze.
- Integracja z API.
- Responsywność.
- Testowanie frontendu.

Programista 2 — Backend

Odpowiedzialność:

- Konfiguracja Laravel.
- Konfiguracja MySQL.
- Projektowanie bazy danych.
- Tworzenie migracji.
- Tworzenie modeli.
- Implementacja relacji.
- Tworzenie kontrolerów.
- Tworzenie REST API.
- Rejestracja i logowanie.
- Autoryzacja.
- Walidacja.
- Seedery.
- Testowanie backendu.

Zadania wspólne

- Dokumentacja.
- Ustalanie kontraktu API.
- Integracja aplikacji.
- Code review.
- Rozwiązywanie konfliktów Git.
- Testy końcowe.
- Prezentacja projektu.

---

14. Harmonogram realizacji

Projekt zaplanowano na 15 dni roboczych.

Tydzień 1 — Fundamenty

Dzień| Zadania
1| Dokumentacja, repozytorium, architektura
2| Konfiguracja Vue i Laravel
3| Baza danych i podstawowy layout
4| API gier i komponenty katalogu
5| Wyszukiwanie, filtrowanie, integracja katalogu

Rezultat: Działający katalog gier.

Tydzień 2 — Funkcjonalności użytkownika

Dzień| Zadania
6| Szczegóły gry
7| Rejestracja i logowanie
8| Profil użytkownika
9| Biblioteka
10| Oceny i recenzje

Rezultat: Działające konta i interakcje użytkowników.

Tydzień 3 — Administracja i finalizacja

Dzień| Zadania
11| Panel administratora
12| Zarządzanie grami i recenzjami
13| Integracja i responsywność
14| Testy i poprawki
15| Dokumentacja końcowa i prezentacja

Rezultat: Gotowe MVP aplikacji Gamevers.

---

15. Testowanie

Testy backendu

- Rejestracja użytkownika.
- Logowanie i wylogowanie.
- Walidacja danych.
- Pobieranie katalogu.
- Filtrowanie gier.
- Dodawanie do biblioteki.
- Blokowanie duplikatów.
- Dodawanie recenzji.
- Kontrola właściciela recenzji.
- Uprawnienia administratora.

Testy frontendu

- Poprawne wyświetlanie widoków.
- Nawigacja.
- Formularze.
- Obsługa błędów.
- Stany ładowania.
- Responsywność.
- Wyświetlanie danych z API.

Testy integracyjne

- Rejestracja i zalogowanie.
- Dodanie gry do biblioteki.
- Zmiana statusu gry.
- Wystawienie recenzji.
- Edycja recenzji.
- Dodanie gry przez administratora.
- Wyświetlenie nowej gry w katalogu.

---

16. Git i zasady współpracy

Projekt wykorzystuje GitHub do przechowywania kodu i organizacji pracy.

Gałęzie

main
  |
  └── develop
        |
        ├── feature/frontend-setup
        ├── feature/backend-setup
        ├── feature/game-catalog
        ├── feature/authentication
        ├── feature/user-library
        └── feature/admin-panel

Zasady

1. "main" przechowuje stabilną wersję projektu.
2. "develop" służy do integracji funkcjonalności.
3. Nowe funkcje powstają na osobnych gałęziach.
4. Zmiany są przesyłane przez Pull Request.
5. Przed scaleniem należy sprawdzić kod.
6. Nie przesyłamy plików ".env".
7. Nie przesyłamy katalogów "node_modules" i "vendor".
8. Commity powinny posiadać czytelne opisy.
9. Zmiany kontraktu API wymagają uzgodnienia.
10. Każdy programista odpowiada za testowanie swoich zmian.

Przykładowe commity

feat(frontend): add game cards
feat(backend): create game model
feat(auth): implement login
fix(api): correct validation
docs: update project documentation
test: add review tests

---

17. Możliwości rozwoju

Po ukończeniu MVP projekt może zostać rozbudowany o:

- System znajomych.
- Obserwowanie użytkowników.
- Komentarze.
- Forum.
- Powiadomienia.
- Listy rankingowe.
- System osiągnięć.
- Rekomendacje gier.
- Integrację z zewnętrznymi API.
- Integrację ze Steam.

18. Kryteria ukończenia
Projekt zostanie uznany za ukończony, gdy:
[ ]
Frontend Vue działa poprawnie.
[ ]
Backend Laravel działa poprawnie.
[ ]
Baza danych jest skonfigurowana.
[ ]
Migracje i seedery działają.
[ ]
Katalog pobiera gry z bazy.
[ ]
Wyszukiwanie i filtrowanie działa.
[ ]
Rejestracja i logowanie działają.
[ ]
Użytkownik może edytować profil.
[ ]
Biblioteka użytkownika działa.
[ ]
Oceny i recenzje działają.
[ ]
Panel administratora działa.
[ ]
Uprawnienia są poprawnie zabezpieczone.
[ ]
Interfejs jest responsywny.
[ ]
Najważniejsze testy przechodzą poprawnie.
[ ]
Dokumentacja jest aktualna.
[ ]
Projekt można uruchomić na innym komputerze.
📌 Podsumowanie
Gamevers jest projektem edukacyjnym mającym na celu praktyczne wykorzystanie technologii frontendowych, backendowych i bazodanowych.
Projekt pozwoli zdobyć doświadczenie w tworzeniu aplikacji SPA, projektowaniu REST API, zarządzaniu relacyjnymi bazami danych, implementowaniu autoryzacji oraz współpracy zespołowej z wykorzystaniem GitHub.
Planowany rezultat: Kompletny, działający i responsywny portal gamingowy z katalogiem gier, kontami użytkowników, biblioteką, recenzjami i panelem administratora.
