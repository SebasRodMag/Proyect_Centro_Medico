import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-citas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    medicoId!: number;
    citas: any[] = [];
    loading: boolean = false;
    fechaDesde: string = '';
    fechaHasta: string = '';
    mostrar: 'hoy' | 'mañana' | 'todo' = 'hoy';
    citasDataSource = new MatTableDataSource<any>();

    displayedColumns: string[] = [
        'id',
        'id_contrato',
        'medico',
        'cliente',
        'paciente',
        'fecha',
        'hora',
        'estado',
        'acciones',
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private citaService: CitaService) {}

    ngOnInit(): void {
        this.setFechasSegunMostrar();
        this.getCitas();
    }

    ngAfterViewInit() {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    getCitas(): void {
        this.loading = true;

        this.citaService.getMedicoLogueado().subscribe({
            next: (medico) => {
                this.medicoId = medico.user.id;
                this.citaService.getCitasPorMedico(this.medicoId).subscribe({
                    next: (respuesta) => {
                        const citasObtenidas =
                            (respuesta as any).citas ?? respuesta;
                        this.citas = citasObtenidas.data ?? citasObtenidas;
                        this.citasDataSource.data = [...this.citas];
                        this.filtrarPorFechas(); // Aplica filtro local
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error al cargar citas del médico:', err);
                        this.loading = false;
                    },
                });
            },
            error: (err) => {
                console.error('Error al obtener médico logueado:', err);
                this.loading = false;
            },
        });
    }

    setFechasSegunMostrar(): void {
        const hoy = new Date();
        const mañana = new Date();
        mañana.setDate(hoy.getDate() + 1);

        function formatDate(date: Date): string {
            return date.toISOString().split('T')[0];
        }

        if (this.mostrar === 'hoy') {
            this.fechaDesde = formatDate(hoy);
            this.fechaHasta = formatDate(hoy);
        } else if (this.mostrar === 'mañana') {
            this.fechaDesde = formatDate(mañana);
            this.fechaHasta = formatDate(mañana);
        } else {
            this.fechaDesde = '';
            this.fechaHasta = '';
        }
    }

    filtrarPorFechas(): void {
        const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

        this.citasDataSource.filterPredicate = (data: any, filter: string) => {
            const fechaCita = new Date(data.fecha);
            const cumpleDesde = !desde || fechaCita >= desde;
            const cumpleHasta = !hasta || fechaCita <= hasta;
            return cumpleDesde && cumpleHasta;
        };

        this.citasDataSource.filter = '' + Math.random();
    }

    cambiarDia(): void {
        this.mostrar =
            this.mostrar === 'hoy'
                ? 'mañana'
                : this.mostrar === 'mañana'
                ? 'todo'
                : 'hoy';

        this.setFechasSegunMostrar();
        this.filtrarPorFechas();
    }

    esFechaHoy(fecha: string): boolean {
        const fechaCita = new Date(fecha);
        const hoy = new Date();
        return (
            fechaCita.getFullYear() === hoy.getFullYear() &&
            fechaCita.getMonth() === hoy.getMonth() &&
            fechaCita.getDate() === hoy.getDate()
        );
    }
}

