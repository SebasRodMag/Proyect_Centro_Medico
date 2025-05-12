import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
<<<<<<< HEAD
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
=======
>>>>>>> 33eb940a9fc70feffbec75d7bac9e2adf9f7faf3

@Injectable({
    providedIn: 'root',
})
export class CitaService {
    private apiUrl = 'http://localhost:8000/api';

<<<<<<< HEAD
  constructor(private http: HttpClient) { }
=======
    constructor(private http: HttpClient) {}
>>>>>>> 33eb940a9fc70feffbec75d7bac9e2adf9f7faf3

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
        fecha?: string
    ): Observable<Response> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

<<<<<<< HEAD
  // Obtenemos todas las citas de un día para el médico logueado
  getCitasPorDia(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrlBase}/citas/dia`, {
      params: { fecha }
    });


  }
  getCitasPorFecha(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/citas?fecha=${fecha}`);
  }
}
=======
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

    // getCitasPorPaciente(pacienteId: number): Observable<any> {
    //     return this.http.get<any>(
    //         `${this.apiUrl}/pacientes/${pacienteId}/citas`,
    //         {
    //             headers: this.getAuthHeaders(),
    //         }
    //     );
    // }

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
}
>>>>>>> 33eb940a9fc70feffbec75d7bac9e2adf9f7faf3
