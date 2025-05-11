<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Http\Resources\CitasResource;
use Illuminate\Http\Request;

class CitasController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora_cita' => 'required|date',
            'id_paciente' => 'required|integer|exists:pacientes,id',
            'id_medico' => 'required|integer|exists:medicos,id',
            'id_contrato' => 'required|integer|exists:contratos,id',
            'estado' => 'in:pendiente,confirmada,completada,cancelada',
            'observaciones' => 'nullable|string',
        ]);

        $cita = new Cita();
        $cita->id_paciente = $request->id_paciente;
        $cita->id_medico = $request->id_medico;
        $cita->id_contrato = $request->id_contrato;
        $cita->fecha_hora_cita = $request->fecha_hora_cita;
        $cita->estado = $request->estado ?? 'pendiente';
        $cita->observaciones = $request->observaciones ?? null;
        $cita->save();

        return response()->json(['message' => 'Cita creada con éxito'], 201);
    }

    public function horarios()
    {
        // Falta implementar la lógica para mostrar los horarios disponibles para citas
        // Se podría devolver una lista de horarios libres según la disponibilidad del médico
        return response()->json(['message' => 'Función de horarios aún no implementada'], 200);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_hora_cita' => 'nullable|date',
            'id_paciente' => 'nullable|integer|exists:pacientes,id',
            'id_medico' => 'nullable|integer|exists:medicos,id',
            'id_contrato' => 'nullable|integer|exists:contratos,id',
            'estado' => 'nullable|in:pendiente,confirmada,completada,cancelada',
        ]);

        $cita = Cita::findOrFail($id);
        if ($request->has('fecha_hora_cita')) {
            $cita->fecha_hora_cita = $request->fecha_hora_cita;
        }
        if ($request->has('id_paciente')) {
            $cita->id_paciente = $request->id_paciente;
        }
        if ($request->has('id_medico')) {
            $cita->id_medico = $request->id_medico;
        }
        if ($request->has('id_contrato')) {
            $cita->id_contrato = $request->id_contrato;
        }
        if ($request->has('estado')) {
            $cita->estado = $request->estado;
        }
        $cita->save();

        return response()->json(['message' => 'Cita actualizada con éxito'], 200);
    }

    public function index()
    {
        $citas = Cita::all();
        return CitasResource::collection($citas);
    }

    public function show($id)
    {
        $cita = Cita::findOrFail($id);
        return new CitasResource($cita);
    }

    public function showAllCitas()
    {
        $citas = Cita::withTrashed()->get();
        return CitasResource::collection($citas);
    }

    public function showTrashedCitas()
    {
        $citas = Cita::onlyTrashed()->get();
        return CitasResource::collection($citas);
    }

    public function showByDate($fecha_inicio, $fecha_fin)
    {
        $citas = Cita::whereBetween('fecha_hora_cita', [$fecha_inicio, $fecha_fin])->get();
        return CitasResource::collection($citas);
    }

    // Función para mostrar las citas que tiene el médico logueado, paginadas
    public function citasPorMedico(Request $request, $medicoId)
    {
        $pageSize = $request->query('pageSize', 10);
        $page = $request->query('page', 1);
        $fecha = $request->query('fecha'); // Filtrar por fecha si es necesario

        $query = Cita::where('id_medico', $medicoId)->with('paciente');

        if ($fecha) {
            $query->whereDate('fecha_hora_cita', $fecha);
        }

        $citas = $query->paginate($pageSize, ['*'], 'page', $page);

        return response()->json([
            'total' => $citas->total(),
            'data' => CitasResource::collection($citas),
        ], 200);
    }

    // Función para mostrar las citas de un médico por día
    public function citasPorDiaMedico($id_medico, $fecha)
    {
        $citas = Cita::where('id_medico', $id_medico)
            ->whereDate('fecha_hora_cita', $fecha)
            ->get();
        return CitasResource::collection($citas);
    }

    // Función para mostrar las citas de un paciente por día
    public function citasPorDiaPaciente($id_paciente, $fecha)
    {
        $citas = Cita::where('id_paciente', $id_paciente)
            ->whereDate('fecha_hora_cita', $fecha)
            ->get();
        return CitasResource::collection($citas);
    }

    // Función para restaurar una cita eliminada
    public function restore($id)
    {
        $cita = Cita::withTrashed()->findOrFail($id);
        $cita->restore();
        return response()->json(['message' => 'Cita restaurada con éxito'], 200);
    }

    // Función para eliminar una cita de forma lógica (soft delete)
    public function destroy($id)
    {
        $cita = Cita::findOrFail($id);
        $cita->delete();
        return response()->json(['message' => 'Cita eliminada con éxito'], 200);
    }
}
