import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface User {
    user: any;
    id: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    rol: string;
    name: string;
}

interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8000/api/auth';

    // Estado de autenticación reactivo. Va a servir para que el header se actualice sin recargar la página
    private authState = new BehaviorSubject<boolean>(this.isLoggedIn());
    authState$ = this.authState.asObservable();

    constructor(private http: HttpClient, private router: Router) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }
    
    login(credentials: { email: string; password: string }): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap((res) => {
                    // Almacenar token y datos del usuario
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('rol', res.user.rol);
                    localStorage.setItem('name', res.user.name);
                    localStorage.setItem('id', res.user.id);

                    console.log('Rol:', res.user.rol);
                    console.log('Nombre:', res.user.name);

                    this.authState.next(true); // Notificar sesión iniciada para actualizar el header
                    this.redirectUser(res.user.rol); // Redirigir según rol
                }),
                catchError((error) => {
                    console.error('Error en el login:', error);
                    return throwError(error);
                }),
                tap((res) => { 
                    this.redirectUser(res.user.rol);
                })
            );
    }

    logout() {
        localStorage.clear();
        this.authState.next(false); // Notificar sesión cerrada para actualizar el header
        this.router.navigate(['/login']);
        console.log('Sesión cerrada');
    }

    redirectUser(rol: string) {
        console.log('Función redirectUser llamada con rol:', rol);
        let route = '';

        switch (rol) {
            case 'Administrador':
                route = '/admin/dashboard/home';
                break;
            case 'Medico':
                route = '/medico/dashboard/home';
                break;
            case 'Cliente':
                route = '/cliente/dashboard/home';
                break;
            case 'Paciente':
                route = '/paciente/dashboard/home';
                break;
            default:
                route = '/login';
                break;
        }

        this.router.navigate([route]).then(navigated => {
            if (navigated) {
                console.log(`Navegación a ${route} exitosa`);
            } else {
                console.error(`Navegación a ${route} fallida`);
            }
        });
    }

    getRol(): string {
        return localStorage.getItem('rol') || '';
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    me(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`,{
            headers: this.getAuthHeaders(),
        });
    }
}
