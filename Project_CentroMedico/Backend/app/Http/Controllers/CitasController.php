<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CitasController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora_cita' => 'required|date',
            // 'fecha_hora_inicio' => 'required|date',
            // 'fecha_hora_fin' => 'required|date|after:fecha_hora_inicio',
            'id_paciente' => 'required|integer|exists:pacientes,id',
            'id_medico' => 'required|integer|exists:medicos,id',
            'id_contrato' => 'required|integer|exists:contratos,id',
        ]);

        $existeCita = Cita::where('id_medico', $request->id_medico)
            ->where('fecha_hora_cita', $request->fecha_hora_cita)
            ->exists();

        if ($existeCita) {
            return response()->json([
                'message' => 'El médico ya tiene una cita programada en ese horario.'
            ], 422);
        }

        $cita = new Cita();

        // $cita->fecha_hora_inicio = $request->fecha_hora_inicio;
        // $cita->fecha_hora_fin = $request->fecha_hora_fin;
        $cita->id_paciente = $request->id_paciente;
        $cita->id_medico = $request->id_medico;
        $cita->id_contrato = $request->id_contrato;
        $cita->fecha_hora_cita = $request->fecha_hora_cita;
        $cita->estado = $request->estado ?? 'pendiente';
        $cita->observaciones = $request->observaciones ?? null;
        $cita->save();
        return response()->json(['message' => 'Cita creada con éxito'], 201);
    }

    public function horarios() {}

    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_hora_cita' => 'date',

            // ---- Campos para guardar hora real que ha iniciado y acabado la cita ----
            // 'fecha_hora_inicio' => 'date',
            // 'fecha_hora_fin' => 'date|after:fecha_hora_inicio',
            'id_paciente' => 'integer|exists:pacientes,id',
            'id_medico' => 'integer|exists:medicos,id',
            'id_contrato' => 'integer|exists:users,id',
        ]);

        $cita = Cita::findOrFail($id);
        if ($request->has('fecha_hora_cita')) {
            $cita->fecha_hora_cita = $request->fecha_hora_cita;
        }
        // if($request->has('fecha_hora_inicio')){
        //     $cita->fecha_hora_inicio = $request->fecha_hora_inicio;
        // }
        // if($request->has('fecha_hora_fin')){
        //     $cita->fecha_hora_fin = $request->fecha_hora_fin;
        // }
        if ($request->has('id_paciente')) {
            $cita->id_paciente = $request->id_paciente;
        }
        if ($request->has('id_medico')) {
            $cita->id_medico = $request->id_medico;
        }
        if ($request->has('id_contrato')) {
            $cita->id_contrato = $request->id_contrato;
        }
        $cita->save();
        return response()->json(['message' => 'Cita actualizada con éxito'], 200);
    }

    // public function destroy($id){
    //     $cita = Cita::findOrFail($id);
    //     $cita->delete();
    //     return response()->json(['message' => 'Cita eliminada con éxito'], 200);
    // }

    public function index()
    {
        $citas = Cita::with(['paciente.cliente', 'medico', 'contrato.cliente'])->get();

        $citasFormateadas = $citas->map(function ($cita) {
            // Intenta sacar el cliente desde paciente o contrato
            $cliente = $cita->cliente
                ?? $cita->paciente->cliente
                ?? $cita->contrato->cliente;

            // Valor por defecto si no hay contrato
            $numeroDeCita = null;

            if ($cita->contrato && $cliente) {
                $contrato = $cita->contrato;
                $totalReconocimientos = $contrato->numero_reconocimientos;

                // Obtener todas las citas del contrato ordenadas por fecha
                $citasContrato = Cita::where('id_contrato', $contrato->id)
                    ->orderBy('fecha_hora_cita')
                    ->get();

                // Encontrar la posición de esta cita
                $posicion = $citasContrato->search(function ($c) use ($cita) {
                    return $c->id === $cita->id;
                });

                if ($posicion !== false) {
                    // Sumamos 1 porque search devuelve índice 0-based
                    $numeroDeCita = ($posicion + 1) . '/' . $totalReconocimientos;
                }
            }

            return [
                'id' => $cita->id,
                'contrato_id' => $cita->contrato->id ?? null,
                'paciente' => $cita->paciente ? $cita->paciente->nombre . ' ' . $cita->paciente->apellidos : null,
                'dni_paciente' => $cita->paciente ? $cita->paciente->dni : null,
                'fecha' => $cita->fecha_hora_cita,
                'cliente' => $cliente->razon_social ?? null,
                'medico' => $cita->medico ? $cita->medico->nombre . ' ' . $cita->medico->apellidos : null,
                'numero_de_cita' => $numeroDeCita, // e.g., "3/80"
            ];
        });

        return response()->json([
            'citas' => $citasFormateadas,
        ], 200);
    }




    public function show($id)
    {
        $cita = Cita::findOrFail($id);
        return response()->json($cita, 200);
    }

    public function showAllCitas()
    {
        $citas = Cita::withTrashed()->get();
        return response()->json($citas, 200);
    }

    public function showTrashedCitas()
    {
        $citas = Cita::onlyTrashed()->get();
        return response()->json($citas, 200);
    }

    public function showByDate($fecha_inicio, $fecha_fin)
    {
        $citas = Cita::whereBetween('fecha_hora_cita', [$fecha_inicio, $fecha_fin])->get();
        return response()->json($citas, 200);
    }

    // Función para mostrar las citas que tiene el medico logueado paginada de a 10

    public function citasPorMedico(Request $request, $medicoId)
    {
        $pageSize = $request->query('pageSize', 10);
        $page = $request->query('page', 1);
        $fecha = $request->query('fecha'); // parámetro opcional

        $query = Cita::with(['paciente.cliente', 'medico', 'contrato.cliente'])
            ->where('id_medico', $medicoId);

        if ($fecha) {
            $query->whereDate('fecha_hora_cita', $fecha);
        }

        $citas = $query->paginate($pageSize, ['*'], 'page', $page);

        $citasFormateadas = $citas->getCollection()->map(function ($cita) {
            $cliente = $cita->cliente
                ?? $cita->paciente->cliente
                ?? $cita->contrato->cliente;

            return [
                'id' => $cita->id,
                'contrato_id' => $cita->contrato->id ?? null,
                'paciente' => $cita->paciente ? $cita->paciente->nombre . ' ' . $cita->paciente->apellidos : null,
                'dni_paciente' => $cita->paciente->dni ?? null,
                'fecha' => $cita->fecha_hora_cita,
                'cliente' => $cliente->razon_social ?? null,
                'medico' => $cita->medico ? $cita->medico->nombre . ' ' . $cita->medico->apellidos : null,
                'estado' => $cita->estado,
            ];
        });

        return response()->json([
            'total' => $citas->total(),
            'data' => $citasFormateadas,
        ], 200);
    }

    //implementar la función para mostrar las citas de un médico
    public function citasPorDia($fecha)
    {
        $citas = Cita::whereDate('fecha_hora_cita', $fecha)->get();
        return response()->json($citas, 200);
    }
    //implementar la función para mostrar las citas de un médico
    public function citasPorDiaMedico($id_medico, $fecha)
    {
        $citas = Cita::where('id_medico', $id_medico)->whereDate('fecha_hora_cita', $fecha)->get();
        return response()->json($citas, 200);
    }

    //implementar la función para mostrar las citas de un paciente
    public function citasPorDiaPaciente($id_paciente, $fecha)
    {
        $citas = Cita::where('id_paciente', $id_paciente)->whereDate('fecha_hora_cita', $fecha)->get();
        return response()->json($citas, 200);
    }

    //implementar la función para mostrar las citas de un cliente
    public function citasPorDiaCliente($id_cliente, $fecha)
    {
        $citas = Cita::where('id_cliente', $id_cliente)->whereDate('fecha_hora_cita', $fecha)->get();
        return response()->json($citas, 200);
    }

    // Método para obtener las horas disponibles de un médico para un día
    public function horariosDisponibles(Request $request, $id_medico, $fecha)
    {
        // Definir el rango de horas en el que se puede reservar (09:00 a 15:00)
        $horaInicio = Carbon::createFromFormat('Y-m-d H:i', "$fecha 09:00");
        $horaFin = Carbon::createFromFormat('Y-m-d H:i', "$fecha 15:00");

        // Crear un array con todas las horas del día (por ejemplo, de 09:00 a 15:00 cada 5 minutos)
        $horasDisponibles = [];
        while ($horaInicio < $horaFin) {
            $horasDisponibles[] = $horaInicio->format('H:i');
            $horaInicio->addMinutes(5); // Cada cita tiene 5 minutos
        }

        // Obtener todas las citas ocupadas en ese día para el médico
        $citasOcupadas = Cita::where('id_medico', $id_medico)
            ->whereDate('fecha_hora_cita', $fecha)
            ->get(['fecha_hora_cita']);

        // Convertir las horas de las citas ocupadas en formato 'H:i'
        $horasOcupadas = $citasOcupadas->map(function ($cita) {
            return Carbon::parse($cita->fecha_hora_cita)->format('H:i');
        })->toArray();

        // Filtrar las horas disponibles (eliminamos las horas ocupadas)
        $horasDisponibles = array_diff($horasDisponibles, $horasOcupadas);

        return response()->json([
            'horas_disponibles' => array_values($horasDisponibles),
        ], 200);
    }
}
