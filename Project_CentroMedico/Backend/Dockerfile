FROM php:8.4-fpm

# Dependencias necesarias
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip curl git \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install

# Permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# No copiar entrypoint ni hacer ENTRYPOINT en modo desarrollo (puedes agregarlo si quieres)
# CMD para arrancar Laravel en modo desarrollo (por ejemplo puerto 8000)
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
