import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClienteService {
    [x: string]: any;
    private apiUrl = 'http://localhost:8000/api/clientes';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getClientes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    getPacientesDelCliente(id_cliente: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id_cliente}/pacientes`, {
            headers: this.getAuthHeaders(),
        });
    }

    getContratosDelCLiente(id_cliente: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id_cliente}/contratos`, {
            headers: this.getAuthHeaders(),
        });
    }

    getContratoVigente(clienteId: string): Observable<any> {
        return this.http.get(
            `${this.apiUrl}/${clienteId}/contratos/contrato-vigente`,
            {
                headers: this.getAuthHeaders(),
            }
        );
    }

    getContratos(clienteId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${clienteId}/contratos`, {
            headers: this.getAuthHeaders(),
        });
    }

    getPacientesPorCif(cif: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/pacientes/cif/${cif}`, {
            headers: this.getAuthHeaders(),
        });
    }

    createCliente(cliente: any): Observable<any> {
        return this.http.post(this.apiUrl, cliente, {
            headers: this.getAuthHeaders(),
        });
    }

    deleteCliente(clienteId: number) {
        return this.http.delete(`${this.apiUrl}/${clienteId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    updateCliente(id: number, datos: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, datos,
            {
                headers: this.getAuthHeaders(),
            }
        );
    }
}
