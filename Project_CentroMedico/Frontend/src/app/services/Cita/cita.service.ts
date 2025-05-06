import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl(medicoId: number): string {
    return `/api/medicos/${medicoId}/citas`; // Ajusta la URL base de tu API de Laravel
  }

  constructor(private http: HttpClient) {}

  getCitasPorMedico(medicoId: number, page: number = 1, pageSize: number = 10): Observable<Cita[]> {
    const params = new HttpParams()
      .set('pageSize', pageSize.toString());
    return this.http.get<Cita[]>(this.apiUrl(medicoId), { params });
  }

  getCitasPorDia(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas/dia/${fecha}`);
  }
}