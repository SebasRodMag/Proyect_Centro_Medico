<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Paciente;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientesController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([

            'razon_social' => 'required|string|max:255',
            'cif' => 'required|string|min:9|max:9|unique:clientes',
            'direccion' => 'required|string|max:255',
            'municipio' => 'required|string|max:255',
            'provincia' => 'required|string|max:255',
            'id_usuario' => 'required|integer|exists:users,id',
        ]);
        $cliente = new Cliente();
        $cliente->razon_social = $request->razon_social;
        $cliente->cif = $request->cif;
        $cliente->direccion = $request->direccion;
        $cliente->municipio = $request->municipio;
        $cliente->provincia = $request->provincia;
        $cliente->id_usuario = $request->id_usuario;
        $cliente->save();
        return response()->json(['message' => 'Cliente creado con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'razon_social' => 'string|max:255',
            'cif' => 'string|min:9|max:9|unique:clientes,cif,' . $id,
            'direccion' => 'string|max:255',
            'municipio' => 'string|max:255',
            'provincia' => 'string|max:255',
            'id_usuario' => 'integer|exists:users,id',
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
        if ($request->has('id_usuario')) {
            $cliente->id_usuario = $request->id_usuario;
        }
        $cliente->save();
        return response()->json(['message' => 'Cliente actualizado con éxito'], 200);
    }

    // public function destroy($id){
    //     $cliente = Cliente::findOrFail($id);
    //     $cliente->delete();
    //     return response()->json(['message' => 'Cliente eliminado con éxito'], 200);
    // }

    public function index()
    {
        $clientes = Cliente::all();
        return response()->json($clientes, 200);
    }

    //Funcon para mostrar un cliente por Id
    public function show($id)
    {
        $cliente = Cliente::findOrFail($id);
        return response()->json($cliente, 200);
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

    //Funcion para buscar contratos por cliente
    public function contratos($id)
    {
        // 1. Verificar si el cliente existe
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        // 2. Obtener contratos del cliente, incluyendo eliminados
        $contratos = Contrato::withTrashed()
            ->where('id_cliente', $id)
            ->orderByDesc('fecha_inicio')
            ->paginate(10);

        // 3. Devolver los detalles del cliente y los contratos, aunque esté vacío
        return response()->json([
            'cliente' => $cliente,  // Información del cliente
            'message' => $contratos->isEmpty() ? 'El cliente no tiene contratos' : 'Contratos recuperados con éxito',
            'data' => $contratos
        ], 200);
    }

    public function contratoVigente($id_cliente)
    {
        // 1. Verificar si el cliente existe
        $cliente = Cliente::find($id_cliente);

        if (!$cliente) {
            return response()->json([
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        // 2. Obtener el contrato vigente basado en las fechas
        $hoy = now(); // Fecha actual

        $contratoVigente = Contrato::withTrashed()
            ->where('id_cliente', $id_cliente)
            ->where('fecha_inicio', '<=', $hoy) // El contrato debe haber comenzado antes o hoy
            ->where('fecha_fin', '>=', $hoy)   // El contrato debe terminar después o hoy
            ->first();  // Devolvemos solo el primer contrato vigente

        // 3. Si no hay contrato vigente
        if (!$contratoVigente) {
            return response()->json([
                'message' => 'No hay contrato vigente para este cliente'
            ], 404);
        }

        // 4. Devolver los detalles del contrato vigente
        return response()->json([
            'cliente' => $cliente,  // Información del cliente
            'contrato' => $contratoVigente,  // Contrato vigente
            'message' => 'Contrato vigente recuperado con éxito',
        ], 200);
    }

    public function reconocimientosRestantes($id_contrato)
    {
        // Buscar el contrato por su id
        $contrato = Contrato::find($id_contrato);

        // Si no se encuentra el contrato, retornar un mensaje de error
        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        // Calcular los reconocimientos restantes
        $reconocimientos_restantes = $contrato->numero_reconocimientos - $contrato->citas()->count();

        // Retornar la cantidad de reconocimientos restantes
        return response()->json([
            'reconocimientos_restantes' => $reconocimientos_restantes
        ], 200);

    }

    //Función para buscar pacientes por cliente
    public function pacientes($id_cliente)
    {
        // Buscar al cliente por su id
        $cliente = Cliente::find($id_cliente);

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

        // Retornar la lista de pacientes
        return response()->json([
            'cliente' => $cliente->razon_social,
            'pacientes' => $pacientes], 200);
    }

    //Función para buscar citas por cliente
    public function citas($id)
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole(['Cliente', 'Administrador'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        // Buscar el cliente por ID
        $cliente = Cliente::find($id);

        // Si el cliente no existe
        if (!$cliente) {
            return response()->json([
                'error' => 'Cliente no encontrado.'
            ], 404);
        }

        // Obtener todas las citas a través de los contratos asociados al cliente
        $citas = $cliente->contratos()
            ->with('citas') // carga las citas de cada contrato
            ->get()
            ->pluck('citas')
            ->flatten();

        // Si no hay citas
        if ($citas->isEmpty()) {
            return response()->json([
                'cliente' => $cliente,
                'message' => 'No hay citas asociadas a este cliente.'
            ], 200);
        }

        // Respuesta exitosa con datos
        return response()->json([
            'cliente' => $cliente,
            'citas' => $citas
        ], 200);
    }
    //Función que devuelve los datos del cliente logueado
    public function datosCliente()
    {
        $cliente = Auth::user()->cliente;

        if (!$cliente) {
            return response()->json(['message' => 'No se encontró el cliente asociado al usuario.'], 404);
        }

        return response()->json($cliente, 200);
    }
}