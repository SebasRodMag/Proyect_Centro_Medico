import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  private apiUrlBase = '/api'; // La URL se completa dentro de cada método que necesite el medicoId

  constructor(private http: HttpClient) { }

  getCitasPorMedico(medicoId: number, page: number = 1, pageSize: number = 10, fecha?: string): Observable<CitaResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (fecha) {
      params = params.set('fecha', fecha);
    }

    const apiUrl = `${this.apiUrlBase}/medicos/${medicoId}/citas`;
    return this.http.get<CitaResponse>(apiUrl, { params });
  }

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