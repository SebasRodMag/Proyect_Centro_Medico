import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CitaService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getCitasPorMedico(
        medicoId: number,
        page: number = 1,
        pageSize: number = 10,
        mostrar: 'hoy' | 'mañana',
        fecha?: string
        ): Observable<Response> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString())
            .set('mostrar', mostrar);
            

        if (fecha) {
            params = params.set('fecha', fecha);
        }

        const apiUrl = `${this.apiUrl}/medicos/${medicoId}/citas`;
        return this.http.get<Response>(apiUrl, {
            params,
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
        return this.http.get<any>(
            `${this.apiUrl}/pacientes/${pacienteId}/citas`,
            {
                headers: this.getAuthHeaders(),
            }
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

    //obtener el medico logueado a traves de la función me de auth.service.ts
    getMedicoLogueado(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/me`, {
            headers: this.getAuthHeaders(),
        });
    }

    getCitasPorId($rol_id: any): Observable<any> {
        return this.http.get(`http://localhost:8000/api/clientes/${$rol_id}/citas`,{
            headers: this.getAuthHeaders(),
        });
    }
}
