<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class AuthController extends Controller
{
    use HasApiTokens, HasRoles;
    public function login(Request $request)
    {
        $user = User::with(['Paciente', 'Cliente', 'Medico'])->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $rol = $user->getRoleNames()->first();

        // Asignar nombre según rol
        switch ($rol) {
            case 'Paciente':
                $name = $user->paciente?->nombre ?? 'Paciente sin nombre';
                break;
            case 'Cliente':
                $name = $user->cliente?->razon_social ?? 'Cliente sin nombre';
                break;
            case 'Medico':
                $name = $user->medico?->nombre ?? 'Médico sin nombre';
                break;
            case 'Administrador':
                $name = 'Administrador';
                break;
            default:
                $name = 'Nombre no disponible';
                break;
        }

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'deleted_at' => $user->deleted_at,
                'rol' => $rol,
                'name' => $name,
            ]
        ], 200);
    }

    public function logout()
    {
        Auth::user()->tokens->each(function ($token) {
            $token->delete();
        });

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me()
    {
        $user = Auth::user();

        return response()->json([
            'user' => $user,
        ]);
    }
}
