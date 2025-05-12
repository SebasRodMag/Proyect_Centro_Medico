<?php

namespace App\Http\Controllers;

use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// usar carbon
use Carbon\Carbon;

class MedicosController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|min:9|max:9',
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
            'fecha_fin' => 'date|after:fecha_inicio',
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

    // public function destroy($id)
    // {
    //     $medico = Medico::findOrFail($id);
    //     $medico->delete();
    //     return response()->json(['message' => 'Médico eliminado con éxito'], 200);
    // }
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
    
    public function showAllMedicos(){
        $medicos = Medico::withTrashed()->get();
        return response()->json($medicos, 200);
    }

    public function showTrashedMedicos(){
        $medicos = Medico::onlyTrashed()->get();
        return response()->json($medicos, 200);
    }

    public function citasHoy(Request $request, $id)
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

        return response()->json($citas);
    }

    //función para mostrar las citas de un medico logueado
    public function citasMedicoLogueadoAhora(Request $request)
    {
        $medico = Auth::user()->medico;

        if (!$medico) {
            return response()->json(['message' => 'No se encontró el médico asociado al usuario.'], 404);
        }

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

        return response()->json($citas);
    }

    //función para mostrar las citas de un medico según su id
    public function citasMedicoHoy(Request $request, $id)
    {
        $medico = Medico::findOrFail($id);

        if (!$medico) {
            return response()->json(['message' => 'No se encontró el médico.'], 404);
        }

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

        return response()->json($citas);
    }

    //función para mostrar todas las citas de un medico según su id
    public function citasMedico(Request $request, $id)
    {
        $medico = Medico::findOrFail($id);

        if (!$medico) {
            return response()->json(['message' => 'No se encontró el médico.'], 404);
        }

        $citas = $medico->citas()
            ->get();

        if ($citas->isEmpty()) {
            return response()->json(['message' => 'No hay citas para este médico.'], 404);
        }

        return response()->json($citas);
    }
    
}
