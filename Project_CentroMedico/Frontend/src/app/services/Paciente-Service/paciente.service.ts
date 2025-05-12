import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
    providedIn: 'root',
})
export class PacienteService {
    private apiUrl = 'http://localhost:8000/api/clientes';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getPacientesDelCliente(clienteId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${clienteId}/pacientes`, {
            headers: this.getAuthHeaders(),
        });
    }
}
