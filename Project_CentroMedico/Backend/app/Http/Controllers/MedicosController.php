<?php

namespace App\Http\Controllers;

use App\Models\Medico;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Illuminate\Http\JsonResponse;

class MedicosController extends Controller
{
    /**
     * Se crea un nuevo médico, para lo cual primero crea un nuevo usuario en la tabla User del que coge el nuevo id
     * para asociarlo al médico en la tabla Medico.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * 
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'apellidos' => 'required|string|max:255',
                'dni' => 'required|string|min:9|max:9|unique:medicos,dni',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|string|min:8|max:255',
            ], [
                //Mensaje de error para cada campo
                'dni.unique' => 'Ya existe un médico con este DNI.',
                'email.unique' => 'Este correo electrónico ya está registrado por otro usuario.',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            ]);

            //Se crea el nuevo usuario
            $user = new User();
            $user->email = $validatedData['email'];
            $user->password = Hash::make($validatedData['password']);
            $user->save();


            $role = Role::where('name', 'Medico')->first();
            if ($role) {
                $user->assignRole($role);
            } else {
                \Log::warning('Rol "Medico" no encontrado. Asegurarse de que el rol está creado.');
            }

            $medico = new Medico();
            $medico->id_usuario = $user->id;
            $medico->nombre = $validatedData['nombre'];
            $medico->apellidos = $validatedData['apellidos'];
            $medico->dni = $validatedData['dni'];
            $medico->fecha_inicio = now();
            $medico->fecha_fin = null;

            $medico->save();

            return response()->json(['message' => 'Médico creado con éxito'], 201);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Error de validación','errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear el médico','error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'string|max:255',
            'apellidos' => 'string|max:255',
            'dni' => 'string|min:9|max:9',
            'fecha_fin' => 'date|nullable',
        ]);

        $medico = Medico::findOrFail($id);
        if ($request->has('nombre')) {
            $medico->nombre = $request->nombre;
        }
        if ($request->has('apellidos')) {
            $medico->apellidos = $request->apellidos;
        }
        if ($request->has('dni')) {
            $medico->dni = $request->dni;
        }
        if ($request->has('fecha_fin')) {
            $medico->fecha_fin = $request->fecha_fin;
            $fechaFin = Carbon::parse($request->fecha_fin);
            $fechaHoy = Carbon::today();
            if($fechaFin->lt($fechaHoy)){
                $medico->delete();
            }
        }
        $medico->save();

        return response()->json(['message' => 'Médico actualizado con éxito'], 200);
    }

    public function destroy($id)
    {
        $medico = Medico::findOrFail($id);
        $medico->delete();
        return response()->json(['message' => 'Médico eliminado con éxito'], 200);
    }
    public function index()
    {
        $medicos = Medico::all();
        return response()->json($medicos, 200);
    }
    public function show($id)
    {
        $medico = Medico::findOrFail($id);
        return response()->json($medico, 200);
    }

    public function showAllMedicosInclusoEliminados()
    {
        $medicos = Medico::withTrashed()->get();
        return response()->json($medicos, 200);
    }

    public function showTrashedMedicos()
    {
        $medicos = Medico::onlyTrashed()->get();
        return response()->json($medicos, 200);
    }

    public function showAllMedicos()
    {
        $medicos = Medico::all();
        return response()->json($medicos, 200);
    }

    /**
     * Método para obtener el médico autenticado
     * @return JsonResponse
     * Devuelve el nombre y el apellido del médico autenticado
     * @throws \Illuminate\Auth\AuthenticationException
     */
    //Función para devolver el medico logueado
    public function medicoLogueado(Request $request)
    {
        $user = Auth::user();
        $medico = Medico::where('id', $user->id)->first();

        if (!$medico) {
            return response()->json(['message' => 'Médico no encontrado'], 404);
        }

        return response()->json([
            'nombre' => $medico->nombre,
            'apellidos' => $medico->apellidos,
            'dni' => $medico->dni,
            'email' => $user->email,
            'id' => $medico->id,
        ], 200);
    }
}
