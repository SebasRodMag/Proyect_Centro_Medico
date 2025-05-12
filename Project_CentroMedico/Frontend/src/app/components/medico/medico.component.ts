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

<<<<<<< HEAD
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
=======
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
>>>>>>> 33eb940a9fc70feffbec75d7bac9e2adf9f7faf3
