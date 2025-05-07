<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;

class CitasController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'fecha_hora_cita' => 'required|date',
            // 'fecha_hora_inicio' => 'required|date',
            // 'fecha_hora_fin' => 'required|date|after:fecha_hora_inicio',
            'id_paciente' => 'required|integer|exists:pacientes,id',
            'id_medico' => 'required|integer|exists:medicos,id',
            'id_contrato' => 'required|integer|exists:users,id',
        ]);

        $cita = new Cita();

        $cita->fecha_hora_cita = $request->fecha_hora_cita;
        // $cita->fecha_hora_inicio = $request->fecha_hora_inicio;
        // $cita->fecha_hora_fin = $request->fecha_hora_fin;
        $cita->id_paciente = $request->id_paciente;
        $cita->id_medico = $request->id_medico;
        $cita->id_contrato = $request->id_contrato;
        $cita->save();
        return response()->json(['message' => 'Cita creada con éxito'], 201);
    }

    public function horarios(){
        
    }

    public function update(Request $request, $id){
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
        if($request->has('fecha_hora_cita')){
            $cita->fecha_hora_cita = $request->fecha_hora_cita;
        }
        // if($request->has('fecha_hora_inicio')){
        //     $cita->fecha_hora_inicio = $request->fecha_hora_inicio;
        // }
        // if($request->has('fecha_hora_fin')){
        //     $cita->fecha_hora_fin = $request->fecha_hora_fin;
        // }
        if($request->has('id_paciente')){
            $cita->id_paciente = $request->id_paciente;
        }
        if($request->has('id_medico')){
            $cita->id_medico = $request->id_medico;
        }
        if($request->has('id_contrato')){
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

    public function index(){
        $citas = Cita::all();
        return response()->json($citas, 200);
    }

    public function show($id){
        $cita = Cita::findOrFail($id);
        return response()->json($cita, 200);
    }

    public function showAllCitas(){
        $citas = Cita::withTrashed()->get();
        return response()->json($citas, 200);
    }

    public function showTrashedCitas(){
        $citas = Cita::onlyTrashed()->get();
        return response()->json($citas, 200);
    }

    public function showByDate($fecha_inicio, $fecha_fin){
        $citas = Cita::whereBetween('fecha_hora_cita', [$fecha_inicio, $fecha_fin])->get();
        return response()->json($citas, 200);
    }
}
