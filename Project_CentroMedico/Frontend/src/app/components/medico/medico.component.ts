import { Component, OnInit } from '@angular/core';
import { CitaService } from '../../services/Cita-Service/cita.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  imports: [CommonModule],
})
export class MedicoComponent implements OnInit {
  citas: any[] = [];

  constructor(
    private citaService: CitaService,
  ) {}

  ngOnInit(): void {
    this.verCitasHoy();
  }

  verCitasHoy(): void {
    const hoy = new Date();
    this.obtenerCitasPorFecha(hoy);
  }

  verCitasManana(): void {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.obtenerCitasPorFecha(manana);
  }

  obtenerCitasPorFecha(fecha: Date): void {
    const fechaStr = fecha.toISOString().split('T')[0]; // yyyy-mm-dd
    this.citaService.getCitasPorFecha(fechaStr).subscribe({
      next: (data) => this.citas = data,
      error: (err) => console.error('Error al obtener citas:', err)
    });
  }
}
