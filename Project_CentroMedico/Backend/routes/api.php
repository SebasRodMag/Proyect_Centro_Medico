<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\PacientesController;
use App\Http\Controllers\MedicosController;
use App\Http\Controllers\ContratosController;
use App\Http\Controllers\ClientesController;
use App\Http\Controllers\CitasController;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    // Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    // Rutas para Clientes
    Route::get('clientes', [ClientesController::class, 'index']);
    Route::post('clientes', [ClientesController::class, 'store']);
    Route::get('clientes/{cliente}', [ClientesController::class, 'show']);
    Route::put('clientes/{cliente}', [ClientesController::class, 'update']);
    // Route::delete('clientes/{cliente}', [ClientesController::class, 'destroy']); // Opcional: para desactivar

    // Rutas para Contratos
    Route::get('contratos', [ContratosController::class, 'index']);
    Route::post('contratos', [ContratosController::class, 'store']);
    Route::get('contratos/{contrato}', [ContratosController::class, 'show']);
    Route::put('contratos/{contrato}', [ContratosController::class, 'update']);
    Route::get('clientes/{cliente}/contratos', [ClientesController::class, 'contratos']);

    // Rutas para Pacientes
    Route::get('pacientes', [PacientesController::class, 'index']);
    Route::post('pacientes', [PacientesController::class, 'store']);
    Route::get('pacientes/{paciente}', [PacientesController::class, 'show']);
    Route::put('pacientes/{paciente}', [PacientesController::class, 'update']);
    // Route::delete('pacientes/{paciente}', [PacientesController::class, 'destroy']); // Opcional: para archivar
    Route::get('clientes/{cliente}/pacientes', [ClientesController::class, 'pacientes']);

    // Rutas para Médicos
    Route::get('medicos', [MedicosController::class, 'index']);
    Route::post('medicos', [MedicosController::class, 'store']);
    Route::get('medicos/{medico}', [MedicosController::class, 'show']);
    Route::put('medicos/{medico}', [MedicosController::class, 'update']);
    // Route::delete('medicos/{medico}', [MedicosController::class, 'destroy']); // Opcional: para desactivar

    // Rutas para Citas
    Route::get('citas', [CitasController::class, 'index']);
    Route::post('citas', [CitasController::class, 'store']);
    Route::get('citas/{cita}', [CitasController::class, 'show']);
    Route::put('citas/{cita}', [CitasController::class, 'update']);
    Route::get('clientes/{cliente}/citas', [ClientesController::class, 'citas']);
    Route::get('contratos/{contrato}/citas', [ContratosController::class, 'citas']);
    Route::get('medicos/{medico}/citas', [MedicosController::class, 'citas']);
    Route::get('citas/dia/{fecha}', [CitasController::class, 'citasPorDia']);

    // Rutas para Usuarios (solo para administradores, podrías usar middleware de roles)
    Route::get('usuarios', [UsersController::class, 'index']);
    Route::get('usuarios/{user}', [UsersController::class, 'show']);
    Route::put('usuarios/{user}', [UsersController::class, 'update']);
    // Route::delete('usuarios/{user}', [UsersController::class, 'destroy']); // Considerar con cuidado

    // Rutas que solo los administradores pueden acceder
    Route::middleware('rutaMiddleware:administrador')->group(function () {
        Route::post('/clientes', [ClienteController::class, 'store']);
        // ... otras rutas de administrador
    });

    // Rutas que solo los médicos pueden acceder
    Route::middleware('rutaMiddleware:medico')->group(function () {
        Route::put('/citas/{cita}', [CitaController::class, 'update']);
        // ... otras rutas de médico
    });

});