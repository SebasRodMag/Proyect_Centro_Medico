import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClienteService {
    private apiUrl = 'http://localhost:8000/api/clientes';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token'); // ⚠️ Asegúrate que el token esté en localStorage
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getClientes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    getPacientesDelCliente(clienteId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${clienteId}/pacientes`, {
            headers: this.getAuthHeaders(),
        });
    }

    getContratosDelCLiente(id_cliente: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id_cliente}/contratos`, {
            headers: this.getAuthHeaders(),
        });
    }

    getContratoVigente(clienteId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${clienteId}/contratos/contrato-vigente`, {
            headers: this.getAuthHeaders(),
        });
    }
    
    getReconocimientosRestantes(clienteId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${clienteId}/contratos/contrato-vigente/reconocimientos-restantes`, {
            headers: this.getAuthHeaders(),
        });
    }

    getContratos(clienteId: string): Observable<any>{
        return this.http.get(`${this.apiUrl}/${clienteId}/contratos`, {
            headers: this.getAuthHeaders(),
        });
    }

    getPacientesPorCif(cif: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${cif}/pacientes`, {
            headers: this.getAuthHeaders(),
        });
    }
}