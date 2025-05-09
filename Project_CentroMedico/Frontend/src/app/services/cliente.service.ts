import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPacientesDelCliente(clienteId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/clientes/${clienteId}/pacientes`);
  }
}
