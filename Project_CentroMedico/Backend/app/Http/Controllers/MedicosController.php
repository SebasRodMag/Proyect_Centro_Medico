<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Http\Resources\CitaResource;
use App\Http\Resources\MedicoResource;
use App\Http\Resources\UserResource;
use App\Models\Cita;
use App\Models\User;

class MedicosController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|regex:/^[0-9]{8}[A-Z]$/i',//Luego modificarlo para que admita también NIE
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'date|after:fecha_inicio',
            'id_usuario' => 'required|integer|exists:users,id',
        ]);

        $medico = new Medico();
        $medico->nombre = $request->nombre;
        $medico->apellidos = $request->apellidos;
        $medico->dni = $request->dni;
        $medico->fecha_inicio = $request->fecha_inicio;
        $medico->fecha_fin = $request->fecha_fin;
        $medico->id_usuario = $request->id_usuario;
        $medico->save();

        return response()->json(['message' => 'Médico creado con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'string|max:255',
            'apellidos' => 'string|max:255',
            'dni' => 'string|min:9|max:9',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'nullable|date|after:fecha_inicio',
            'id_usuario' => 'integer|exists:users,id',
        ]);

        $medico = Medico::findOrFail($id);
        if ($request->has('nombre')) {
            $medico->nombre = $request->nombre;
        }
        if ($request->has('apellidos')) {
            $medico->apellidos = $request->apellidos;
        }
        if ($request->has('dni')) {
            $medico->dni = $request->dni;
        }
        if ($request->has('fecha_inicio')) {
            $medico->fecha_inicio = $request->fecha_inicio;
        }
        if ($request->has('fecha_fin')) {
            $medico->fecha_fin = $request->fecha_fin;
        }
        if ($request->has('id_usuario')) {
            $medico->id_usuario = $request->id_usuario;
        }
        $medico->save();

        return response()->json(['message' => 'Médico actualizado con éxito'], 200);
    }

    public function index()
    {
        return MedicoResource::collection(Medico::all());
    }
    public function show($id)
    {
        return new MedicoResource(Medico::findOrFail($id));
    }
    
    public function showAllMedicos()
    {
        return MedicoResource::collection(Medico::withTrashed()->get());
    }

    public function showTrashedMedicos()
    {
        return MedicoResource::collection(Medico::onlyTrashed()->get());
    }

    /**
     * Método para obtener el médico autenticado
     * @return JsonResponse
     * Devuelve el nombre y el apellido del médico autenticado
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function medicoLogueado(): JsonResponse
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return response()->json(['error' => 'No hay ningún usuario autenticado.'], 401);
        }

        $medico = $usuario->medico;

        if (!$medico) {
            return response()->json(['error' => 'El usuario autenticado no es un médico o no tiene asociado un perfil de médico.'], 403);
        }

        return response()->json([
            'nombre' => $medico->nombre,
            'apellidos' => $medico->apellidos,
        ]);
    }
    // Método para obtener las citas de un médico
    public function citas(Request $request, $id)
{
    $medico = Medico::findOrFail($id);

    $fecha = $request->query('fecha'); // formato esperado: YYYY-MM-DD

    if (!$fecha) {
        $fecha = Carbon::today()->toDateString();
    }

    $citas = $medico->citas()
        ->whereDate('fecha', $fecha)
        ->get();

    if ($citas->isEmpty()) {
        return response()->json(['message' => 'No hay citas para esta fecha.'], 404);
    }

    return CitaResource::collection($citas);
}

    public function destroy($id)
    {
        $medico = Medico::findOrFail($id);
        $medico->delete();

        return response()->json(['message' => 'Médico eliminado (soft delete) con éxito'], 200);
    }
    
}
