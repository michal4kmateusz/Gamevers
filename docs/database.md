
GAMEVERS — Dokumentacja bazy danych
Projekt: Gamevers
Plik: docs/database.md
Wersja: 1.0
Data: 23.11.2026
Status: Projekt techniczny — do zatwierdzenia
Technologia: MySQL 8.0+, Laravel Eloquent ORM
Nazwa bazy danych: gamevers
1. Cel dokumentu
Celem dokumentu jest określenie kompletnej struktury relacyjnej bazy danych dla aplikacji Gamevers.
Dokument definiuje:
Wszystkie tabele aplikacji.
Kolumny i typy danych.
Klucze główne i obce.
Relacje pomiędzy tabelami.
Ograniczenia integralności.
Indeksy.
Reguły usuwania danych.
Modele Laravel.
Migracje Laravel.
Seedery i dane testowe.
Kolejność implementacji.
Kryteria testowania bazy.
Dokument stanowi podstawę do tworzenia backendu Laravel i REST API.
2. Założenia architektoniczne
2.1. System bazodanowy
Wykorzystujemy:
MySQL 8.0 lub nowszy.
Silnik tabel InnoDB.
Kodowanie utf8mb4.
Klucze główne typu BIGINT UNSIGNED.
Automatyczne identyfikatory AUTO_INCREMENT.
Klucze obce.
Migracje Laravel.
Eloquent ORM.
2.2. Główne zasady
Każda główna encja posiada identyfikator id.
Dane są przechowywane w relacyjnych tabelach.
Powiązania wiele-do-wielu wykorzystują tabele pośrednie.
Hasła użytkowników są przechowywane wyłącznie jako bezpieczne hashe.
Data utworzenia i aktualizacji jest przechowywana w kolumnach created_at i updated_at.
Integralność danych jest kontrolowana zarówno przez MySQL, jak i Laravel.
Pliki graficzne nie są zapisywane bezpośrednio w bazie — przechowujemy jedynie ich ścieżki.
Nie zapisujemy wyliczonej średniej ocen w tabeli gier. Obliczamy ją z recenzji.
3. Lista tabel
Projekt obejmuje 8 głównych tabel biznesowych.
Tabela
Opis
users
Konta użytkowników
games
Katalog gier
genres
Gatunki gier
platforms
Platformy
game_genre
Powiązania gier z gatunkami
game_platform
Powiązania gier z platformami
reviews
Oceny i recenzje
user_games
Biblioteki użytkowników
Dodatkowo Laravel może utworzyć tabele techniczne, np. sessions, cache, jobs, password_reset_tokens, zależnie od konfiguracji frameworka.
Tabele techniczne nie są częścią głównego modelu biznesowego.
4. Schemat relacji
erDiagram
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ USER_GAMES : owns
    GAMES ||--o{ REVIEWS : receives
    GAMES ||--o{ USER_GAMES : belongs_to
    GAMES ||--o{ GAME_GENRE : has
    GENRES ||--o{ GAME_GENRE : categorizes
    GAMES ||--o{ GAME_PLATFORM : supports
    PLATFORMS ||--o{ GAME_PLATFORM : identifies
4.1. Typy relacji
Tabele
Relacja
users → reviews
Jeden do wielu
users → user_games
Jeden do wielu
games → reviews
Jeden do wielu
games → user_games
Jeden do wielu
games ↔ genres
Wiele do wielu
games ↔ platforms
Wiele do wielu
users ↔ games przez user_games
Wiele do wielu
5. Tabela users
5.1. Przeznaczenie
Przechowuje informacje o zarejestrowanych użytkownikach portalu Gamevers.
5.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
Opis
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
Identyfikator
name
VARCHAR(30)
NOT NULL, UNIQUE
Nazwa użytkownika
email
VARCHAR(255)
NOT NULL, UNIQUE
Email
password
VARCHAR(255)
NOT NULL
Hash hasła
role
VARCHAR(20)
NOT NULL, DEFAULT 'user'
Rola
bio
VARCHAR(500)
NULL
Opis profilu
email_verified_at
TIMESTAMP
NULL
Weryfikacja email
remember_token
VARCHAR(100)
NULL
Token zapamiętania
created_at
TIMESTAMP
NULL
Utworzenie konta
updated_at
TIMESTAMP
NULL
Aktualizacja
5.3. Reguły
name musi zawierać od 3 do 30 znaków.
email musi być unikalny.
password nie może zawierać hasła jawnego.
role przyjmuje user lub admin.
bio może być puste.
Rejestracja publiczna zawsze tworzy konto z rolą user.
Administrator jest nadawany wyłącznie zaufaną operacją po stronie serwera.
5.4. Relacje Eloquent
public function reviews()
{
    return $this->hasMany(Review::class);
}

public function userGames()
{
    return $this->hasMany(UserGame::class);
}

public function games()
{
    return $this->belongsToMany(Game::class, 'user_games')
        ->withPivot('status')
        ->withTimestamps();
}
6. Tabela games
6.1. Przeznaczenie
Przechowuje informacje o grach dostępnych w katalogu.
6.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
Opis
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
Identyfikator
title
VARCHAR(150)
NOT NULL
Tytuł
slug
VARCHAR(180)
NOT NULL, UNIQUE
Adres URL
description
TEXT
NOT NULL
Opis
developer
VARCHAR(150)
NULL
Producent
publisher
VARCHAR(150)
NULL
Wydawca
release_date
DATE
NULL
Data premiery
cover_image
VARCHAR(255)
NULL
Ścieżka okładki
banner_image
VARCHAR(255)
NULL
Ścieżka banera
is_featured
BOOLEAN
NOT NULL, DEFAULT FALSE
Wyróżnienie
created_at
TIMESTAMP
NULL
Data dodania
updated_at
TIMESTAMP
NULL
Data aktualizacji
6.3. Reguły
Tytuł zawiera od 2 do 150 znaków.
Slug jest unikalny.
Opis nie może być pusty.
Data premiery może być nieznana.
Grafiki są opcjonalne.
W bazie przechowujemy ścieżki do grafik, nie ich zawartość.
Jednocześnie może istnieć wiele gier oznaczonych jako wyróżnione; strona główna wybiera jedną deterministycznie.
6.4. Przykład
{
  "id": 1,
  "title": "Example Adventure",
  "slug": "example-adventure",
  "description": "Przykładowa gra przygodowa.",
  "developer": "Example Studio",
  "publisher": "Example Publisher",
  "release_date": "2025-06-10",
  "cover_image": "games/covers/example.webp",
  "banner_image": "games/banners/example.webp",
  "is_featured": true
}
6.5. Relacje Eloquent
public function genres()
{
    return $this->belongsToMany(Genre::class, 'game_genre');
}

public function platforms()
{
    return $this->belongsToMany(Platform::class, 'game_platform');
}

public function reviews()
{
    return $this->hasMany(Review::class);
}

public function userGames()
{
    return $this->hasMany(UserGame::class);
}
7. Tabela genres
7.1. Przeznaczenie
Przechowuje słownik gatunków gier.
7.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
name
VARCHAR(100)
NOT NULL, UNIQUE
slug
VARCHAR(120)
NOT NULL, UNIQUE
created_at
TIMESTAMP
NULL
updated_at
TIMESTAMP
NULL
7.3. Przykładowe dane
id
name
slug
1
RPG
rpg
2
Action
action
3
Adventure
adventure
4
Strategy
strategy
5
Simulation
simulation
6
Racing
racing
7
Sports
sports
8
Horror
horror
7.4. Relacja
public function games()
{
    return $this->belongsToMany(Game::class, 'game_genre');
}
8. Tabela platforms
8.1. Przeznaczenie
Przechowuje listę platform, na których dostępne są gry.
8.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
name
VARCHAR(100)
NOT NULL, UNIQUE
slug
VARCHAR(120)
NOT NULL, UNIQUE
created_at
TIMESTAMP
NULL
updated_at
TIMESTAMP
NULL
8.3. Przykładowe dane
id
name
slug
1
PC
pc
2
PlayStation 5
ps5
3
Xbox Series X/S
xbox-series
4
Nintendo Switch
nintendo-switch
5
PlayStation 4
ps4
8.4. Relacja
public function games()
{
    return $this->belongsToMany(Game::class, 'game_platform');
}
9. Tabela game_genre
9.1. Przeznaczenie
Tabela pośrednia łącząca gry z gatunkami.
Jedna gra może posiadać wiele gatunków, a jeden gatunek może być przypisany do wielu gier.
9.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
game_id
BIGINT UNSIGNED
FK → games.id
genre_id
BIGINT UNSIGNED
FK → genres.id
9.3. Klucz główny
Złożony klucz główny:
PRIMARY KEY (game_id, genre_id)
Zapobiega wielokrotnemu przypisaniu tego samego gatunku do gry.
9.4. Usuwanie
Usunięcie gry usuwa powiązania z gatunkami.
Usunięcie gatunku usuwa jego powiązania z grami.
Nie powoduje to usuwania samych gier ani pozostałych gatunków.
10. Tabela game_platform
10.1. Przeznaczenie
Tabela pośrednia łącząca gry z platformami.
10.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
game_id
BIGINT UNSIGNED
FK → games.id
platform_id
BIGINT UNSIGNED
FK → platforms.id
10.3. Klucz główny
PRIMARY KEY (game_id, platform_id)
10.4. Usuwanie
Usunięcie gry usuwa jej powiązania z platformami.
Usunięcie platformy usuwa jej powiązania z grami.
Nie usuwa pozostałych rekordów.
11. Tabela reviews
11.1. Przeznaczenie
Przechowuje oceny i recenzje publikowane przez użytkowników.
11.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
Opis
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
Identyfikator
user_id
BIGINT UNSIGNED
FK, NOT NULL
Autor
game_id
BIGINT UNSIGNED
FK, NOT NULL
Gra
rating
TINYINT UNSIGNED
NOT NULL
Ocena 1–10
content
TEXT
NOT NULL
Recenzja
created_at
TIMESTAMP
NULL
Data publikacji
updated_at
TIMESTAMP
NULL
Data edycji
11.3. Ograniczenia
Ocena od 1 do 10.
Treść od 10 do 2000 znaków.
Jeden użytkownik może mieć jedną recenzję danej gry.
Recenzja musi wskazywać istniejącego użytkownika i grę.
Wymagany indeks unikalny:
UNIQUE (user_id, game_id)
Zalecane ograniczenie MySQL:
CHECK (rating BETWEEN 1 AND 10)
Długość treści należy dodatkowo walidować w Laravel.
11.4. Relacje
public function user()
{
    return $this->belongsTo(User::class);
}

public function game()
{
    return $this->belongsTo(Game::class);
}
11.5. Obliczanie ocen
Średnia ocen jest obliczana z tabeli reviews.
Przykładowe zapytanie:
SELECT
    game_id,
    ROUND(AVG(rating), 1) AS average_rating,
    COUNT(*) AS reviews_count
FROM reviews
GROUP BY game_id;
Gry bez recenzji powinny mieć wartość NULL dla średniej, a frontend wyświetli „Brak ocen”.
12. Tabela user_games
12.1. Przeznaczenie
Przechowuje gry dodane do prywatnych bibliotek użytkowników.
12.2. Struktura
Kolumna
Typ MySQL
Ograniczenia
Opis
id
BIGINT UNSIGNED
PK, AUTO_INCREMENT
Identyfikator
user_id
BIGINT UNSIGNED
FK, NOT NULL
Użytkownik
game_id
BIGINT UNSIGNED
FK, NOT NULL
Gra
status
VARCHAR(20)
NOT NULL
Status
created_at
TIMESTAMP
NULL
Dodanie
updated_at
TIMESTAMP
NULL
Aktualizacja
12.3. Statusy
Wartość
Znaczenie
wishlist
Chcę zagrać
playing
Aktualnie gram
completed
Ukończone
dropped
Porzucone
12.4. Ograniczenia
Jedna gra może występować w bibliotece użytkownika tylko raz.
Status musi należeć do dozwolonej listy.
Użytkownik nie może zarządzać cudzą biblioteką.
Indeks:
UNIQUE (user_id, game_id)
Ograniczenie:
CHECK (
    status IN (
        'wishlist',
        'playing',
        'completed',
        'dropped'
    )
)
12.5. Relacje
public function user()
{
    return $this->belongsTo(User::class);
}

public function game()
{
    return $this->belongsTo(Game::class);
}
13. Klucze obce i reguły usuwania
Tabela
Klucz obcy
Tabela docelowa
ON DELETE
reviews
user_id
users.id
CASCADE
reviews
game_id
games.id
CASCADE
user_games
user_id
users.id
CASCADE
user_games
game_id
games.id
CASCADE
game_genre
game_id
games.id
CASCADE
game_genre
genre_id
genres.id
CASCADE
game_platform
game_id
games.id
CASCADE
game_platform
platform_id
platforms.id
CASCADE
Wszystkie relacje wykorzystują klucze obce.
Dla operacji aktualizacji identyfikatorów można zastosować RESTRICT, ponieważ klucze główne nie powinny być ręcznie zmieniane.
14. Indeksy
14.1. Indeksy unikalne
users.name
users.email
games.slug
genres.name
genres.slug
platforms.name
platforms.slug
reviews(user_id, game_id)
user_games(user_id, game_id)
game_genre(game_id, genre_id) — klucz główny
game_platform(game_id, platform_id) — klucz główny
14.2. Indeksy wyszukiwania i sortowania
Zalecane:
games.title
games.created_at
games.release_date
games.is_featured
reviews(game_id, created_at)
user_games(user_id, status)
Dla tabel pośrednich należy zapewnić indeksy zaczynające się od genre_id oraz platform_id, aby filtrowanie po gatunku i platformie było wydajne.
14.3. Uwagi wydajnościowe
Indeks B-tree na games.title może pomóc przy sortowaniu i wyszukiwaniu prefiksowym.
Wyszukiwanie fragmentów tytułu za pomocą LIKE '%tekst%' nie wykorzystuje zwykle takiego indeksu efektywnie.
W MVP, przy niewielkim katalogu, dopuszczamy proste wyszukiwanie LIKE.
15. Modele Laravel
Planowane pliki:
backend/app/Models/
├── User.php
├── Game.php
├── Genre.php
├── Platform.php
├── Review.php
└── UserGame.php
15.1. User
Relacje:
hasMany(Review)
hasMany(UserGame)
belongsToMany(Game)
15.2. Game
Relacje:
belongsToMany(Genre)
belongsToMany(Platform)
hasMany(Review)
hasMany(UserGame)
15.3. Genre
Relacja:
belongsToMany(Game)
15.4. Platform
Relacja:
belongsToMany(Game)
15.5. Review
Relacje:
belongsTo(User)
belongsTo(Game)
15.6. UserGame
Relacje:
belongsTo(User)
belongsTo(Game)
16. Migracje Laravel
16.1. Planowane pliki
Nazwy migracji będą poprzedzone rzeczywistymi znacznikami czasu wygenerowanymi przez Laravel.
backend/database/migrations/
├── ..._create_users_table.php
├── ..._create_games_table.php
├── ..._create_genres_table.php
├── ..._create_platforms_table.php
├── ..._create_game_genre_table.php
├── ..._create_game_platform_table.php
├── ..._create_reviews_table.php
└── ..._create_user_games_table.php
Migracja users może być dostarczona przez instalację Laravel i powinna zostać dostosowana zamiast tworzenia drugiej tabeli.
16.2. Kolejność
users
games
genres
platforms
game_genre
game_platform
reviews
user_games
Kolejność zapewnia istnienie tabel nadrzędnych przed utworzeniem kluczy obcych.
16.3. Przykładowa migracja reviews
Schema::create('reviews', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->foreignId('game_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->unsignedTinyInteger('rating');
    $table->text('content');
    $table->timestamps();

    $table->unique(['user_id', 'game_id']);
    $table->index(['game_id', 'created_at']);
});
Ograniczenie CHECK dla oceny należy dodać osobno w migracji, jeżeli używana wersja Laravel nie udostępnia odpowiedniego pomocniczego mechanizmu.
16.4. Przykładowa migracja user_games
Schema::create('user_games', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->foreignId('game_id')
        ->constrained()
        ->cascadeOnDelete();
    $table->string('status', 20)
        ->default('wishlist');
    $table->timestamps();

    $table->unique(['user_id', 'game_id']);
    $table->index(['user_id', 'status']);
});
Dodatkowo należy wprowadzić ograniczenie dozwolonych statusów.
17. Seedery
17.1. Przeznaczenie
Seedery pozwalają przygotować dane demonstracyjne i testowe.
17.2. Planowane pliki
backend/database/seeders/
├── DatabaseSeeder.php
├── GenreSeeder.php
├── PlatformSeeder.php
├── GameSeeder.php
├── UserSeeder.php
├── ReviewSeeder.php
└── UserGameSeeder.php
17.3. Dane demonstracyjne
Proponowane minimum:
Dane
Liczba
Administrator
1
Zwykli użytkownicy
5
Gry
20
Gatunki
8
Platformy
5
Recenzje
30
Wpisy biblioteki
25
Dane muszą być zgodne z ograniczeniami unikalności.
Seedery powinny umożliwiać odtworzenie środowiska demonstracyjnego.
Konta testowe muszą posiadać hasła przeznaczone wyłącznie do środowiska lokalnego.
18. Fabryki danych
Planowane fabryki:
backend/database/factories/
├── UserFactory.php
├── GameFactory.php
├── ReviewFactory.php
└── UserGameFactory.php
Fabryki służą do generowania danych podczas testów automatycznych.
Nie mogą tworzyć niepoprawnych relacji ani naruszać unikalności.
19. Operacje biznesowe na bazie danych
19.1. Rejestracja
Walidacja danych.
Sprawdzenie unikalności.
Hashowanie hasła.
Utworzenie rekordu w users.
Przypisanie roli user.
19.2. Dodanie gry
Walidacja formularza.
Generowanie unikalnego sluga.
Zapis gry.
Powiązanie gatunków.
Powiązanie platform.
Zapis ścieżek grafik.
Zapis gry i relacji powinien odbywać się w transakcji.
19.3. Dodanie recenzji
Sprawdzenie uwierzytelnienia.
Sprawdzenie istnienia gry.
Walidacja oceny i treści.
Sprawdzenie, czy recenzja już istnieje.
Zapis recenzji.
Indeks unikalny stanowi dodatkową ochronę przed duplikatami.
19.4. Dodanie gry do biblioteki
Sprawdzenie uwierzytelnienia.
Sprawdzenie istnienia gry.
Walidacja statusu.
Sprawdzenie duplikatu.
Zapis wpisu.
19.5. Usunięcie gry
Sprawdzenie roli administratora.
Potwierdzenie operacji.
Usunięcie rekordu gry.
Automatyczne usunięcie powiązanych recenzji i wpisów biblioteki.
Usunięcie powiązań z gatunkami i platformami.
Pliki graficzne należy usuwać osobno, ponieważ operacje kluczy obcych nie usuwają plików z dysku.
20. Bezpieczeństwo danych
20.1. Hasła
Hasła są hashowane mechanizmem Laravel.
Hasła jawne nie są zapisywane w bazie.
Hash hasła nie jest zwracany przez API.
20.2. Dostęp do danych
Użytkownik zarządza wyłącznie własnymi recenzjami i biblioteką.
Administrator zarządza katalogiem i moderacją.
Każde żądanie modyfikujące dane jest autoryzowane po stronie serwera.
20.3. Walidacja
Walidacja jest wykonywana w Laravel niezależnie od walidacji formularzy Vue.
20.4. Pliki konfiguracyjne
Plik .env nie może być przesyłany do GitHub.
Dane dostępowe do MySQL nie mogą być umieszczane w kodzie źródłowym.
21. Testowanie bazy danych
21.1. Testy struktury
[ ]
Wszystkie migracje wykonują się poprawnie.
[ ]
Wszystkie tabele istnieją.
[ ]
Klucze główne działają.
[ ]
Klucze obce działają.
[ ]
Indeksy unikalne działają.
[ ]
Ograniczenia CHECK działają.
21.2. Testy integralności
[ ]
Nie można dodać recenzji nieistniejącej gry.
[ ]
Nie można dodać dwóch recenzji tej samej gry przez jednego użytkownika.
[ ]
Nie można dodać gry dwukrotnie do tej samej biblioteki.
[ ]
Nie można zapisać oceny spoza zakresu 1–10.
[ ]
Nie można zapisać niepoprawnego statusu biblioteki.
[ ]
Usunięcie gry usuwa odpowiednie powiązania.
[ ]
Usunięcie gatunku nie usuwa gry.
21.3. Testy danych demonstracyjnych
[ ]
Seedery wykonują się poprawnie.
[ ]
Gry mają poprawne gatunki.
[ ]
Gry mają poprawne platformy.
[ ]
Recenzje wskazują istniejące gry i użytkowników.
[ ]
Biblioteki zawierają poprawne wpisy.
[ ]
Konto administratora posiada właściwą rolę.
22. Kolejność implementacji
Etap 1 — Konfiguracja
Instalacja MySQL.
Utworzenie bazy gamevers.
Konfiguracja .env.
Sprawdzenie połączenia Laravel z MySQL.
Etap 2 — Migracje
Dostosowanie tabeli users.
Utworzenie games.
Utworzenie genres.
Utworzenie platforms.
Utworzenie tabel pośrednich.
Utworzenie reviews.
Utworzenie user_games.
Dodanie indeksów i ograniczeń.
Etap 3 — Modele
User.
Game.
Genre.
Platform.
Review.
UserGame.
Definicje relacji.
Etap 4 — Dane testowe
Gatunki.
Platformy.
Gry.
Użytkownicy.
Recenzje.
Biblioteki.
Etap 5 — Weryfikacja
Uruchomienie migracji.
Uruchomienie seederów.
Testy relacji.
Testy integralności.
Testy przykładowych zapytań.
23. Polecenia Laravel
Utworzenie modeli wraz z migracjami:
php artisan make:model Game -m
php artisan make:model Genre -m
php artisan make:model Platform -m
php artisan make:model Review -m
php artisan make:model UserGame -m
Utworzenie migracji tabel pośrednich:
php artisan make:migration create_game_genre_table
php artisan make:migration create_game_platform_table
Uruchomienie migracji:
php artisan migrate
Uruchomienie seederów:
php artisan db:seed
Odtworzenie lokalnej bazy testowej:
php artisan migrate:fresh --seed
Uwaga: migrate:fresh usuwa wszystkie istniejące tabele. Polecenia należy używać wyłącznie na bazie testowej, której dane można bezpiecznie utracić.
24. Powiązanie z API
Funkcjonalność
Tabele
Rejestracja
users
Logowanie
users, sesje Laravel
Profil
users
Katalog
games, genres, platforms
Filtrowanie
games, game_genre, game_platform
Szczegóły gry
games, genres, platforms, reviews
Oceny
reviews
Biblioteka
user_games, games
Dashboard administratora
users, games, reviews, user_games
Zarządzanie grami
games, game_genre, game_platform
25. Kryteria ukończenia modułu bazy danych
Moduł bazy danych uznaje się za gotowy, gdy:
[ ]
Baza gamevers istnieje.
[ ]
Wszystkie migracje działają.
[ ]
Wszystkie modele są utworzone.
[ ]
Relacje Eloquent działają.
[ ]
Klucze obce są poprawne.
[ ]
Unikalność jest wymuszana.
[ ]
Ograniczenia ocen i statusów działają.
[ ]
Seedery tworzą dane demonstracyjne.
[ ]
Backend może pobierać gry z bazy.
[ ]
Backend może zapisywać recenzje.
[ ]
Backend może obsługiwać biblioteki.
[ ]
Testy integralności przechodzą.
26. Podsumowanie
Baza danych Gamevers składa się z ośmiu tabel biznesowych i dodatkowych tabel technicznych frameworka Laravel.
Struktura umożliwia:
Zarządzanie użytkownikami.
Przechowywanie katalogu gier.
Przypisywanie gatunków i platform.
Publikowanie ocen i recenzji.
Prowadzenie prywatnych bibliotek.
Zarządzanie danymi przez administratora.
Projekt bazy danych jest przygotowany do implementacji z wykorzystaniem migracji Laravel oraz Eloquent ORM.
Status: Dokumentacja techniczna przygotowana do przeglądu i zatwierdzenia
