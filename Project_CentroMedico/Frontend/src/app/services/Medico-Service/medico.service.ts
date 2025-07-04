import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { data } from 'jquery';

interface Medico {
    id: number;
    nombre: string;
    apellidos: string;
}

@Injectable({
    providedIn: 'root',
})
export class MedicoService {
    private apiUrl = 'http://127.0.0.1:8000/api/medicos';

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getMedicos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, {
            headers: this.getAuthHeaders(),
        });
    }

    getAllMedicos():Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/todos`, {
            headers: this.getAuthHeaders(),
        });
    }

    getMedicoById(medicoId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${medicoId}`,{
            headers: this.getAuthHeaders(),
        });
    }

    createMedico(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}`, data, {
            headers: this.getAuthHeaders(),
        });
    }

    updateMedico(medicoId: number, medico: any ){
        return this.http.put(`${this.apiUrl}/${medicoId}`, medico, {
            headers: this.getAuthHeaders(),
        });
    }

    deleteMedico(medicoId: number): Observable<any>{
        return this.http.delete(`${this.apiUrl}/${medicoId}`, {
            headers: this.getAuthHeaders(),
        });
    }

    getMedicoLogueado(): Observable<any>{
        return this.http.post<Medico>(`${this.apiUrl}/perfil/yo`, {
            headers: this.getAuthHeaders(),
        });
    }
}