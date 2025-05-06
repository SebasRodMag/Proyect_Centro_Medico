import { Component, OnInit } from '@angular/core';
import { MedicoService } from '../../services/Medico/medico.service';
import { CitaService } from '../../services/Cita/cita.service';
import { CommonModule } from '@angular/common';

interface Medico {
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
  imports: [CommonModule],
  providers: [MedicoService, CitaService],
  templateUrl: './medico.component.html',
  styleUrls: ['./medico.component.css'],
})
export class MedicoComponent implements OnInit {
  medico: Medico | null = null;
  citas: Cita[] = [];
  paginaActual = 1;
  citasPorPagina = 10;
  //Obtener el total de citas desde la API
  totalCitas = 0;
  fechaActual: Date = new Date();
  medicoId = 1; // TODO: Obtener el ID del médico logueado dinámicamente

  constructor(private medicoService: MedicoService, private citaService: CitaService) {}

  ngOnInit(): void {
    this.obtenerMedicoLogueado();
    this.obtenerCitasPaginadas();
  }

  obtenerMedicoLogueado(): void {
    this.medicoService.getMedicoLogueado().subscribe(
      (medico) => {
        this.medico = medico;
      },
      (error) => {
        console.error('Error al obtener el médico logueado:', error);
      }
    );
  }

  obtenerCitasPaginadas(): void {
    this.citaService.getCitasPorMedico(this.medicoId, this.paginaActual, this.citasPorPagina).subscribe(
      (citas) => {
        this.citas = citas;
        // TODO: Obtener el total de citas desde la respuesta de la API
        // this.totalCitas = response.total;
      },
      (error) => {
        console.error('Error al obtener las citas:', error);
      }
    );
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.obtenerCitasPaginadas();
  }

  avanzarDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() + 1);
    this.obtenerCitasPorDia();
  }

  retrocederDia(): void {
    this.fechaActual.setDate(this.fechaActual.getDate() - 1);
    this.obtenerCitasPorDia();
  }

  obtenerCitasPorDia(): void {
    const fechaFormateada = this.formatearFecha(this.fechaActual);
    this.citaService.getCitasPorDia(fechaFormateada).subscribe(
      (citas) => {
        this.citas = citas;
        this.totalCitas = citas.length; // En este caso, el total es el número de citas del día
        this.paginaActual = 1; // Resetear la página al cambiar de día
      },
      (error) => {
        console.error('Error al obtener las citas por día:', error);
      }
    );
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