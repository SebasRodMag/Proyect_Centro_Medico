#!/bin/sh

# Esperar a que la base de datos esté disponible (puedes ajustar el wait o poner un loop si quieres)
sleep 5

# Ejecutar migraciones y seeders

php artisan migrate --force
php artisan migrate:fresh --seed --force



# Ejecutar el comando que arranca PHP-FPM (o el servidor que uses)
php artisan serve --host=0.0.0.0 --port=8000