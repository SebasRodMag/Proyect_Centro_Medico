<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function store(Request $request){
        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
        return response()->json(['message' => 'Usuario registrado con éxito', 'user' => $user], 201);
    }


    public function assignRole(Request $request, $id){
        $user = User::findOrFail($id);
        $role = Role::where('name', $request->role)->first();
        if (!$role) {
            return response()->json(['message' => 'Rol no encontrado'], 404);
        }
        $user->assignRole($role);
        return response()->json(['message' => 'Rol asignado con éxito'], 200);
    }
    public function update(Request $request, $id){
        $request->validate([
            'email' => 'string|email|max:255|unique:users,email,'.$id,
            'password' => 'string|min:8|confirmed',
            'rol' => 'string|in:admin,medico,cliente,paciente',
        ]);
        $user = User::findOrFail($id);
        if($request->has('email')){
            $user->email = $request->email;
        }
        if($request->has('password')){
            $user->password = Hash::make($request->password);
        }    
        $user->save();
    
        return response()->json(['message' => 'Usuario actualizado con éxito'], 200);
    }
    

    // public function destroy($id){
    //     $user = User::findOrFail($id);
    //     $user->delete();

    //     return response()->json(['message' => 'Usuario eliminado con éxito'], 200);
    // }

    public function index(){
        $users = User::all();
        return response()->json($users, 200);
    }

    public function show($id){
        $user = User::findOrFail($id);
        return response()->json($user, 200);
    }

    //Función para mostrar todos los usuarios, incluyendo los eliminados
    public function showAllUsers(){
        $users = User::withTrashed()->get();
        return response()->json($users, 200);
    }

    //Función para mostrar los usuarios eliminados
    public function showTrashedUsers(){
        $trashedUsers = User::onlyTrashed()->get();
        return response()->json($trashedUsers, 200);
    }
}