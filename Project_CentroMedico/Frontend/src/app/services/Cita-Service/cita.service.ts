import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class CitaService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getCitasDelMedico(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/citas/usuario/listar`, {
            headers: this.getAuthHeaders(),
        });
    }

    getCitasDelUsuarioLogueado(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/citas/usuario/listar`, {
            headers: this.getAuthHeaders(),
        });
    }

    getCitasPorDia(fecha: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/citas/dia/${fecha}`, {
            headers: this.getAuthHeaders(),
        });
    }

    getHorasDisponibles(fecha: string, id_medico: number): Observable<any> {
        return this.http.get<any>(
            `${this.apiUrl}/medicos/${id_medico}/citas/${fecha}`,
            {
                headers: this.getAuthHeaders(),
            }
        );
    }

    getCitasPorPaciente(pacienteId: number): Observable<any> {
        return this.http
            .get<any>(
                `${this.apiUrl}/pacientes/${pacienteId}/citas`,
                {
                    headers: this.getAuthHeaders(),
                }
            )
            .pipe(
                tap((response) => {
                    console.log('Citas del paciente:', response);
                })
            );
    }

    getCitas(): Observable<any> {
        return this.http.get(`${this.apiUrl}/citas`, {
            headers: this.getAuthHeaders(),
        });
    }

    storeCita(cita: {
        id_paciente: number;
        id_medico: number;
        id_contrato: number;
        fecha_hora_cita: string;
        estado?: string;
        observaciones?: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/citas`, cita, {
            headers: this.getAuthHeaders(),
        });
    }

    getMedicoLogueado(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/me`, {
            headers: this.getAuthHeaders(),
        });
    }

    getCitasPorId($rol_id: any): Observable<any> {
        return this.http.get(`${this.apiUrl}/clientes/${$rol_id}/citas`, {
            headers: this.getAuthHeaders(),
        });
    }

    getHorariosDisponiblesParaHoy(): Observable<{
        horas_disponibles: string[];
    }> {
        return this.http.get<{ horas_disponibles: string[] }>(
            `${this.apiUrl}/citasdisponibles`,
            { headers: this.getAuthHeaders() }
        );
    }

    getHorariosDisponibles(id_medico: number, fecha: string): Observable<any> {
        return this.http.get<{ horas_disponibles: string[] }>(
            `${this.apiUrl}/horariosdisponibles/medico/${id_medico}/${fecha}`,
            { headers: this.getAuthHeaders() 
        });
    }

    actualizarCita(id: number, datos: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/citas/${id}`, datos, {
            headers: this.getAuthHeaders(),
        });
    }

    eliminarCita(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/citas/${id}`, {
            headers: this.getAuthHeaders(),
        });
    }

    cambiarEstadoCita(id: number, datos: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/citas/${id}/cancelar`, datos, {
            headers: this.getAuthHeaders(),
        });
    }
}