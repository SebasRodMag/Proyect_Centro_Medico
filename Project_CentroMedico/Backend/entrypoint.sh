#!/bin/sh

# Cambiar al directorio de la aplicación Laravel
cd /var/www/html

# *** Importante: Asegurarse de que la base de datos esté lista ***
# Una simple espera puede no ser suficiente si la DB tarda más en iniciar.
# Un loop que espera a la conexión a la DB es más robusto.
# Puedes usar un paquete como "wait-for-it.sh" o "dockerize"
# o una simple función bash como esta:

# --- Inicio de la espera a la DB ---
# Variables de la base de datos (asegúrate que coincidan con .env o docker-compose.yml)
DB_HOST="db" # El nombre del servicio de la DB en docker-compose
DB_PORT="3306"

echo "Esperando a que la base de datos ${DB_HOST}:${DB_PORT} esté lista..."
while ! nc -z $DB_HOST $DB_PORT; do
sleep 1 # Espera 1 segundo antes de reintentar
done
echo "Base de datos ${DB_HOST}:${DB_PORT} está lista."
# --- Fin de la espera a la DB ---


# Ejecutar migraciones de la base de datos
# El "--force" es crucial para ejecutar migraciones en entornos de producción (o no interactivos)
echo "Ejecutando migraciones de la base de datos..."
php artisan migrate --force

# Opcional: Ejecutar seeders después de las migraciones
# Descomenta la siguiente línea si quieres que los seeders se ejecuten cada vez que levantas el contenedor
# Esto es útil en desarrollo, pero con precaución en producción si no quieres resetear datos.
# echo "Ejecutando seeders de la base de datos..."
# php artisan db:seed --force # O php artisan migrate:fresh --seed --force si quieres resetear la DB


# Limpiar y cachear configuraciones de Laravel (buenas prácticas)
echo "Limpiando y cacheando configuraciones de Laravel..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Crear enlace de almacenamiento (si lo usas)
echo "Creando enlace de almacenamiento para Laravel..."
php artisan storage:link

# Ejecutar cualquier otro comando de inicialización que necesites
# ...

# Iniciar PHP-FPM (esto es lo que mantiene el contenedor vivo y sirve la aplicación)
echo "Iniciando PHP-FPM..."
exec php-fpm