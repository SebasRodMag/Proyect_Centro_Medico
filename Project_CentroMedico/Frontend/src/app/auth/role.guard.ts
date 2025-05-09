import { Injectable, inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Ajusta la ruta si es necesario

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expectedRole'] as string;

  if (authService.isLoggedIn() && authService.getRol() === expectedRole) {
    return true;
  } else {
    // Redirige a una página de acceso denegado o al login
    router.navigate(['/login']); // O una ruta de "acceso denegado"
    return false;
  }
};