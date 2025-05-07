import { Component, OnInit } from '@angular/core';
import { MedicoService } from '../../services/Medico/medico.service';
import { CitaService } from '../../services/Cita/cita.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
    this.obtenerMedicoLogueado();
  }

  obtenerMedicoLogueado(): void {
    this.medicoService.getMedicoLogueado().subscribe(
      (medico) => {
        this.medico = medico;
        this.medicoId = medico.id;
        this.obtenerCitasPaginadas(); // Carga inicial con la página 1 y sin fecha (todas las citas paginadas)
      },
      (error) => {
        console.error('Error al obtener el médico logueado:', error);
      }
    );
  }

  obtenerCitasPaginadas(pagina: number = this.paginaActual, fecha?: string): void {
    if (this.medicoId) {
      this.citaService.getCitasPorMedico(this.medicoId, pagina, this.citasPorPagina, fecha).subscribe(
        (response) => {
          this.citas = response.data;
          this.totalCitas = response.total;
          this.paginaActual = pagina; // Actualiza la página actual
        },
        (error) => {
          console.error('Error al obtener las citas:', error);
        }
      );
    }
  }

  cambiarPagina(pagina: number): void {
    this.obtenerCitasPaginadas(pagina);
  }

  avanzarDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() + 1);
    this.obtenerCitasPaginadas(1, this.formatearFecha(this.fechaActual)); // Resetear a la página 1 al cambiar de día
  }

  retrocederDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() - 1);
    this.obtenerCitasPaginadas(1, this.formatearFecha(this.fechaActual)); // Resetear a la página 1 al cambiar de día
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  obtenerNumeroPaginas(): number[] {
    const numeroPaginas = Math.ceil(this.totalCitas / this.citasPorPagina);
    return Array.from({ length: numeroPaginas }, (_, i) => i + 1);
  }
}