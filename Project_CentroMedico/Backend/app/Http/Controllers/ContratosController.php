<?php

namespace App\Http\Controllers;

use App\Models\Contrato;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ContratosController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'fecha_inicio' => 'required|date',
            'numero_reconocimientos' => 'required|integer',
            'autorenovacion' => 'required|boolean',
            'id_cliente' => 'required|integer|exists:clientes,id',
        ]);

        //Hacer automaticamente que la fecha de fin sea un año después de la fecha de inicio
        $fecha_inicio = Carbon::parse($request->fecha_inicio);
        $fecha_fin = $fecha_inicio->copy()->addYear();

        $contrato = new Contrato();
        $contrato->fecha_inicio = $fecha_inicio;
        $contrato->fecha_fin = $fecha_fin;
        $contrato->numero_reconocimientos = $request->numero_reconocimientos;
        $contrato->autorenovacion = $request->autorenovacion;
        $contrato->id_cliente = $request->id_cliente;
        $contrato->save();
        return response()->json(['message' => 'Contrato creado con éxito'], 201);
    }

    public function update(Request $request, $id){
        $request->validate([
            'fecha_inicio' => 'date',
            'numero_reconocimientos' => 'integer',
            'autorenovacion' => 'boolean',
            'id_cliente' => 'integer|exists:clientes,id',
        ]);

        $contrato = Contrato::findOrFail($id);
        if($request->has('fecha_inicio')){
            $contrato->fecha_inicio = Carbon::parse($request->fecha_inicio);
            $contrato->fecha_fin = $contrato->fecha_inicio->copy()->addYear();
        }
        if($request->has('numero_reconocimientos')){
            $contrato->numero_reconocimientos = $request->numero_reconocimientos;
        }
        if($request->has('autorenovacion')){
            $contrato->autorenovacion = $request->autorenovacion;
        }
        if($request->has('id_cliente')){
            $contrato->id_cliente = $request->id_cliente;
        }
        $contrato->save();
        return response()->json(['message' => 'Contrato actualizado con éxito'], 200);
    }

    public function destroy($id){
        $contrato = Contrato::findOrFail($id);
        $contrato->delete();
        return response()->json(['message' => 'Contrato eliminado con éxito'], 200);
    }

    public function index(){
        $contratos = Contrato::all();
        return response()->json($contratos, 200);
    }

    public function show($id){
        $contrato = Contrato::findOrFail($id);
        return response()->json($contrato, 200);
    }

    public function showAllContratos(){
        $contratos = Contrato::withTrashed()->get();
        return response()->json($contratos, 200);
    }

    public function showTrashedContratos(){
        $contratos = Contrato::onlyTrashed()->get();
        return response()->json($contratos, 200);
    }
}