import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsuariosService {
    private usuariosUrl = 'http://localhost:8000/api/usuarios';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getUsuarios(): Observable<any[]> {
        return this.http.get<any[]>(this.usuariosUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    crearUsuario(userData: { email: string; password: string; rol: string; }): Observable<any> {
        return this.http.post<any>(this.usuariosUrl, userData, {
            headers: this.getAuthHeaders(), // Pass the headers here
        });
    }
}
