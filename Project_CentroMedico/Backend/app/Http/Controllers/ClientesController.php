<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Paciente;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ClientesController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'email|required',
            'password' => 'required|string|min:8',
            'razon_social' => 'required|string|max:255',
            'cif' => 'required|string|min:9|max:9|unique:clientes',
            'direccion' => 'required|string|max:255',
            'municipio' => 'required|string|max:255',
            'provincia' => 'required|string|max:255',
            'reconocimientos' => 'required|integer',
        ]);

        $user = new User();
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->save();
        $user->assignRole('Cliente');
        
        $cliente = new Cliente();
        $cliente->razon_social = $request->razon_social;
        $cliente->cif = $request->cif;
        $cliente->direccion = $request->direccion;
        $cliente->municipio = $request->municipio;
        $cliente->provincia = $request->provincia;
        $cliente->id_usuario = $user->id;
        $cliente->save();

        $contrato = new Contrato();
        $contrato->fecha_inicio = now();
        $contrato->fecha_fin = now()->addYear();
        $contrato->numero_reconocimientos = $request->reconocimientos;
        $contrato->autorenovacion = true;
        $contrato->id_cliente = $cliente->id;
        $contrato->save();
        return response()->json(['message' => 'Cliente y contrato creados con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'razon_social' => 'string|max:255',
            'cif' => 'string|min:9|max:9|unique:clientes,cif,' . $id,
            'direccion' => 'string|max:255',
            'municipio' => 'string|max:255',
            'provincia' => 'string|max:255',
        ]);
        $cliente = Cliente::findOrFail($id);
        if ($request->has('razon_social')) {
            $cliente->razon_social = $request->razon_social;
        }
        if ($request->has('cif')) {
            $cliente->cif = $request->cif;
        }
        if ($request->has('direccion')) {
            $cliente->direccion = $request->direccion;
        }
        if ($request->has('municipio')) {
            $cliente->municipio = $request->municipio;
        }
        if ($request->has('provincia')) {
            $cliente->provincia = $request->provincia;
        }
        $cliente->save();
        return response()->json(['message' => 'Cliente actualizado con éxito'], 200);
    }

    public function index()
    {
        $clientes = Cliente::with(['contratos' => function ($query) {
            $query->where('fecha_inicio', '<=', now())
                ->where('fecha_inicio', '>=', now()->subYear())
                ->orderBy('fecha_inicio', 'desc');
        }])->get();

        foreach ($clientes as $cliente) {
            // Obtener el contrato vigente (el primero más reciente del último año)
            $contratoVigente = $cliente->contratos->first();

            if ($contratoVigente) {
                // Calcular reconocimientos restantes
                $citasRealizadas = Cita::where('id_contrato', $contratoVigente->id)->count();
                $contratoVigente->reconocimientos_restantes = $contratoVigente->numero_reconocimientos - $citasRealizadas;

                // Adjuntar el contrato completo al cliente como contrato_vigente
                $cliente->contrato_vigente = $contratoVigente;
            } else {
                $cliente->contrato_vigente = null;
            }
        }

        return response()->json($clientes, 200);
    }



    //Funcon para mostrar un cliente por Id
    public function show($id)
    {
        $cliente = Cliente::findOrFail($id);
        return response()->json($cliente, 200);
    }

    public function destroy($id){
        $cliente = Cliente::findOrFail($id);
        $cliente->delete();
        return response()->json(['message' => 'Cliente eliminado con éxito'], 200);
    }
    

    //Función para mostrar todos los usuarios, tanto activos como eliminados
    public function showAllUsers()
    {
        $users = Cliente::withTrashed()->get();
        return response()->json($users, 200);
    }

    //Función para mostrar solo los usuarios eliminados
    public function showTrashedUsers()
    {
        $users = Cliente::onlyTrashed()->get();
        return response()->json($users, 200);
    }

    //Función para buscar por Razón Social
    public function searchByRazonSocial($razon_social)
    {
        $clientes = Cliente::where('razon_social', 'LIKE', '%' . $razon_social . '%')->get();
        return response()->json($clientes, 200);
    }

    //Funcion para buscar por CIF
    public function searchByCif($cif)
    {
        $clientes = Cliente::where('cif', 'LIKE', '%' . $cif . '%')->get();
        return response()->json($clientes, 200);
    }

    //Función para buscar por municipio
    public function searchByMunicipio($municipio)
    {
        $clientes = Cliente::where('municipio', 'LIKE', '%' . $municipio . '%')->get();
        return response()->json($clientes, 200);
    }

    //Función para buscar pacientes por cliente
    public function pacientes($id_cliente)
    {
        // Buscar al cliente por su id
        $cliente = Cliente::findOrFail($id_cliente);

        // Si no se encuentra el cliente, retornar un mensaje de error
        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        // Obtener los pacientes asociados a este cliente
        $pacientes = $cliente->pacientes;

        // Si no tiene pacientes, retornar un mensaje indicando que no tiene pacientes
        if ($pacientes->isEmpty()) {
            return response()->json(['message' => 'Este cliente no tiene pacientes asociados.'], 200);
        }
        $pacientes->transform(function ($paciente) {
            $paciente->nombre_paciente = $paciente->nombre . ' ' . $paciente->apellidos;
            return $paciente;
        });
        // Retornar la lista de pacientes
        return response()->json([
            'cliente' => $cliente->razon_social,
            'pacientes' => $pacientes
        ], 200);
    }

    //Función para buscar citas por cliente
    public function citas($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado.'], 404);
        }

        $citas = $cliente->contratos()
            ->with(['citas.paciente', 'citas.medico'])
            ->get()
            ->pluck('citas')
            ->flatten()
            ->map(function ($cita) {
                $fechaHora = Carbon::parse($cita->fecha_hora_cita);
                return [
                    'id' => $cita->id,
                    'fecha' => $fechaHora->toDateString(),
                    'hora' => $fechaHora->format('H:i'),
                    'observaciones' => $cita->observaciones,
                    'nombre_paciente' => $cita->paciente->nombre . ' ' . $cita->paciente->apellidos,
                    'nombre_medico' => $cita->medico->nombre . ' ' . $cita->medico->apellidos,
                    'estado' => $cita->estado,

                ];
            });

        if ($citas->isEmpty()) {
            return response()->json([
                'cliente' => $cliente,
                'message' => 'No hay citas asociadas a este cliente.'
            ], 200);
        }

        return response()->json([
            'cliente' => $cliente,
            'citas' => $citas
        ], 200);
    }



    public function pacientesByCIF($cif)
    {
        // Buscar el cliente por CIF
        $cliente = Cliente::where('cif', $cif)->first();

        // Si el cliente no existe
        if (!$cliente) {
            return response()->json([
                'error' => 'Cliente no encontrado.'
            ], 404);
        }

        // Obtener todos los pacientes asociados al cliente
        $pacientes = Paciente::where('id_cliente', $cliente->id)->get();

        // Si no hay pacientes
        if ($pacientes->isEmpty()) {
            return response()->json([
                'cliente' => $cliente,
                'message' => 'No hay pacientes asociados a este cliente.'
            ], 200);
        }

        // Respuesta exitosa con datos
        return response()->json([
            'cliente' => $cliente,
            'pacientes' => $pacientes
        ], 200);
    }
}
