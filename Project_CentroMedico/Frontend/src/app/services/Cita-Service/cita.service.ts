import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

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

// Elimina este método o implementa correctamente la lógica para obtener las citas del médico.
// Si necesitas obtener las citas del médico, crea un método que haga una petición HTTP similar a los otros métodos.
// Por ejemplo:
getCitasDelMedico(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/medicos/medico/citas`, {
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
            //mostrar un console.log para ver si se obtiene la respuesta correcta
        ).pipe(
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

    getHorariosDisponibles(): Observable<string[]> {
        return this.http.get<string[]>(
            `${this.apiUrl}/citasdisponibles`,
            { headers: this.getAuthHeaders() }
        );
    }

    actualizarCita(id: number, datos: any): Observable<any> {
        return this.http.put(`${this.apiUrl}citas/${id}`, datos, {
            headers: this.getAuthHeaders(),
        });
    }
}

