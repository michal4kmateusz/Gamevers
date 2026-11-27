GAMEVERS — Specyfikacja wymagań projektowych
Nazwa projektu: Gamevers
Typ projektu: Portal społecznościowo-gamingowy
Wersja dokumentacji: 1.0
Data: 23.11.2026
Status: Dokumentacja wstępna — do zatwierdzenia
Zespół: 2 programistów
Planowany czas realizacji: 3 tygodnie (15 dni roboczych)
1. Wprowadzenie
1.1. Cel dokumentu
Celem dokumentu jest szczegółowe określenie wymagań funkcjonalnych i niefunkcjonalnych aplikacji Gamevers.
Dokument stanowi podstawę do:
Projektowania architektury aplikacji.
Tworzenia interfejsu użytkownika.
Projektowania relacyjnej bazy danych.
Implementacji REST API.
Podziału zadań pomiędzy programistów.
Przygotowania testów.
Weryfikacji ukończenia projektu.
1.2. Opis projektu
Gamevers to aplikacja internetowa przeznaczona dla społeczności graczy.
Portal umożliwia użytkownikom przeglądanie katalogu gier, wyszukiwanie interesujących tytułów, zapoznawanie się z informacjami o grach, prowadzenie własnej biblioteki oraz publikowanie ocen i recenzji.
System będzie posiadał panel administratora umożliwiający zarządzanie katalogiem gier i moderowanie treści.
1.3. Cel główny
Stworzenie funkcjonalnej, responsywnej i bezpiecznej aplikacji internetowej wykorzystującej Laravel, Vue 3 i MySQL.
1.4. Zakres projektu
Projekt obejmuje:
Stronę główną.
Katalog gier.
Wyszukiwarkę i filtrowanie.
Szczegóły gier.
Rejestrację i logowanie.
Profile użytkowników.
Prywatne biblioteki gier.
Oceny i recenzje.
Panel administratora.
Zarządzanie grami.
Moderację recenzji.
Responsywny interfejs.
1.5. Funkcjonalności poza zakresem MVP
Pierwsza wersja nie obejmuje:
Uruchamiania gier w przeglądarce.
Czatu.
Systemu znajomych.
Forum.
Powiadomień.
Zakupów i płatności.
Integracji z kontami Steam.
Zaawansowanego systemu rekomendacji.
Aplikacji mobilnej na Android i iOS.
2. Role użytkowników
W systemie przewidziano trzy poziomy dostępu.
2.1. Gość
Użytkownik niezalogowany.
Uprawnienia:
Przeglądanie strony głównej.
Przeglądanie katalogu gier.
Wyszukiwanie i filtrowanie.
Wyświetlanie szczegółów gier.
Czytanie recenzji.
Rejestracja.
Logowanie.
Ograniczenia:
Nie może dodawać gier do biblioteki.
Nie może publikować recenzji.
Nie może edytować danych użytkowników.
Nie ma dostępu do panelu administratora.
2.2. Zalogowany użytkownik
Posiada wszystkie uprawnienia gościa oraz:
Dostęp do własnego profilu.
Edycję własnego profilu.
Dostęp do własnej biblioteki.
Dodawanie gier do biblioteki.
Zmianę statusów gier.
Usuwanie gier z biblioteki.
Dodawanie ocen i recenzji.
Edytowanie własnych recenzji.
Usuwanie własnych recenzji.
Wylogowanie.
2.3. Administrator
Posiada uprawnienia zalogowanego użytkownika oraz:
Dostęp do panelu administracyjnego.
Dodawanie gier.
Edytowanie gier.
Usuwanie gier.
Zarządzanie gatunkami.
Przeglądanie wszystkich recenzji.
Usuwanie recenzji naruszających zasady.
Przeglądanie statystyk systemu.
Role zapisywane w bazie danych:
user
admin
Gość nie posiada konta ani roli w bazie danych.
3. Wymagania funkcjonalne
Każde wymaganie posiada unikalny identyfikator ułatwiający implementację i testowanie.
3.1. Moduł strony głównej
FR-HOME-001 — Wyświetlanie strony głównej
System musi umożliwiać otwarcie strony głównej bez logowania.
Strona powinna zawierać:
Logo Gamevers.
Menu nawigacyjne.
Wyszukiwarkę.
Baner wyróżnionej gry.
Sekcję popularnych gier.
Sekcję najwyżej ocenianych gier.
Sekcję ostatnio dodanych gier.
Stopkę.
Kryterium akceptacji: Użytkownik niezalogowany może otworzyć stronę i zobaczyć jej zawartość.
FR-HOME-002 — Wyróżniona gra
System wyświetla grę oznaczoną jako wyróżniona.
Element zawiera:
Baner.
Tytuł.
Krótki fragment opisu.
Przycisk przejścia do szczegółów.
Jeśli w bazie nie ma wyróżnionej gry, system wyświetla zastępczą sekcję powitalną.
FR-HOME-003 — Popularne gry
System wyświetla maksymalnie 8 gier posiadających największą liczbę recenzji.
Przy równej liczbie recenzji pierwszeństwo mają gry z wyższą średnią ocen.
FR-HOME-004 — Najwyżej oceniane gry
System wyświetla maksymalnie 8 gier o najwyższej średniej ocen.
Do rankingu kwalifikują się gry posiadające przynajmniej jedną recenzję.
FR-HOME-005 — Ostatnio dodane gry
System wyświetla maksymalnie 8 gier, sortując je malejąco według daty dodania do bazy danych.
3.2. Moduł katalogu gier
FR-GAME-001 — Lista gier
System musi udostępniać publiczny katalog wszystkich gier.
Każda karta zawiera:
Okładkę.
Tytuł.
Gatunki.
Średnią ocen lub informację „Brak ocen”.
Odnośnik do szczegółów.
FR-GAME-002 — Wyszukiwanie
System umożliwia wyszukiwanie gier po tytule.
Zasady:
Wyszukiwanie nie rozróżnia wielkości liter.
Dopuszczalne jest wyszukiwanie fragmentu nazwy.
Puste zapytanie wyświetla pełny katalog.
W przypadku braku wyników wyświetlany jest komunikat.
FR-GAME-003 — Filtrowanie według gatunku
Użytkownik może wybrać jeden gatunek z dostępnej listy.
System wyświetla wyłącznie gry przypisane do wybranego gatunku.
FR-GAME-004 — Filtrowanie według platformy
Użytkownik może wybrać jedną platformę.
System wyświetla gry dostępne na tej platformie.
FR-GAME-005 — Łączenie filtrów
System umożliwia jednoczesne zastosowanie wyszukiwania, gatunku i platformy.
Wyniki muszą spełniać wszystkie aktywne warunki.
FR-GAME-006 — Sortowanie
Dostępne opcje:
Ostatnio dodane.
Nazwa A–Z.
Data premiery — od najnowszych.
Najwyżej oceniane.
Najpopularniejsze.
FR-GAME-007 — Paginacja
System dzieli katalog na strony.
Domyślnie wyświetlanych jest 12 gier na stronę.
Maksymalna liczba wyników w jednym żądaniu wynosi 30.
FR-GAME-008 — Szczegóły gry
Każda gra posiada podstronę identyfikowaną unikalnym slugiem.
System wyświetla:
Tytuł.
Opis.
Okładkę.
Baner.
Producenta.
Wydawcę.
Datę premiery.
Gatunki.
Platformy.
Średnią ocen.
Liczbę recenzji.
Recenzje użytkowników.
FR-GAME-009 — Nieistniejąca gra
Próba otwarcia nieistniejącego adresu gry powoduje wyświetlenie strony 404.
FR-GAME-010 — Brak grafiki
Jeżeli gra nie posiada okładki lub banera, system wyświetla grafikę zastępczą.
3.3. Moduł rejestracji i logowania
FR-AUTH-001 — Rejestracja
Użytkownik może utworzyć konto, podając:
Nazwę użytkownika.
Adres email.
Hasło.
Potwierdzenie hasła.
FR-AUTH-002 — Walidacja rejestracji
Zasady:
Nazwa: od 3 do 30 znaków.
Nazwa musi być unikalna.
Email musi mieć poprawny format.
Email musi być unikalny.
Hasło musi mieć minimum 8 znaków.
Potwierdzenie hasła musi być zgodne.
FR-AUTH-003 — Logowanie
Użytkownik loguje się przy użyciu adresu email i hasła.
Po poprawnym zalogowaniu system tworzy sesję użytkownika.
FR-AUTH-004 — Niepoprawne logowanie
System wyświetla komunikat o niepoprawnych danych bez ujawniania, czy podany email istnieje w bazie.
FR-AUTH-005 — Wylogowanie
Zalogowany użytkownik może zakończyć sesję.
Po wylogowaniu traci dostęp do chronionych zasobów do czasu ponownego zalogowania.
FR-AUTH-006 — Ochrona tras
Strony profilu i biblioteki wymagają zalogowania.
Endpointy administracyjne wymagają dodatkowo roli administratora.
FR-AUTH-007 — Dane aktualnego użytkownika
System umożliwia frontendowi pobranie danych aktualnie zalogowanego użytkownika.
Odpowiedź nie może zawierać hasła ani jego hasha.
3.4. Moduł profilu
FR-PROFILE-001 — Wyświetlanie profilu
Zalogowany użytkownik może wyświetlić własny profil.
Profil zawiera:
Nazwę.
Email.
Opis.
Datę utworzenia konta.
Liczbę gier w bibliotece.
Liczbę recenzji.
FR-PROFILE-002 — Edycja profilu
Użytkownik może zmienić:
Nazwę.
Opis profilu.
Email nie będzie edytowalny w pierwszej wersji projektu.
FR-PROFILE-003 — Walidacja profilu
Nazwa: 3–30 znaków i unikalna.
Opis: maksymalnie 500 znaków.
FR-PROFILE-004 — Awatar
W pierwszej wersji system generuje awatar zastępczy na podstawie inicjałów użytkownika.
Nie przewiduje się przesyłania własnych awatarów.
3.5. Moduł biblioteki gier
FR-LIB-001 — Dodawanie gry
Zalogowany użytkownik może dodać grę do swojej biblioteki.
FR-LIB-002 — Status gry
Każda gra w bibliotece posiada dokładnie jeden status:
wishlist
playing
completed
dropped
FR-LIB-003 — Zmiana statusu
Użytkownik może zmienić status gry bez usuwania jej z biblioteki.
FR-LIB-004 — Usuwanie gry
Użytkownik może usunąć grę ze swojej biblioteki.
Operacja nie usuwa gry z głównego katalogu.
FR-LIB-005 — Wyświetlanie biblioteki
System wyświetla gry należące do aktualnie zalogowanego użytkownika.
FR-LIB-006 — Filtrowanie biblioteki
Użytkownik może wyświetlić wszystkie gry albo tylko gry posiadające wybrany status.
FR-LIB-007 — Blokowanie duplikatów
Ta sama gra może znajdować się w bibliotece jednego użytkownika tylko raz.
FR-LIB-008 — Prywatność biblioteki
Użytkownik może zarządzać wyłącznie własną biblioteką.
3.6. Moduł ocen i recenzji
FR-REV-001 — Dodawanie recenzji
Zalogowany użytkownik może opublikować recenzję gry.
Wymagane pola:
Ocena.
Treść recenzji.
FR-REV-002 — Skala ocen
Ocena musi być liczbą całkowitą od 1 do 10.
FR-REV-003 — Długość recenzji
Treść recenzji musi zawierać od 10 do 2000 znaków.
FR-REV-004 — Jedna recenzja na grę
Użytkownik może posiadać maksymalnie jedną recenzję danej gry.
FR-REV-005 — Edycja recenzji
Użytkownik może edytować wyłącznie własną recenzję.
FR-REV-006 — Usuwanie recenzji
Użytkownik może usunąć własną recenzję.
FR-REV-007 — Wyświetlanie recenzji
Recenzje są publiczne.
Każda recenzja zawiera:
Nazwę autora.
Ocenę.
Treść.
Datę publikacji.
FR-REV-008 — Sortowanie recenzji
Recenzje wyświetlane są od najnowszych.
FR-REV-009 — Średnia ocen
Średnia jest obliczana na podstawie wszystkich ocen przypisanych do gry.
Wynik wyświetlany jest z dokładnością do jednego miejsca po przecinku.
Jeżeli gra nie posiada recenzji, wyświetlany jest komunikat „Brak ocen”.
FR-REV-010 — Moderacja
Administrator może usunąć dowolną recenzję.
3.7. Moduł administratora
FR-ADMIN-001 — Dostęp do panelu
Panel administratora jest dostępny wyłącznie dla użytkowników z rolą admin.
FR-ADMIN-002 — Dashboard
Panel wyświetla:
Liczbę użytkowników.
Liczbę gier.
Liczbę recenzji.
Liczbę pozycji w bibliotekach.
FR-ADMIN-003 — Dodawanie gry
Administrator może dodać grę, podając:
Tytuł.
Opis.
Producenta.
Wydawcę.
Datę premiery.
Gatunki.
Platformy.
Okładkę.
Baner.
Informację, czy gra jest wyróżniona.
FR-ADMIN-004 — Edycja gry
Administrator może zmienić informacje o istniejącej grze.
FR-ADMIN-005 — Usuwanie gry
Administrator może usunąć grę z katalogu.
System usuwa również jej powiązania z recenzjami i bibliotekami.
FR-ADMIN-006 — Zarządzanie gatunkami
Administrator może dodawać, edytować i usuwać gatunki.
FR-ADMIN-007 — Moderacja recenzji
Administrator może przeglądać recenzje i usuwać wybrane wpisy.
FR-ADMIN-008 — Przesyłanie grafik
System umożliwia przesyłanie okładek i banerów.
Dozwolone formaty:
JPG.
PNG.
WebP.
Maksymalny rozmiar pliku: 2 MB.
FR-ADMIN-009 — Automatyczne tworzenie sluga
System generuje unikalny slug na podstawie tytułu gry.
W przypadku konfliktu dodaje odpowiedni sufiks.
FR-ADMIN-010 — Bezpieczeństwo operacji
Wszystkie operacje administracyjne wymagają sprawdzenia roli użytkownika przez backend.
4. Wymagania niefunkcjonalne
NFR-001 — Responsywność
Interfejs musi działać na:
Telefonach od szerokości 360 px.
Tabletach.
Komputerach.
Układ powinien dostosowywać liczbę kolumn, nawigację i formularze do szerokości ekranu.
NFR-002 — Wydajność
Docelowe wymagania w środowisku testowym:
Typowe żądanie API: poniżej 500 ms przy niewielkim obciążeniu.
Katalog: paginacja po stronie serwera.
Wyszukiwanie: opóźnienie około 300 ms po zakończeniu wpisywania.
Grafiki: odpowiednia kompresja i lazy loading.
Wartości są celami projektowymi, a nie gwarancją działania na każdym serwerze.
NFR-003 — Bezpieczeństwo
System musi stosować:
Hashowanie haseł.
Walidację danych.
Ochronę CSRF.
Autoryzację operacji.
Bezpieczne sesje.
Ograniczenie częstotliwości logowania.
Kontrolę przesyłanych plików.
Ochronę przed nieautoryzowanym dostępem.
NFR-004 — Użyteczność
Interfejs powinien:
Posiadać spójną nawigację.
Pokazywać błędy formularzy.
Wyświetlać stan ładowania.
Informować o powodzeniu operacji.
Zapewniać czytelny kontrast.
Umożliwiać obsługę podstawowych funkcji klawiaturą.
NFR-005 — Kompatybilność
Aplikacja powinna działać w aktualnych wersjach:
Google Chrome.
Mozilla Firefox.
Microsoft Edge.
Safari.
NFR-006 — Utrzymywalność
Kod powinien:
Być podzielony na moduły.
Stosować jednolite nazewnictwo.
Unikać powielania logiki.
Oddzielać interfejs od komunikacji API.
Wykorzystywać migracje i modele Laravel.
Posiadać dokumentację.
NFR-007 — Integralność danych
Baza danych musi stosować:
Klucze główne.
Klucze obce.
Ograniczenia unikalności.
Odpowiednie typy danych.
Kontrolowane usuwanie powiązanych rekordów.
NFR-008 — Obsługa błędów
System musi poprawnie obsługiwać:
Niepoprawne dane formularzy.
Brak uprawnień.
Nieistniejące zasoby.
Brak wyników wyszukiwania.
Niedostępność API.
Błędy serwera.
5. Wymagania dotyczące danych
5.1. Główne encje
System wykorzystuje następujące encje:
Encja
Przeznaczenie
User
Konto użytkownika
Game
Gra
Genre
Gatunek
Platform
Platforma
Review
Recenzja
UserGame
Pozycja biblioteki
5.2. Relacje
Użytkownik posiada wiele recenzji.
Użytkownik posiada wiele pozycji biblioteki.
Gra posiada wiele recenzji.
Gra może występować w bibliotekach wielu użytkowników.
Gra należy do wielu gatunków.
Gra może być dostępna na wielu platformach.
5.3. Ograniczenia danych
Unikalny email.
Unikalna nazwa użytkownika.
Unikalny slug gry.
Unikalna para użytkownik–gra w recenzjach.
Unikalna para użytkownik–gra w bibliotece.
Ocena od 1 do 10.
Status biblioteki zgodny z dozwolonymi wartościami.
Szczegółowy schemat zostanie opisany w pliku database.md.
6. Wymagania API
System wykorzystuje REST API oparte na JSON.
6.1. Endpointy publiczne
GET /api/games
GET /api/games/{slug}
GET /api/games/featured
GET /api/games/popular
GET /api/games/top-rated
GET /api/games/{id}/reviews
GET /api/genres
GET /api/platforms
6.2. Uwierzytelnianie
POST /api/register
POST /api/login
POST /api/logout
GET /api/user
6.3. Profil
GET /api/profile
PATCH /api/profile
6.4. Biblioteka
GET /api/library
POST /api/library
PATCH /api/library/{gameId}
DELETE /api/library/{gameId}
6.5. Recenzje
POST /api/games/{id}/reviews
PATCH /api/reviews/{id}
DELETE /api/reviews/{id}
6.6. Administracja
GET /api/admin/stats
GET /api/admin/games
POST /api/admin/games
PATCH /api/admin/games/{id}
DELETE /api/admin/games/{id}
GET /api/admin/reviews
DELETE /api/admin/reviews/{id}
POST /api/admin/genres
PATCH /api/admin/genres/{id}
DELETE /api/admin/genres/{id}
Szczegółowy kontrakt żądań i odpowiedzi zostanie opisany w api.md.
7. Wymagania dotyczące interfejsu
7.1. Styl graficzny
Projekt wykorzystuje ciemny motyw gamingowy.
Kolory:
Element
Wartość
Tło
#0B0F19
Karty
#151B2B
Główny akcent
#8B5CF6
Drugi akcent
#22D3EE
Tekst
#F8FAFC
Tekst pomocniczy
#94A3B8
7.2. Podstrony
Podstrona
Adres
Strona główna
/
Katalog
/games
Szczegóły gry
/games/:slug
Logowanie
/login
Rejestracja
/register
Profil
/profile
Biblioteka
/library
Panel administratora
/admin
Zarządzanie grami
/admin/games
Dodawanie gry
/admin/games/create
Edycja gry
/admin/games/:id/edit
Moderacja
/admin/reviews
7.3. Stany interfejsu
Widoki powinny obsługiwać:
Ładowanie danych.
Poprawne wyświetlenie danych.
Brak danych.
Błąd pobierania.
Brak uprawnień.
8. Reguły biznesowe
ID
Reguła
BR-001
Jeden email może należeć tylko do jednego konta
BR-002
Nazwa użytkownika musi być unikalna
BR-003
Każda gra posiada unikalny slug
BR-004
Jedna gra może należeć do wielu gatunków
BR-005
Jedna gra może być dostępna na wielu platformach
BR-006
Jeden użytkownik może ocenić daną grę tylko raz
BR-007
Użytkownik może edytować tylko własne recenzje
BR-008
Gra może występować raz w bibliotece użytkownika
BR-009
Status biblioteki musi być jedną z czterech wartości
BR-010
Średnia ocen jest obliczana na podstawie recenzji
BR-011
Operacje administracyjne wymagają roli admin
BR-012
Usunięcie gry usuwa jej powiązane recenzje i wpisy biblioteki
BR-013
Niezalogowany użytkownik nie może modyfikować danych
BR-014
Hasła nie są przechowywane w postaci jawnej
BR-015
Grafiki muszą spełniać wymagania formatu i rozmiaru
9. Przypadki użycia
UC-001 — Rejestracja
Aktor: Gość.
Warunek początkowy: Użytkownik nie posiada konta.
Przebieg:
Otwiera formularz rejestracji.
Wprowadza wymagane dane.
Wysyła formularz.
Backend waliduje dane.
System tworzy konto.
Użytkownik zostaje zalogowany.
Wynik: Konto zostało utworzone.
UC-002 — Wyszukiwanie gry
Aktor: Dowolny użytkownik.
Przebieg:
Otwiera katalog.
Wpisuje fragment tytułu.
System pobiera pasujące gry.
Wyświetla wyniki.
Wynik: Użytkownik widzi pasujące gry albo komunikat o braku wyników.
UC-003 — Dodanie gry do biblioteki
Aktor: Zalogowany użytkownik.
Przebieg:
Otwiera szczegóły gry.
Wybiera dodanie do biblioteki.
Wybiera status.
Backend sprawdza poprawność operacji.
System zapisuje grę w bibliotece.
Wynik: Gra znajduje się w bibliotece użytkownika.
UC-004 — Publikacja recenzji
Aktor: Zalogowany użytkownik.
Przebieg:
Otwiera szczegóły gry.
Wybiera ocenę.
Wpisuje treść recenzji.
Wysyła formularz.
Backend sprawdza dane i uprawnienia.
System zapisuje recenzję.
Średnia ocen jest aktualizowana przy odczycie.
Wynik: Recenzja jest widoczna publicznie.
UC-005 — Dodanie gry przez administratora
Aktor: Administrator.
Przebieg:
Otwiera panel administratora.
Przechodzi do formularza dodawania gry.
Wprowadza dane.
Dodaje grafiki.
Wybiera gatunki i platformy.
Zapisuje formularz.
Backend waliduje dane.
System zapisuje grę i jej powiązania.
Wynik: Nowa gra jest dostępna w katalogu.
10. Kryteria akceptacji MVP
Projekt zostanie uznany za funkcjonalnie ukończony, gdy:
[ ]
Strona główna wyświetla dane z API.
[ ]
Katalog wyświetla gry z bazy danych.
[ ]
Wyszukiwanie działa.
[ ]
Filtrowanie i sortowanie działają.
[ ]
Szczegóły gier są dostępne.
[ ]
Rejestracja działa.
[ ]
Logowanie i wylogowanie działają.
[ ]
Profil użytkownika działa.
[ ]
Biblioteka działa.
[ ]
Zmiana statusu gry działa.
[ ]
Recenzje można dodawać.
[ ]
Recenzje można edytować i usuwać.
[ ]
Średnia ocen jest obliczana poprawnie.
[ ]
Administrator może dodawać gry.
[ ]
Administrator może edytować i usuwać gry.
[ ]
Administrator może moderować recenzje.
[ ]
Zwykły użytkownik nie ma dostępu do funkcji administratora.
[ ]
Aplikacja działa na telefonach i komputerach.
[ ]
Najważniejsze testy przechodzą poprawnie.
11. Priorytety realizacji
P0 — Funkcjonalności krytyczne
Konfiguracja projektu.
Baza danych.
REST API katalogu.
Katalog gier.
Szczegóły gier.
Rejestracja i logowanie.
P1 — Funkcjonalności obowiązkowe MVP
Profil użytkownika.
Biblioteka gier.
Oceny i recenzje.
Panel administratora.
Responsywność.
P2 — Ulepszenia
Dodatkowe animacje.
Rozbudowane statystyki.
Dodatkowe opcje sortowania.
Zaawansowane efekty wizualne.
W przypadku ograniczeń czasowych najpierw realizowane są zadania P0, następnie P1.
12. Ograniczenia projektu
Projekt realizują dwie osoby.
Czas realizacji wynosi około 3 tygodni.
Projekt jest aplikacją webową.
Backend musi wykorzystywać Laravel.
Frontend musi wykorzystywać Vue 3.
Dane muszą być przechowywane w MySQL.
Komunikacja odbywa się przez REST API.
Pierwsza wersja ma być MVP.
Nie planuje się płatnych usług jako elementu wymaganego do działania lokalnego.
13. Podział odpowiedzialności
Programista frontend
Odpowiada za:
Projekt UI.
Vue 3.
Komponenty.
Widoki.
Routing.
Formularze.
Integrację API.
Responsywność.
Testy interfejsu.
Programista backend
Odpowiada za:
Laravel.
MySQL.
Migracje.
Modele.
Relacje.
Kontrolery.
REST API.
Uwierzytelnianie.
Autoryzację.
Walidację.
Testy backendu.
Zadania wspólne
Dokumentacja.
Kontrakt API.
Integracja.
GitHub.
Testy końcowe.
Prezentacja.
14. Harmonogram
Dzień
Główny cel
1
Dokumentacja i GitHub
2
Konfiguracja środowiska
3
Baza danych i layout
4
API katalogu
5
Katalog i filtrowanie
6
Szczegóły gry
7
Rejestracja i logowanie
8
Profil
9
Biblioteka
10
Recenzje
11
Panel administratora
12
Zarządzanie grami
13
Integracja
14
Testowanie
15
Finalizacja
15. Dokumenty powiązane
Dokumentacja projektu jest podzielona na następujące pliki:
README.md — ogólny opis projektu.
docs/requirements.md — wymagania funkcjonalne i niefunkcjonalne.
docs/database.md — szczegółowy projekt bazy danych.
docs/api.md — dokumentacja REST API.
docs/architecture.md — architektura systemu i organ
