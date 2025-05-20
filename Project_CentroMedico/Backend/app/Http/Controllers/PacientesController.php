<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\User;
use App\Models\Auth;
use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PacientesController extends Controller
{
    public function store(Request $request, $id_cliente)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'dni' => 'required|string|min:9|max:9',
            'fecha_nacimiento' => 'required|date',
            'email' => 'required|email|max:255|unique:pacientes,email',
            'password' => 'required|string|min:8|max:255',
            // 'telefono' => 'required|string|max:15',
            // 'direccion' => 'required|string|max:255',
            // 'id_cliente' => 'required|integer|exists:clientes,id',
            // 'id_usuario' => 'required|integer|exists:users,id',
        ]);
        $user = new User();
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->assignRole('Paciente');
        $user->save();
        

        $paciente = new Paciente();
        $paciente->nombre = $request->nombre;
        $paciente->apellidos = $request->apellidos;
        $paciente->dni = $request->dni;
        $paciente->fecha_nacimiento = $request->fecha_nacimiento;
        $paciente->email = $request->email;
        $paciente->id_cliente = $id_cliente;
        $paciente->id_usuario = $user->id;
        $paciente->save();
        return response()->json(['message' => 'Paciente creado con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'string|max:255',
            'apellidos' => 'string|max:255',
            'dni' => 'string|min:9|max:9',
            'fecha_nacimiento' => 'date',
        ]);

        $paciente = Paciente::findOrFail($id);
        if ($request->has('nombre')) {
            $paciente->nombre = $request->nombre;
        }
        if ($request->has('apellidos')) {
            $paciente->apellidos = $request->apellidos;
        }
        if ($request->has('dni')) {
            $paciente->dni = $request->dni;
        }
        if ($request->has('fecha_nacimiento')) {
            $paciente->fecha_nacimiento = $request->fecha_nacimiento;
        }
        $paciente->save();
        return response()->json(['message' => 'Paciente actualizado con éxito'], 200);
    }

    public function destroy($clienteId, $pacienteId)
    {

        $paciente = Paciente::findOrFail($pacienteId);
        $paciente->delete();
        return response()->json(['message' => 'Paciente eliminado con éxito'], 200);
    }

    public function index(){
        $pacientes = Paciente::all();
        return response()->json($pacientes, 200);
    }

    public function show($id){
        $paciente = Paciente::findOrFail($id);
        return response()->json($paciente, 200);
    }

    public function showAllPacientes(){
        $pacientes = Paciente::withTrashed()->get();
        return response()->json($pacientes, 200);
    }

    public function showTrashedPacientes(){
        $pacientes = Paciente::onlyTrashed()->get();
        return response()->json($pacientes, 200);
    }

    //listar los pacientes de un medico logueado
    public function pacientesByMedico(Request $request){
        $user = Auth::user();
        $medico = Medico::where('id', $user->id)->first();

        if (!$medico) {
            return response()->json(['message' => 'Médico no encontrado'], 404);
        }
        if( $medico->rol !== 'medico'){
            return response()->json(['error' => 'No autorizado'], 403);
        }
        $pacientes = Paciente::where('id_medico', medico)->get();
        return response()->json($pacientes, 200);
    }
}
