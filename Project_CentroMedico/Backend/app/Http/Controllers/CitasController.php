<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CitasController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fecha_hora_cita' => 'required|date',
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

    public function updateHoy(Request $request, $id)
    {
        Log::debug('Request recibida en updateHoy:', $request->all());
        $request->validate([
            'fecha_hora_cita' => 'nullable|date',
            'fecha_hora_inicio' => 'nullable|date',
            'fecha_hora_fin' => 'nullable|date|after:fecha_hora_inicio',
            'id_paciente' => 'nullable|integer|exists:pacientes,id',
            'id_medico' => 'nullable|integer|exists:medicos,id',
            'id_contrato' => 'nullable|integer|exists:users,id',
        ]);

        $cita = Cita::findOrFail($id);

        // Validar fecha de la cita (solo se permite modificar si es hoy)
        if ($request->filled('fecha_hora_cita')) {
            $nuevaFecha = \Carbon\Carbon::parse($request->fecha_hora_cita)->toDateString();
            $hoy = \Carbon\Carbon::now()->toDateString();
            if ($nuevaFecha !== $hoy) {
                return response()->json(['message' => 'Solo se pueden modificar citas del día actual'], 403);
            }

            $cita->fecha_hora_cita = $request->fecha_hora_cita;
        }

        // Asignar valores si vienen en la request
        foreach (['fecha_hora_inicio', 'fecha_hora_fin', 'id_paciente', 'id_medico', 'id_contrato'] as $campo) {
            if ($request->filled('hora')) {
                // Asumimos que la fecha es hoy
                $nuevaFechaCompleta = \Carbon\Carbon::today()->format('Y-m-d') . ' ' . $request->hora . ':00';
                $cita->fecha_hora_cita = $nuevaFechaCompleta;
            }
        }
        Log::debug('Campos modificados:', $cita->getDirty());

        // Guardar siempre (opcional: puedes comparar campos tú mismo)
        $cita->save();

        return response()->json(['message' => 'Cita actualizada con éxito'], 200);
    }


    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_hora_cita' => 'date',

            // ---- Campos para guardar hora real que ha iniciado y acabado la cita ----
            // 'fecha_hora_inicio' => 'date',
            // 'fecha_hora_fin' => 'date|after:fecha_hora_inicio',
            // 'id_paciente' => 'integer|exists:pacientes,id',
            'id_medico' => 'integer|exists:medicos,id',
            // 'id_contrato' => 'integer|exists:users,id',
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
        // if ($request->has('id_paciente')) {
        //     $cita->id_paciente = $request->id_paciente;
        // }
        if ($request->has('id_medico')) {
            $cita->id_medico = $request->id_medico;
        }
        // if ($request->has('id_contrato')) {
        //     $cita->id_contrato = $request->id_contrato;
        // }
        $cita->save();
        return response()->json(['message' => 'Cita actualizada con éxito'], 200);
    }

    public function destroy($id_cliente){
        $cita = Cita::findOrFail($id_cliente);
        $cita->delete();
        return response()->json(['message' => 'Cita eliminada correctamente'], 200);
    }

    public function index()
    {
        $citas = Cita::with(['paciente.cliente', 'medico', 'contrato.cliente'])->get();

        $citasFormateadas = $citas->map(function ($cita) {
            $cliente = $cita->cliente
                ?? $cita->paciente->cliente
                ?? $cita->contrato->cliente;

            $numeroDeCita = null;

            if ($cita->contrato && $cliente) {
                $contrato = $cita->contrato;
                $totalReconocimientos = $contrato->numero_reconocimientos;

                $citasContrato = Cita::where('id_contrato', $contrato->id)
                    ->orderBy('fecha_hora_cita')
                    ->get();

                $posicion = $citasContrato->search(function ($c) use ($cita) {
                    return $c->id === $cita->id;
                });

                if ($posicion !== false) {
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
                'id_medico' => $cita->medico ? $cita->medico->id : null,
                'medico' => $cita->medico ? $cita->medico->nombre . ' ' . $cita->medico->apellidos : null,
                'numero_de_cita' => $numeroDeCita,
                'estado' => $cita->estado,
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

    public function citasPorMedicoLogueado()
    {
        $user = Auth::user();
        $medico = $user->medico;

        if (!$medico) {
            return response()->json(['error' => 'El usuario no está registrado como médico.'], 403);
        }

        $citas = $medico->citas()->with(['paciente', 'medico'])->get();

        return response()->json($citas, 200);
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
        //verificar el formato de la fecha y la hora:
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        return response()->json(['error' => 'Formato de fecha inválido. Se espera YYYY-MM-DD.'], 400);
        }
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

    public function obtenerHorasDisponiblesHoy(Request $request)
    {
        // Asegurarse de que el usuario esté autenticado y sea médico
        $user = Auth::user();
        $medico = Medico::where('id', $user->id)->first();

        if (!$medico) {
            return response()->json(['error' => 'El usuario no es un Médico autenticado.'], 403);
        }

        // Rango de horario permitido (9:00 a 14:00)
        $inicio = Carbon::createFromTime(9, 0, 0);
        $fin = Carbon::createFromTime(14, 0, 0);

        $horaActual = Carbon::now();

        $horasDisponibles = [];
        $iterador = $inicio->copy();

        while ($iterador < $fin) {
            // Solo añadir la hora si es igual o posterior a la hora actual
            if ($iterador->greaterThanOrEqualTo($horaActual)) {
                $horasDisponibles[] = $iterador->format('H:i');
            }
            $iterador->addMinutes(5);
        }

        // Obtener citas del médico logueado para hoy con estado pendiente o realizado
        $hoy = Carbon::today();
        $citasDeHoy = Cita::whereDate('fecha_hora_cita', $hoy)
            ->where('id_medico', $medico->id)
            ->whereIn('estado', ['pendiente', 'realizado'])
            ->pluck('fecha_hora_cita');

        // Extraer horas ocupadas en formato 'H:i'
        $horasOcupadas = $citasDeHoy->map(function ($fecha) {
            return Carbon::parse($fecha)->format('H:i');
        })->toArray();

        // Filtrar las horas disponibles eliminando las ocupadas
        $horasDisponibles = array_values(array_diff($horasDisponibles, $horasOcupadas));

        return response()->json(['horas_disponibles' => $horasDisponibles]);
    }

    //Función para eliminar una cita para un médico logueado recibiendo como parámetro el id de la cita
    public function eliminarCitaMedico(Request $request, $id)
    {
        $user = Auth::user();
        $medico = Medico::where('id_usuario', $user->id)->first();

        if (!$medico) {
            return response()->json(['error' => 'El usuario no es un Médico autenticado.'], 403);
        }
        $cita = Cita::findOrFail($id);
        $cita->delete();
        return response()->json(['message' => 'Cita eliminada con éxito'], 200);
    }

    //función para cancelar una cita recibiendo como parámetro el id de la cita y el campo que 'estado' que se desea modificar.
    public function cancelarCita(Request $request, $id)
    {
        $user = Auth::user();
        $medico = Medico::where('id', $user->id)->first();

        Log::info('Solicitud recibida para cambiar estado de cita', [
            'user_id' => $user->id,
            'cita_id' => $id,
            'datos' => $request->all()
        ]);


        if (!$medico) {
            return response()->json(['error' => 'El usuario no es un Médico autenticado.'], 403);
        }

        $validated = $request->validate([
            'estado' => ['required', Rule::in(['cancelado', 'realizado'])],
        ]);

        $cita = Cita::findOrFail($id);

        if ($cita->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo se pueden modificar citas pendientes.'], 403);
        }

        $cita->estado = $validated['estado'];
        $cita->save();

        return response()->json(['message' => 'Cita actualizada con éxito'], 200);
    }
}
