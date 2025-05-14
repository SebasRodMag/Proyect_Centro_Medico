import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
    selector: 'app-citas',
    standalone: true, // Si usas Standalone Component
    imports: [
        CommonModule,
        ModalCreateComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit {
    medicoId!: number; // Declare the medicoId property
    citas: any[] = []; // Declare the citas property
    loading: boolean = false; // Declare the loading property
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'contrato_id',
        'paciente',
        'cliente',
        'dni_paciente',
        'medico',
        'fecha',
        'hora',
        'estado',
        'acciones',
    ];

    @ViewChild(MatPaginator)
    paginator: MatPaginator = new MatPaginator();
    @ViewChild(MatSort)
    sort: MatSort = new MatSort();

    constructor(private citaService: CitaService) {}

    ngOnInit(): void {
        this.getCitas();
        console.log(this.citasDataSource.data)
    }

    getCitas() {
        this.loading = true;
        this.citaService.getMedicoLogueado().subscribe({
            next: (medico) => {
                this.medicoId = medico.user.id;
                console.log('LISTAR PACIENTES DE: ID del médico logueado:', this.medicoId);
                this.citaService.getCitasPorMedico(this.medicoId).subscribe({
                    next: (respuesta) => {
                        const citasObtenidas = (respuesta as any).citas ?? respuesta;
                        this.citas = citasObtenidas.data ?? citasObtenidas;
                        this.citasDataSource.data = this.citas;
                        this.loading = false;
                        console.log('Citas obtenidas:', this.citas);
                        console.log('Citas brutas recibidas:', this.citas);
                        console.log('Campos estado:', this.citas.map(c => c.estado));
                        this.citasDataSource.data = [...this.citas];
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

    ngAfterViewInit() {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }
}
