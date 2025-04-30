<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role  // El rol que se espera para acceder a la ruta
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Verificar si el usuario está autenticado
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado.'], 401); // Unauthorized
        }

        // 2. Obtener el rol del usuario autenticado
        $user = Auth::user();
        Log::debug('Rol del usuario autenticado:', ['role' => $user->role]);
        // 3. Verificar si el rol del usuario coincide con el rol esperado
        if ($user->role === $role) {
            Log::debug('Rol del usuario autenticado:', ['role' => $user->role]);
            return $next($request); // Permitir el acceso
        }

        // 4. Si el rol no coincide, denegar el acceso
        return response()->json(['message' => 'Acceso no autorizado para el rol: ' . $user->role], 403); // Forbidden
    }
}