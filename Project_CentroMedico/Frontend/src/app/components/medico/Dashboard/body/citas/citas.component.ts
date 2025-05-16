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
    mostrar: 'hoy' | 'mañana' = 'hoy'; // Declare the mostrar property
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

    @ViewChild(MatPaginator)
    paginator: MatPaginator = new MatPaginator();
    @ViewChild(MatSort)
    sort: MatSort = new MatSort();

    constructor(private citaService: CitaService) {}

    ngOnInit(): void {
        this.getCitas();
        console.log(this.citasDataSource.data)
    }

    //Constantes para la Paginación
    readonly PAGE_DEFAULT = 1;
    readonly PAGE_SIZE_DEFAULT = 10;

getCitas(): void {
    this.loading = true;

    this.citaService.getMedicoLogueado().subscribe({
        next: (medico) => {
            this.medicoId = medico.user.id;
            console.log('ID del médico logueado:', this.medicoId);

            this.cargarCitasMedico(this.medicoId);
        },
        error: (err) => {
            console.error('Error al obtener médico logueado:', err);
            this.loading = false;
        },
    });
}

private cargarCitasMedico(medicoId: number): void {
    this.citaService.getCitasPorMedico(
        medicoId,
        this.PAGE_DEFAULT,
        this.PAGE_SIZE_DEFAULT,
        this.mostrar // 'hoy' o 'mañana'
    ).subscribe({
        next: (respuesta) => {
            const citasObtenidas = (respuesta as any).citas ?? respuesta;
            this.citas = citasObtenidas.data ?? citasObtenidas;
            this.citasDataSource.data = [...this.citas];
            this.loading = false;

            console.log('Citas obtenidas:', this.citas);
        },
        error: (err) => {
            console.error('Error al cargar citas del médico:', err);
            this.loading = false;
        },
    });
}

    cambiarDia() {
        this.mostrar = this.mostrar === 'hoy' ? 'mañana' : 'hoy';
        this.getCitas();
    }

    ngAfterViewInit() {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }
}
