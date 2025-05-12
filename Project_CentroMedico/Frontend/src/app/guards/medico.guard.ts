import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class MedicoGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): boolean | UrlTree {
        const rol = this.authService.getRol();
        if (rol === 'Medico') {
            return true;
        } else {
            return this.router.parseUrl('/login');
        }
    }
}
