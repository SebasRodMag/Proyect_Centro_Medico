<?php

namespace App\Http\Controllers;

use App\Models\Medico;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicosController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|min:9|max:9',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $medico = new Medico();
        $medico->nombre = $request->nombre;
        $medico->apellidos = $request->apellidos;
        $medico->dni = $request->dni;
        $medico->fecha_inicio = now();
        $medico->fecha_fin = null;
        $medico->id_usuario = $user->id;
        $medico->save();

        return response()->json(['message' => 'Médico creado con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'string|max:255',
            'apellidos' => 'string|max:255',
            'dni' => 'string|min:9|max:9',
            'fecha_fin' => 'date|nullable',
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
        if ($request->has('fecha_fin')) {
            $medico->fecha_fin = $request->fecha_fin;
        }
        $medico->save();

        return response()->json(['message' => 'Médico actualizado con éxito'], 200);
    }

    public function destroy($id)
    {
        $medico = Medico::findOrFail($id);
        $medico->delete();
        return response()->json(['message' => 'Médico eliminado con éxito'], 200);
    }
    public function index()
    {
        $medicos = Medico::all();
        return response()->json($medicos, 200);
    }
    public function show($id)
    {
        $medico = Medico::findOrFail($id);
        return response()->json($medico, 200);
    }

    public function showAllMedicos()
    {
        $medicos = Medico::withTrashed()->get();
        return response()->json($medicos, 200);
    }

    public function showTrashedMedicos()
    {
        $medicos = Medico::onlyTrashed()->get();
        return response()->json($medicos, 200);
    }

    /**
     * Método para obtener el médico autenticado
     * @return JsonResponse
     * Devuelve el nombre y el apellido del médico autenticado
     * @throws \Illuminate\Auth\AuthenticationException
     */
    //Función para devolver el medico logueado
    public function medicoLogueado(Request $request)
    {
        $user = Auth::user();
        $medico = Medico::where('id', $user->id)->first();

        if (!$medico) {
            return response()->json(['message' => 'Médico no encontrado'], 404);
        }

        return response()->json([
            'nombre' => $medico->nombre,
            'apellidos' => $medico->apellidos,
            'dni' => $medico->dni,
            'email' => $user->email,
            'id' => $medico->id,
        ], 200);
    }
}
