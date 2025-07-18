import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContratoService {
    [x: string]: any;
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getContratoCliente(): Observable<any> {
        return this.http.get(`${this.apiUrl}/buscarcontrato/cliente`, {
            headers: this.getAuthHeaders(),
        });
    }
}
