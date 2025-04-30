<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\Permission\PermissionServiceProvider;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registra las migraciones internas de Spatie
        $this->loadMigrationsFrom(__DIR__.'/../../vendor/spatie/laravel-permission/database/migrations');
    }
}
