<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Cita;
use Carbon\Carbon;
use Date;
use Illuminate\Http\Request;

class ContratosController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'numero_reconocimientos' => 'required|integer',
            'autorenovacion' => 'required|boolean|nullable',
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

    public function update(Request $request, $id)
    {
        $request->validate([
            'fecha_inicio' => 'date',
            'numero_reconocimientos' => 'integer',
            'autorenovacion' => 'boolean',
            'id_cliente' => 'integer|exists:clientes,id',
        ]);

        $contrato = Contrato::findOrFail($id);
        if ($request->has('fecha_inicio')) {
            $contrato->fecha_inicio = Carbon::parse($request->fecha_inicio);
            $contrato->fecha_fin = $contrato->fecha_inicio->copy()->addYear();
        }
        if ($request->has('numero_reconocimientos')) {
            $contrato->numero_reconocimientos = $request->numero_reconocimientos;
        }
        if ($request->has('autorenovacion')) {
            $contrato->autorenovacion = $request->autorenovacion;
        }
        if ($request->has('id_cliente')) {
            $contrato->id_cliente = $request->id_cliente;
        }
        $contrato->save();
        return response()->json(['message' => 'Contrato actualizado con éxito'], 200);
    }

    public function destroy($id)
    {
        $contrato = Contrato::findOrFail($id);
        $contrato->delete();
        return response()->json(['message' => 'Contrato eliminado con éxito'], 200);
    }

    public function index()
    {
        $contratos = Contrato::all();
        return response()->json($contratos, 200);
    }

    public function contratosPorCliente($id_cliente)
    {
        // Obtén todos los contratos del cliente
        $contratos = Contrato::where('id_cliente', $id_cliente)->get();

        // Si no hay contratos, devuelve una respuesta vacía
        if ($contratos->isEmpty()) {
            return response()->json(['message' => 'No contracts found'], 404);
        }

        // Recorremos los contratos y obtenemos los datos
        $contratosData = $contratos->map(function ($contrato) {
            $cliente = $contrato->cliente;

            return [
                'contrato' => $contrato->id,
                'empresa' => $cliente->razon_social,
                'num_reconocimientos' => $contrato->numero_reconocimientos,
                'reconocimientos_restantes' => $contrato->numero_reconocimientos - Cita::where('id_contrato', $contrato->id)->count(),
                'fecha_inicio' => $contrato->fecha_inicio,
                'fecha_fin' => $contrato->fecha_fin,
                'autorenovacion' => $contrato->autorenovacion,
            ];
        });

        // Devuelve el array de contratos
        return response()->json([
            'contratos' => $contratosData,
        ], 200);
    }


    public function show($id)
    {
        $contrato = Contrato::findOrFail($id);
        return response()->json($contrato, 200);
    }

    public function showAllContratos()
    {
        $contratos = Contrato::withTrashed()->get();
        return response()->json($contratos, 200);
    }

    public function showTrashedContratos()
    {
        $contratos = Contrato::onlyTrashed()->get();
        return response()->json($contratos, 200);
    }


    public function contratoVigente($id_cliente)
    {
        $unAnyoPrev = Carbon::now()->subYear();
        $cliente = Cliente::findOrFail($id_cliente);

        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado',
            ], 404);
        }
        $contratoVigente = Contrato::where('id_cliente', $cliente->id)
            ->where('fecha_inicio', '>=', $unAnyoPrev)
            ->orderByDesc('fecha_incio')->first();

        if (!$contratoVigente) {
            return response()->json([
                'message' => 'No hay contrato vigente para este cliente.',
            ], 404);
        }

        $contratoVigente->reconocimientos_restantes = $contratoVigente->numero_reconocimientos - $cliente->citas->count();

        return response()->json([
            'contrato_vigente' => $contratoVigente,
        ], 200);
    }

    private function obtenerContratoVigente($id_cliente)
    {
        $unAnyoPrev = Carbon::now()->subYear();
        $cliente = Cliente::find($id_cliente); // no uses findOrFail si puedes retornar null

        if (!$cliente) {
            return null;
        }

        return Contrato::where('id_cliente', $cliente->id)
            ->where('fecha_inicio', '>=', $unAnyoPrev)
            ->orderByDesc('fecha_inicio') // corregido "fecha_incio" por "fecha_inicio"
            ->first();
    }

    public function renovarContrato($id_cliente)
    {
        $contratoVigente = $this->obtenerContratoVigente($id_cliente);
        $hoy = Carbon::now();
        
        if (!$contratoVigente) {
            return response()->json([
                'message' => 'No se puede renovar porque no hay contrato vigente.',
            ], 404);
        }

        $contratoExistente = Contrato::where('id_cliente', $id_cliente)
            ->where('fecha_inicio', '>=', $hoy)
            ->exists();

        if ($contratoExistente) {
            return response()->json([
                'message' => 'Ya existe un contrato activo o futuro para este cliente.',
            ], 409);
        }


        
        if ($hoy <= $contratoVigente->fecha_fin) {
            return response()->json([
                'message' => 'El contrato aún está vigente, no se puede renovar.',
            ], 400);
        }

        $nuevoContrato = Contrato::create([
            'id_cliente' => $id_cliente,
            'fecha_inicio' => $hoy,
            'fecha_fin' => $hoy->copy()->addYear(),
            'numero_reconocimientos' => $contratoVigente->numero_reconocimientos,
            'autorenovacion' => false,
        ]);

        return response()->json([
            'message' => 'Contrato renovado exitosamente.',
            'nuevo_contrato' => $nuevoContrato,
        ], 201);
    }


    //Función para obtener las citas de un contrato
    public function citas($id_contrato)
    {
        // Buscar el contrato por su id
        $contrato = Contrato::find($id_contrato);

        // Si no se encuentra el contrato, retornar un mensaje de error
        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        // Obtener las citas asociadas a este contrato (pasadas y futuras)
        $citas = $contrato->citas;

        // Si no tiene citas, retornar un mensaje indicando que no tiene citas
        if ($citas->isEmpty()) {
            return response()->json(['message' => 'Este contrato no tiene citas asociadas.'], 200);
        }

        // Retornar los datos del contrato junto con las citas asociadas
        return response()->json([
            'contrato' => $contrato
        ], 200);
    }
}
