
FROM php:8.4-cli

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    && docker-php-ext-install pdo_mysql zip intl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/start.sh /usr/local/bin/gamevers-start

RUN sed -i 's/\r$//' /usr/local/bin/gamevers-start \
    && chmod +x /usr/local/bin/gamevers-start

EXPOSE 8000

CMD ["/bin/sh", "/usr/local/bin/gamevers-start"]

