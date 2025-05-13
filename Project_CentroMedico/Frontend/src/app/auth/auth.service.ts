import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface User {
    id: number;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    rol: string; // Este es el rol que obtienes de la respuesta
    name: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8000/api/auth'; // Ajusta según tu backend

    constructor(private http: HttpClient, private router: Router) {}

    login(credentials: {
        email: string;
        password: string;
    }): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap((res) => {
                    // Almacenar token y rol en localStorage
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('rol', res.user.rol);
                    localStorage.setItem('name', res.user.name);

                    // Redirigir al usuario según su rol
                    this.redirectUser(res.user.rol);
                })
            );
    }

    redirectUser(rol: string) {
        switch (rol) {
            case 'Administrador':
                this.router.navigate(['/admin/dashboard/home']);
                break;
            case 'Medico':
                this.router.navigate(['/medicos/dashboard/home']);
                break;
            case 'Cliente':
                this.router.navigate(['/cliente/dashboard/home']);
                break;
            default:
                this.router.navigate(['/login']);
                break;
        }
    }

    logout() {
        localStorage.clear();
        this.router.navigate(['/login']);
    }

    getRol(): string {
        return localStorage.getItem('rol') || '';
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token'); // Verifica si el token existe
    }

    // Método para obtener el token de sesión o JWT
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    me(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(tap((user) => {}));
    }
}
