import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private citasUrl = 'http://localhost:8000/api/citas';
  constructor(private http: HttpClient) {}

  
}
