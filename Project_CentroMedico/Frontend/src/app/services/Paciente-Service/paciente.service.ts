import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class PacienteService {
    private apiUrl = '/api/clientes';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getAuthHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
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
        return this.http.get<any[]>(`${this.apiUrl}/listarpacientes`, {
            headers: this.getAuthHeaders(),
        });
    }

    createPaciente(pacienteData: any, id_cliente: string): Observable<any>{
        return this.http.post<any>(`${this.apiUrl}/${id_cliente}/pacientes`, pacienteData, {
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

    updatePaciente( Id: number, pacienteData: any) {
        return this.http.put(`${this.apiUrl}/pacientes/${Id}`, pacienteData, {
            headers: this.getAuthHeaders(),
        });
    }
}
