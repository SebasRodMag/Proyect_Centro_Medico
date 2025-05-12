<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = new User();
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Usuario creado con éxito'], 201);
    }

    public function assign(Request $request, $id)
{
    $user = User::findOrFail($id);

    // Verificar si el rol existe con el guard adecuado
    $rol = Role::findByName($request->rol, 'sanctum');//Es necesario que sea sanctum ya que la API está protegida por Sanctum

    if (!$rol) {
        return response()->json(['message' => 'El rol no existe.'], 404);
    }

    // Asignar el rol al usuario con el guard adecuado
    $user->assignRole($rol->name); // El guard se usará automáticamente desde el rol

    $user->save();

    return response()->json(['message' => 'Rol asignado con éxito'], 200);
}


    public function update(Request $request, $id)
    {
        $request->validate([
            'email' => 'string|email|max:255|unique:users,email,' . $id,
            'password' => 'string|min:8|confirmed', //Habrá que crear dos inputs, uno para la contraseña y otro para la confirmación de la misma
        ]);

        $user = User::findOrFail($id);
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('rol')) {
            $user->rol = $request->rol;
        }
        $user->save();

        return response()->json(['message' => 'Usuario actualizado con éxito'], 200);
    }

    // public function destroy($id){
    //     $user = User::findOrFail($id);
    //     $user->delete();

    //     return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
    // }

    public function index()
    {
        $users = User::all();
        $users = User::with('roles')->get();
        return response()->json($users, 200);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    //Función para mostrar todos los usuarios, incluyendo los eliminados
    public function showAllUsers()
    {
        $users = User::withTrashed()->get();
        return response()->json($users, 200);
    }

    //Función para mostrar los usuarios eliminados
    public function showTrashedUsers()
    {
        $trashedUsers = User::onlyTrashed()->get();
        return response()->json($trashedUsers, 200);
    }
}
