FROM php:8.4-fpm

# Instala dependencias de sistema y extensiones de PHP, incluyendo netcat
RUN apt-get update && apt-get install -y \
    libpng-dev libonig-dev libxml2-dev zip unzip curl git \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Crear el directorio 'storage' en 'public' como un directorio real
# Esto evita problemas de symlinks en Windows durante el build context
RUN mkdir -p public/storage

# Copia TODO el código fuente de Laravel al directorio de trabajo
# Esto incluye composer.json, composer.lock y el archivo artisan
COPY . .

# Instala las dependencias de Composer
# Ahora 'artisan' estará disponible cuando composer intente ejecutar los scripts
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Permisos para Laravel
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} + \
    && find /var/www/html -type f -exec chmod 644 {} + \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Copia el script de entrada y hazlo ejecutable
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Define el comando de entrada del contenedor
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# El CMD por defecto
CMD ["php-fpm"]