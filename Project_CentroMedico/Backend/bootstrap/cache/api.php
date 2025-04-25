<?php
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\CitaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Rutas que solo los administradores pueden acceder
    Route::middleware('role:administrador')->group(function () {
        Route::post('/clientes', [ClienteController::class, 'store']);
        // ... otras rutas de administrador
    });

    // Rutas que solo los médicos pueden acceder
    Route::middleware('role:medico')->group(function () {
        Route::put('/citas/{cita}', [CitaController::class, 'update']);
        // ... otras rutas de médico
    });

    // Rutas que solo los clientes pueden acceder
    Route::middleware('role:cliente')->group(function () {
        // Rutas para que los clientes consulten sus citas (necesitarás lógica adicional aquí)
        // Route::get('/mis-citas', [CitaController::class, 'misCitas']);
    });

    // Rutas que requieren autenticación pero no un rol específico (podrían ser accedidas por todos los roles autenticados)
    Route::get('/clientes', [ClienteController::class, 'index']);
    // ... otras rutas autenticadas
});