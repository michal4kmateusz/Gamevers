
#!/bin/sh

set -eu

cd /app

echo "================================"
echo "Uruchamianie backendu Gamevers"
echo "================================"

echo "[1/7] Sprawdzanie konfiguracji..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Utworzono plik .env"
else
    echo "Plik .env juz istnieje"
fi

echo "[2/7] Instalowanie zaleznosci..."

composer install --no-interaction --prefer-dist

echo "[3/7] Czyszczenie konfiguracji..."

php artisan config:clear

echo "[4/7] Sprawdzanie klucza aplikacji..."

if ! grep -qE '^APP_KEY=.+$' .env; then
    php artisan key:generate --force
else
    echo "Klucz aplikacji juz istnieje"
fi

echo "[5/7] Wykonywanie migracji..."

php artisan migrate --force

echo "[6/7] Sprawdzanie katalogu gier..."

php artisan db:seed --force

echo "[7/7] Uruchamianie Laravel..."

exec php artisan serve \
    --host=0.0.0.0 \
    --port=8000 \
    --no-reload
