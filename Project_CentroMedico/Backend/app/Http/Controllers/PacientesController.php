<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PacientesController extends Controller
{
    public function store(Request $request)
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
            'id_cliente' => 'required|integer|exists:clientes,id',
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
        $paciente->id_cliente = $request->id_cliente;
        $paciente->id_usuario = $user->id;
        return response()->json(['message' => 'Paciente creado con éxito'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'string|max:255',
            'apellidos' => 'string|max:255',
            'dni' => 'string|min:9|max:9',
            'fecha_nacimiento' => 'date',
            'email' => 'email|max:255|unique:pacientes,email,' . $id,
            // 'telefono' => 'string|max:15',
            // 'direccion' => 'string|max:255',
            'id_cliente' => 'integer|exists:clientes,id',
            'id_usuario' => 'integer|exists:users,id',
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
        if ($request->has('email')) {
            $paciente->email = $request->email;
        }
        if ($request->has('id_cliente')) {
            $paciente->id_cliente = $request->id_cliente;
        }
        if ($request->has('id_usuario')) {
            $paciente->id_usuario = $request->id_usuario;
        }
        $paciente->save();
        return response()->json(['message' => 'Paciente actualizado con éxito'], 200);
    }

    // public function destroy($id)
    // {
    //     $paciente = Paciente::findOrFail($id);
    //     $paciente->delete();
    //     return response()->json(['message' => 'Paciente eliminado con éxito'], 200);
    // }

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

    // Función para mostrar los datos del paciente logueado
    public function datosPacienteLogueado(Request $request)
    {
        $paciente = Paciente::where('id_usuario', $request->user()->id)->first();
        if ($paciente) {
            return response()->json($paciente, 200);
        } else {
            return response()->json(['message' => 'Paciente no encontrado'], 404);
        }
    }

    //Función para mostrar las citas del paciente logueado
    public function citasPacienteLogueado(Request $request)
    {
        $paciente = Paciente::where('id_usuario', $request->user()->id)->first();
        if ($paciente) {
            $citas = $paciente->citas()->get();
            return response()->json($citas, 200);
        } else {
            return response()->json(['message' => 'Paciente no encontrado'], 404);
        }
    }
}
