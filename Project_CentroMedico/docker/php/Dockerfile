# Usa una imagen oficial de PHP-FPM
# php:8.3-fpm-alpine es una buena opción por su tamaño reducido y seguridad.
# Si necesitas 8.4 y asumes los warnings, puedes cambiarla.
FROM php:8.3-fpm-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Instala Composer globalmente (copiándolo desde la imagen oficial de Composer)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia los archivos de Composer Y EL RESTO DEL CÓDIGO FUENTE ANTES DE COMPOSER INSTALL
COPY backend/ . /var/www/html/

# Copia los archivos de configuración de PHP-FPM si necesitas personalizarlos
# Por ahora, usaremos la configuración por defecto o la que viene con la imagen base
# COPY php.ini /usr/local/etc/php/php.ini
# COPY www.conf /usr/local/etc/php-fpm.d/www.conf

# Copia los archivos de Composer
COPY backend/composer.json backend/composer.lock ./

# Instala las extensiones de PHP necesarias para tu aplicación
RUN apk update && apk add --no-cache \
    curl \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    icu-dev \
    postgresql-dev \
    && rm -rf /var/cache/apk/* \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        xml \
        intl \
    && docker-php-ext-enable \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        xml \
        intl

# Instala las dependencias de Composer (¡solo las de producción si es para un build final!)
# --no-dev: no instala las dependencias de desarrollo.
# --optimize-autoloader: optimiza el autoloader de Composer.
# --no-interaction: evita preguntas durante la instalación.
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Aquí no copiamos el resto de la aplicación, ya que lo haremos a través de volúmenes en docker-compose
# Esto es para permitir un hot-reloading más fácil durante el desarrollo.

# Expone el puerto 9000 (el puerto por defecto de PHP-FPM)
EXPOSE 9000

# El comando para iniciar PHP-FPM en primer plano
# El flag -F es crucial para que PHP-FPM se ejecute en primer plano y el contenedor no se detenga.
CMD ["php-fpm", "-F"]