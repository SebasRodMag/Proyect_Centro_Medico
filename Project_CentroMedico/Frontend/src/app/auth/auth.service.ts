import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  user: any; // Puedes crear una interfaz User si ya no la tienes
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);
  private authToken = new BehaviorSubject<string | null>(null);
  private currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    // Comprobar si hay un token en el localStorage al iniciar la aplicación
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.authToken.next(token);
      this.loggedIn.next(true);
      // Aquí podrías también intentar obtener la información del usuario si la guardaste
    }
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get token(): Observable<string | null> {
    return this.authToken.asObservable();
  }

  get user(): Observable<any> {
    return this.currentUser.asObservable();
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        this.authToken.next(response.token);
        this.currentUser.next(response.user);
        this.loggedIn.next(true);
        localStorage.setItem('auth_token', response.token);
        // Opcional: Guardar también la información del usuario en localStorage o sessionStorage
        return response;
      })
    );
  }

  logout(): void {
    // No es necesario hacer una petición al backend para invalidar el token con Sanctum en el frontend
    this.authToken.next(null);
    this.currentUser.next(null);
    this.loggedIn.next(false);
    localStorage.removeItem('auth_token');
    // Opcional: Eliminar también la información del usuario guardada
  }

  getToken(): string | null {
    return this.authToken.value;
  }
}