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
use App\Models\Contrato;
use App\Models\Paciente;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');//Para saber que usuario esta logueado

});

Route::middleware('auth:sanctum')->group(function () {

    //Rutas que solo los administradores pueden acceder
    Route::middleware(['role:Administrador'])->group(function () {
        //clientes
        Route::get('clientes', [ClientesController::class, 'index']);
        Route::post('clientes', [ClientesController::class, 'store']);
        Route::put('clientes/{clienteId}', [ClientesController::class, 'update']);
        Route::delete('clientes/{clienteId}', [ClientesController::class, 'destroy']);

        Route::delete('clientes/{clienteId}/pacientes/{pacienteId}', [PacientesController::class, 'destroy']); 
        Route::put('clientes/pacientes/{pacienteId}', [PacientesController::class, 'update']); 

        //Médicos
        Route::get('medicos', [MedicosController::class, 'index']);
        Route::get('medicos/todos', [MedicosController::class, 'showAllMedicos']);

        Route::post('medicos', [MedicosController::class, 'store']);
        Route::get('medicos/{medico}', [MedicosController::class, 'show']);
        Route::put('medicos/{medico}', [MedicosController::class, 'update']);
        Route::delete('medicos/{medico}', [MedicosController::class, 'destroy']);
        
        
        Route::get('citas', [CitasController::class, 'index']);
        Route::delete('citas/{cita}', [CitasController::class, 'destroy']);

        Route::get('usuarios', [UsersController::class, 'index']);
        Route::post('usuarios', [UsersController::class, 'store']);
        Route::get('usuarios/{user}', [UsersController::class, 'show']);
        Route::put('usuarios/{user}', [UsersController::class, 'update']);
        Route::delete('usuarios/{user}', [UsersController::class, 'destroy']);
        Route::post('usuarios/assign/{id}', [UsersController::class, 'assign']);
        //Route::delete('usuarios/{user}', [UsersController::class, 'destroy']);
        //Route::delete('medicos/{medico}', [MedicosController::class, 'destroy']);
        //Route::delete('clientes/{cliente}', [ClientesController::class, 'destroy']);
        //Route::delete('pacientes/{paciente}', [PacientesController::class, 'destroy']);

        //Contratos
        Route::get('contratos', [ContratosController::class, 'index']);
        Route::post('contratos', [ContratosController::class, 'store']);
        // Route::get('/clientes/{id_cliente}/contratos', [ContratosController::class, 'contratosPorCliente']);
        Route::get('clientes/pacientes/cif/{cif}', [ClientesController::class, 'pacientesByCIF']);
        Route::get('contratos/{contrato}', [ContratosController::class, 'show']);
        Route::put('contratos/{contrato}', [ContratosController::class, 'update']);

        //Pacientes
        Route::get('pacientes', [PacientesController::class, 'index']);
        Route::post('pacientes', [PacientesController::class, 'store']);

        //Citas
        
    });

    //Rutas que solo los administradores y clientes pueden acceder
    Route::middleware(['role:Administrador|Cliente'])->group(function () {
        Route::post('citas', [CitasController::class, 'store']);
        Route::get('medicos', [MedicosController::class, 'index']);
        // Route::get('clientes/{cliente}', [ClientesController::class, 'show']);
        Route::get('clientes/{cliente}/contratos', [ContratosController::class, 'contratosPorCliente']);
        // Route::get('clientes/{cliente}/pacientes', [ClientesController::class, 'pacientes']);

        Route::get('clientes/listarpacientes', [PacientesController::class, 'pacientesPorCliente']);//Listar los pacientes de un Cliente
        Route::get('clientes/{cliente}/contratos/contrato-vigente', [ContratosController::class, 'contratoVigente']);
        // Route::get('clientes/{cliente}/contratos/contrato-vigente/reconocimientos-restantes', [ClientesController::class, 'reconocimientosRestantes']);
        Route::put('pacientes/{paciente}', [PacientesController::class, 'update']);
        Route::get('contratos/{contrato}/citas', [ContratosController::class, 'citas']);
        Route::get('clientes/{cliente}/citas', [ClientesController::class, 'citas']);
        Route::post('clientes/{cliente}/pacientes', [PacientesController::class, 'store']);
        // Route::get('clientes/{cliente}/pacientes', [PacientesController::class, 'pacientesPorCliente']);
        Route::get('buscarcontrato/cliente', [ContratosController::class, 'buscarContratoCliente']);
        /* Route::get('horariosdisponibles/medico/{$id_medico}/{$fecha}', [CitasController::class, 'horariosDisponibles']); */
        Route::get('medicos/{id_medico}/citas/{fecha}', [CitasController::class, 'horariosDisponibles']);

        Route::delete('citas/{id}', [CitasController::class, 'destroy']);
        
        
    });
    
    //Rutas que solo los administradores y médicos pueden acceder
    Route::middleware(['role:Administrador|Medico'])->group(function () {
        Route::get('medicos/{medico}/citas', [CitasController::class, 'citasPorMedico']);
        Route::get('citas/{cita}', [CitasController::class, 'show']);//Hay que modificarlo para que muestre los dato del paciente
        // Route::put('/citas/{cita}', [CitasController::class, 'updateHoy']); Lo he comentado porque hace conflicto con el update()
        Route::put('citas/{cita}/cancelar', [CitasController::class, 'cambiarEstadoCita']);
        Route::get('pacientes/medico/listar', [PacientesController::class, 'pacientesByMedico']);//Listar pacientes por id_medico
        Route::delete('eliminar/cita/medico/{id}', [CitasController::class, 'eliminarCitaMedico']);//Eliminar(softDelete) la cita por un medico logueado
    });
    

    //Ruta que solo los administradores, los médicos, los clientes y pacientes pueden acceder
    Route::middleware(['role:Administrador|Medico|Cliente|Paciente'])->group(function () {
        Route::get('pacientes/{paciente}', [PacientesController::class, 'show']);
        Route::get('citasdisponibles', [CitasController::class, 'obtenerHorasDisponiblesHoy']);


        //Citas
        Route::put('citas/{id_cita}', [CitasController::class, 'update']);
    });

    Route::middleware(['role:Medico|Paciente'])->group(function(){
        Route::get('citas/usuario/listar', [CitasController::class, 'citasPorUsuarioLogueado']);
    });

    //Rutas que solo los médicos pueden acceder
    Route::middleware(['role:Medico'])->group(function (){
        
        Route::get('citas/dia/{fecha}', [CitasController::class, 'citasPorDia']);//correcto
        Route::get('medicos/perfil/yo' , [MedicosController::class, 'medicoLogueado']);//correcto
        //buscar las horas disponibles para un medico logueado en una fecha
    });
    //Rutas que solo los clientes pueden acceder
    Route::middleware(['role:Cliente'])->group(function () {
        // Rutas para que los clientes consulten sus citas (habría que darle más lógica aquí)
        // Route::get('/clientes/{cliente}/pacientes', [ClientesController::class, 'pacientes']);
    });

    Route::post('/login', [AuthController::class, 'login']);

    //Ruta de prueba para comprobar error al resolver el middleware
    Route::get('/test', function () {
        return response()->json(['message' => 'Rol autorizado']);
    })->middleware('auth:sanctum', 'role:administrador');

});