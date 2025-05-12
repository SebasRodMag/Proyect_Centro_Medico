import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Medico {
    id: number;
    nombre: string;
    apellidos: string;
}

@Injectable({
    providedIn: 'root',
})
export class MedicoService {
    private apiUrl = 'http://localhost:8000/api/medicos';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token')
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        });
    }

    getMedicos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    getMedicoLogueado(): Observable<any> {
    return this.http.get<any>('http://localhost:8000/api/auth/me', {
        headers: this.getAuthHeaders(),
    });

    
}

}
