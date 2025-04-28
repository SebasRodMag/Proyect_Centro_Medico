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
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');//Para saber que usuario esta logueado

});

Route::middleware('auth:sanctum')->group(function () {

    //Rutas que solo los administradores pueden acceder
    Route::middleware(['role:administrador'])->group(function () {
        //clientes
        Route::get('clientes', [ClientesController::class, 'index']);
        Route::post('clientes', [ClientesController::class, 'store']);
        Route::get('medicos', [MedicosController::class, 'index']);
        Route::post('medicos', [MedicosController::class, 'store']);
        Route::get('medicos/{medico}', [MedicosController::class, 'show']);
        Route::put('medicos/{medico}', [MedicosController::class, 'update']);
        Route::post('citas', [CitasController::class, 'store']);
        Route::get('usuarios', [UsersController::class, 'index']);
        Route::get('usuarios/{user}', [UsersController::class, 'show']);
        Route::put('usuarios/{user}', [UsersController::class, 'update']);
        //Route::delete('usuarios/{user}', [UsersController::class, 'destroy']);
        //Route::delete('medicos/{medico}', [MedicosController::class, 'destroy']);
        //Route::delete('clientes/{cliente}', [ClientesController::class, 'destroy']);
        //Route::delete('pacientes/{paciente}', [PacientesController::class, 'destroy']);

        //Contratos
        Route::get('contratos', [ContratosController::class, 'index']);
        Route::post('contratos', [ContratosController::class, 'store']);
        Route::get('contratos/{contrato}', [ContratosController::class, 'show']);
        Route::put('contratos/{contrato}', [ContratosController::class, 'update']);

        //Pacientes
        Route::get('pacientes', [PacientesController::class, 'index']);
        Route::post('pacientes', [PacientesController::class, 'store']);
    });

    //Rutas que solo los administradores y clientes pueden acceder
    Route::middleware(['role:administrador,cliente'])->group(function () {
        Route::get('clientes/{cliente}', [ClientesController::class, 'show']);
        Route::put('clientes/{cliente}', [ClientesController::class, 'update']);
        Route::get('clientes/{cliente}/contratos', [ClientesController::class, 'contratos']);
        Route::put('pacientes/{paciente}', [PacientesController::class, 'update']);
        Route::get('clientes/{cliente}/pacientes', [ClientesController::class, 'pacientes']);
        Route::get('contratos/{contrato}/citas', [ContratosController::class, 'citas']);
        Route::get('clientes/{cliente}/citas', [ClientesController::class, 'citas']);
    });
    
    //Rutas que solo los administradores y médicos pueden acceder
    Route::middleware(['role:administrador,medico'])->group(function () {
        Route::get('citas', [CitasController::class, 'index']);
        Route::get('citas/{cita}', [CitasController::class, 'show']);
        Route::put('/citas/{cita}', [CitasController::class, 'update']);
    });
    

    //Ruta que solo los administradores, los médicos, los clientes y pacientes pueden acceder
    Route::middleware(['role:administrador,medico,cliente,paciente'])->group(function () {
        Route::get('pacientes/{paciente}', [PacientesController::class, 'show']);
    });

    //Rutas que solo los médicos pueden acceder
    Route::middleware('role:medico')->group(function () {
        Route::get('medicos/{medico}/citas', [MedicosController::class, 'citas']);
        Route::get('citas/dia/{fecha}', [CitasController::class, 'citasPorDia']);
    });

    //Rutas que solo los clientes pueden acceder
    Route::middleware(['role:cliente'])->group(function () {
        // Rutas para que los clientes consulten sus citas (habría que darle más lógica aquí)
        // Route::get('/mis-citas', [CitaController::class, 'misCitas']);
    });

    //Ruta de prueba para comprobar error al resolver el middleware
    Route::get('/test', function () {
        return 'Prueba de ruta';
    })->middleware('testMiddleware');
});