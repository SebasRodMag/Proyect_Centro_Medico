import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
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
    private apiUrl = 'http://localhost:8000/api/auth'; //Según la ruta del backend que tengamos

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

                    console.log('Rol: ', res.user.rol);
                    console.log('Nombre: ', res.user.name);
                }),
                catchError((error) => {
                    console.error('Error en el login:', error);
                    return throwError(error);
                }),
                tap((res) => { 
                    // Redirigir al usuario según su rol después del tap
                    this.redirectUser(res.user.rol);
                })
            );
    }

    redirectUser(rol: string) {
        console.log('Función redirectUser llamada con rol:', rol);
        switch (rol) {
            case 'Administrador':
                this.router.navigate(['/admin/dashboard/home']).then(navigated => {
                    if (navigated) {
                        console.log('Navegación a /admin/dashboard/home exitosa');
                    } else {
                        console.error('Navegación a /admin/dashboard/home fallida');
                    }
                });
                break;
            case 'Medico':
                this.router.navigate(['/medico/dashboard/home']).then(navigated => {
                    if (navigated) {
                        console.log('Navegación a /medico/dashboard/home exitosa');
                    } else {
                        console.error('Navegación a /medico/dashboard/home fallida');
                    }
                });
                break;
            case 'Cliente':
                this.router.navigate(['/cliente/dashboard/home']).then(navigated => {
                    if (navigated) {
                        console.log('Navegación a /cliente/dashboard/home exitosa');
                    } else {
                        console.error('Navegación a /cliente/dashboard/home fallida');
                    }
                });
                break;
            case 'Paciente':
                this.router.navigate(['/paciente/dashboard/home']).then(navigated => {
                    if (navigated) {
                        console.log('Navegación a /paciente/dashboard/home exitosa');
                    } else {
                        console.error('Navegación a /paciente/dashboard/home fallida');
                    }
                });
                break;
            default:
                this.router.navigate(['/login']).then(navigated => {
                    if (navigated) {
                        console.log('Navegación a /login exitosa');
                    } else {
                        console.error('Navegación a /login fallida');
                    }
                });
                break;
        }
    }

    logout() {
        localStorage.clear();
        this.router.navigate(['/login']);
        console.log("Sesión cerrada");
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
