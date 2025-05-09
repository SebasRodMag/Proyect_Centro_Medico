import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Asegúrate de que la ruta sea correcta

export const MedicoGuard: CanActivateFn = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getRol() === 'Medico') {
    return true;
  } else {
    // Redirige a una página de acceso denegado o al login
    router.navigate(['/login']); // O la ruta que prefieras para usuarios no autorizados
    return false;
  }
};