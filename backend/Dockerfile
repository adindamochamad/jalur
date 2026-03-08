# Image PHP 8.2 CLI untuk CodeIgniter 4 (backend Jalur — CI4 butuh PHP 8.2+)
# Dipakai untuk menjalankan: php spark serve
FROM php:8.2-cli

# Dependensi sistem untuk ekstensi PHP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Ekstensi PHP yang dibutuhkan CI4 (database, validasi, upload, dll)
RUN docker-php-ext-install \
    intl \
    mbstring \
    zip \
    pdo_mysql \
    mysqli \
    gd \
    opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8080

CMD ["php", "spark", "serve", "--host=0.0.0.0", "--port=8080"]
