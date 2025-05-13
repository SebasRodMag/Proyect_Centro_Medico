import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        const expectedRole = route.data['role'];
        const actualRole = this.authService.getRol();

        if (!this.authService.isLoggedIn() || actualRole !== expectedRole) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
}

