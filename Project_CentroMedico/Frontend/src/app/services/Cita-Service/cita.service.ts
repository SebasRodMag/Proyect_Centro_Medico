import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CitaResponse {
    total: number;
    data: Cita[];
}
interface Cita {
    id: number;
    fecha_hora_cita: string;
    paciente: { nombre: string; apellidos: string }; // Asumiendo que la API devuelve los datos del paciente anidados
    empresa: string; // Necesitarás incluir este campo en tu modelo/respuesta de Laravel
    estado: string; // Necesitarás incluir este campo en tu modelo/respuesta de Laravel
}

@Injectable({
    providedIn: 'root',
})
export class CitaService {
    private apiUrl = 'http://localhost:8000/api'; // La URL se completa dentro de cada método que necesite el medicoId

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token'); // ⚠️ Asegúrate que el token esté en localStorage
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getCitasPorMedico(
        medicoId: number,
        page: number = 1,
        pageSize: number = 10,
        fecha?: string
    ): Observable<CitaResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (fecha) {
            params = params.set('fecha', fecha);
        }

        const apiUrl = `${this.apiUrl}/medicos/${medicoId}/citas`;
        return this.http.get<CitaResponse>(apiUrl, { params, headers: this.getAuthHeaders() }, );
    }

    // Obtenemos todas las citas de un día
    getCitasPorDia(fecha: string): Observable<Cita[]> {
        return this.http.get<Cita[]>(`${this.apiUrl}/citas/dia/${fecha}`);
    }

    getCitas(): Observable<any>{
      return this.http.get(`${this.apiUrl}/citas`, {
        headers: this.getAuthHeaders(),
      });
    }
}
