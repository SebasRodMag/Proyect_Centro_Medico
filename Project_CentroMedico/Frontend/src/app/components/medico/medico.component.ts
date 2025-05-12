import { Component, OnInit } from '@angular/core';
import { MedicoService } from '../../services/Medico-Service/medico.service';
import { CitaService } from '../../services/Cita-Service/cita.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Medico {
  id: number;
  nombre: string;
  apellidos: string;
}

interface Cita {
  id: number;
  fecha_hora_cita: string;
  paciente: { nombre: string; apellidos: string };
  empresa: string;
  estado: string;
}

interface CitasResponse {
  data: Cita[];
  total: number;
}

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [MedicoService, CitaService],
  templateUrl: './medico.component.html',
  styleUrls: ['./medico.component.css'],
})
export class MedicoComponent implements OnInit {
  medico: Medico | null = null;
  citas: Cita[] = [];
  paginaActual = 1;
  citasPorPagina = 10;
  totalCitas = 0;
  fechaActual: Date = new Date();
  medicoId: number | null = null;

  constructor(private medicoService: MedicoService, private citaService: CitaService) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // ngOnInit(): void {
  //   this.obtenerMedicoLogueado();
  // }

  // obtenerMedicoLogueado(): void {
  //   this.medicoService.getMedicoLogueado().subscribe({
  //     next: (medico) => {
  //       this.medico = medico;
  //       this.medicoId = medico.id;
  //       this.actualizarCitas(this.fechaActual); // Llamada inicial
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener el médico logueado:', error);
  //     },
  //   });
  // }

  // actualizarCitas(fecha?: Date, pagina: number = 1): void {
  //   if (this.medicoId) {
  //     const fechaStr = fecha ? this.formatearFecha(fecha) : undefined;

  //     this.citaService
  //       .getCitasPorMedico(this.medicoId, pagina, this.citasPorPagina, fechaStr)
  //       .subscribe({
  //         next: (response: CitasResponse) => {
  //           this.citas = response.data;
  //           this.totalCitas = response.total;
  //           this.paginaActual = pagina;
  //         },
  //         error: (error) => {
  //           console.error('Error al obtener las citas:', error);
  //         },
  //       });
  //   }
  // }

  
  // cambiarPagina(pagina: number): void {
  //   this.actualizarCitas(this.fechaActual, pagina);
  // }

  // avanzarDia(): void {
  //   const nuevaFecha = new Date(this.fechaActual);
  //   nuevaFecha.setDate(nuevaFecha.getDate() + 1);
  //   this.fechaActual = nuevaFecha;
  //   this.actualizarCitas(this.fechaActual, 1);
  // }

  // retrocederDia(): void {
  //   const nuevaFecha = new Date(this.fechaActual);
  //   nuevaFecha.setDate(nuevaFecha.getDate() - 1);
  //   this.fechaActual = nuevaFecha;
  //   this.actualizarCitas(this.fechaActual, 1);
  // }

  // formatearFecha(fecha: Date): string {
  //   const year = fecha.getFullYear();
  //   const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
  //   const day = fecha.getDate().toString().padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  // obtenerNumeroPaginas(): number[] {
  //   const numeroPaginas = Math.ceil(this.totalCitas / this.citasPorPagina);
  //   return Array.from({ length: numeroPaginas }, (_, i) => i + 1);
  // }
}