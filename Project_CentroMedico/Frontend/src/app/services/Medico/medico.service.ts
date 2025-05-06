import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Medico {
    nombre: string;
    apellidos: string;
}

@Injectable({
    providedIn: 'root',
})
export class MedicoService {
    private apiUrl = '/api/medicos/perfil'; // Ajusta la URL base de tu API de Laravel

    constructor(private http: HttpClient) {}

    getMedicoLogueado(): Observable<Medico> {
        return this.http.get<Medico>(`${this.apiUrl}/medicoLogueado`);
    }
}