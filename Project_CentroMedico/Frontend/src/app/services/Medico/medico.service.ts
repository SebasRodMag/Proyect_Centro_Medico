import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    private apiUrlBase = '/api'; // URL base de la API de Laravel

    constructor(private http: HttpClient) {}

    getMedicoLogueado(): Observable<Medico> {
        return this.http.get<Medico>(`${this.apiUrlBase}/medicos/perfil`);
    }
}