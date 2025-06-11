<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Paciente;
use App\Models\User;
use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class PacientesController extends Controller
{
    public function store(Request $request, $id_cliente)
    {
        try {
            // Validación con mensajes personalizados opcionales
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'dni' => 'required|string|min:9|max:9',
                'fecha_nacimiento' => 'required|date',
                'email' => 'required|email|max:255|unique:pacientes,email',
                'password' => 'required|string|min:8|max:255',
            ]);

            // Crear usuario
            $user = new User();
            $user->email = $request->email;
            $user->password = Hash::make($request->password);
            $user->save();
            $user->assignRole('Paciente');

            // Crear paciente
            $paciente = new Paciente();
            $paciente->nombre = $request->nombre;
            $paciente->apellidos = $request->apellidos;
            $paciente->dni = $request->dni;
            $paciente->fecha_nacimiento = $request->fecha_nacimiento;
            $paciente->email = $request->email;
            $paciente->id_cliente = $id_cliente;
            $paciente->id_usuario = $user->id;
            $paciente->save();

            return response()->json(['message' => 'Paciente creado con éxito'], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al crear el paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function update(Request $request, $id)
    {
        try {
            // Validación (no requerimos campos obligatorios porque es actualización parcial)
            $validatedData = $request->validate([
                'nombre' => 'nullable|string|max:255',
                'apellidos' => 'nullable|string|max:255',
                'dni' => 'nullable|string|min:9|max:9',
                'fecha_nacimiento' => 'nullable|date',
            ]);

            // Buscar paciente o lanzar error 404
            $paciente = Paciente::findOrFail($id);

            // Actualizar solo campos presentes
            if ($request->filled('nombre')) {
                $paciente->nombre = $request->nombre;
            }
            if ($request->filled('apellidos')) {
                $paciente->apellidos = $request->apellidos;
            }
            if ($request->filled('dni')) {
                $paciente->dni = $request->dni;
            }
            if ($request->filled('fecha_nacimiento')) {
                $paciente->fecha_nacimiento = $request->fecha_nacimiento;
            }

            $paciente->save();

            return response()->json(['message' => 'Paciente actualizado con éxito'], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Paciente no encontrado',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ocurrió un error al actualizar el paciente',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy($clienteId, $pacienteId)
    {
        try {
            // Buscar cliente y paciente, lanzar 404 si no existen
            $cliente = Cliente::findOrFail($clienteId);
            $paciente = Paciente::findOrFail($pacienteId);

            // Verificar que el paciente pertenece al cliente
            if ($paciente->id_cliente != $cliente->id) {
                return response()->json([
                    'message' => 'El paciente no pertenece a este cliente o no tienes permisos para eliminarlo.'
                ], 403);
            }

            // Eliminar paciente (SoftDelete o definitivo según tu modelo)
            if (!$paciente->delete()) {
                return response()->json([
                    'message' => 'No se pudo eliminar el paciente.'
                ], 500);
            }

            return response()->json([
                'message' => 'Paciente eliminado con éxito'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Paciente o Cliente no encontrado.'
            ], 404);
        } catch (\Throwable $e) {
            Log::error("Error al eliminar paciente", [
                'message' => $e->getMessage(),
                'cliente_id' => $clienteId,
                'paciente_id' => $pacienteId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error interno del servidor al eliminar el paciente. Por favor, inténtelo de nuevo más tarde.'
            ], 500);
        }
    }


    public function index()
    {
        $pacientes = Paciente::all();
        return response()->json($pacientes, 200);
    }

    public function show($id)
    {
        $paciente = Paciente::findOrFail($id);
        return response()->json($paciente, 200);
    }

    public function showAllPacientes()
    {
        $pacientes = Paciente::withTrashed()->get();
        return response()->json($pacientes, 200);
    }

    public function showTrashedPacientes()
    {
        $pacientes = Paciente::onlyTrashed()->get();
        return response()->json($pacientes, 200);
    }

    //listar los pacientes de un medico logueado
    public function pacientesByMedico(Request $request)
    {
        $user = Auth::user();
        $medico = Medico::where('id_usuario', $user->id)->first();

        if (!$medico) {
            return response()->json(['message' => 'Médico no encontrado'], 404);
        }
        if ($medico->rol !== 'medico') {
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $pacientes = Paciente::where('id_medico', $medico->id)->get();
        return response()->json($pacientes, 200);
    }

    //Listar los pacientes en función del contrato
    public function pacientesPorCliente(Request $request)
    {
        $user = Auth::user();

        $cliente = Cliente::where('id_usuario', $user->id)->first();

        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado para el usuario autenticado.'], 404);
        }

        $pacientes = $cliente->pacientes;

        if ($pacientes->isEmpty()) {
            return response()->json(['message' => 'No se encontraron pacientes para este cliente.'], 404);
        }

        return response()->json($pacientes, 200);
    }

    //listar los pacientes de un cliente, recibiendo el id del cliente como parámetro
    public function getPacientesPorClienteId($id_cliente)
    {
        $cliente = Cliente::with(['pacientes', 'contratos' => function($query) {
            $query->where('autorenovacion', true)->orderBy('fecha_inicio', 'desc');
        }])->find($id_cliente);

        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado.'], 404);
        }

        $idContrato = $cliente->contratos->first()->id ?? null;

        return response()->json([
            'pacientes' => $cliente->pacientes->map(function ($paciente) {
                return [
                    'id' => $paciente->id,
                    'nombre' => $paciente->nombre,
                    'apellidos' => $paciente->apellidos,
                ];
            }),
            'id_contrato' => $idContrato,
        ], 200);
    }
}
