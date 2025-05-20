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
    //este método espera el idCliente
    getPacientesDelCliente(clienteId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${clienteId}/pacientes`, {
            headers: this.getAuthHeaders(),
        });
    }

    getPacientesPorCliente(): Observable<any[]>{
        return this.http.get<any[]>(`http://localhost:8000/api/listarpacientes/clientes`, {
            headers: this.getAuthHeaders(),
        });
    }

    createPaciente(pacienteData: any, clienteId: string): Observable<any>{
        return this.http.post<any>(`${this.apiUrl}/${clienteId}/pacientes`, pacienteData, {
            headers: this.getAuthHeaders(),
        })
    }

    //Obtener los pacientes para el medico logueado
    getPacientesDelMedicoLogueado(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}pacientes/medico/listar`, {
            headers: this.getAuthHeaders(),
        });
    }

    deletePaciente(clienteId:any,pacienteId: any): Observable<any>{
        return this.http.delete<any[]>(`${this.apiUrl}/${clienteId}/pacientes/${pacienteId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    updatePaciente( pacienteId: number, pacienteData: any) {
        return this.http.put(`${this.apiUrl}/pacientes/${pacienteId}`, pacienteData, {
            headers: this.getAuthHeaders(),
        });
    }
}
