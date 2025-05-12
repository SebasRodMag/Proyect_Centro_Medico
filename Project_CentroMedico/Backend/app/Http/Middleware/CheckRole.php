<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
    public function handle($request, Closure $next, $roles)
    {
        $user = auth()->user();

        // Verifica el rol en la base de datos
        Log::debug('Roles disponibles: ' . $roles);
        Log::debug('Roles del usuario: ' . implode(',', $user->getRoleNames()));

        // Verifica si el rol está entre los roles permitidos
        if ($user && $user->hasAnyRole(explode(',', $roles))) {
            return $next($request);
        }

        // Si el rol no es uno de los permitidos, devuelve un error 403
        return response()->json(['message' => 'Acceso no autorizado para el rol: ' . implode(',', $user->getRoleNames())], 403);
    }

}