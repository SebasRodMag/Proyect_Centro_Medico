import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { MedicoService } from '../../../../../services/Medico-Service/medico.service';

@Component({
    selector: 'app-medicos',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        ModalCreateComponent,
    ],
    templateUrl: './medicos.component.html',
    styleUrls: ['./medicos.component.css'],
})
export class MedicosComponent implements OnInit {
    medicos: any[] = [];
    medicosDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'nombre',
        'dni',
        'fecha_inicio',
        'fecha_fin',
        'acciones',
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('modal') modal!: ModalCreateComponent;


    constructor(private medicoService: MedicoService) {}

    ngOnInit(): void {
        this.loadMedicos();
    }

    loadMedicos() {
        this.medicoService.getMedicos().subscribe({
            next: (data) => {
                this.medicos = data;
                this.medicosDataSource.data = this.medicos;
                this.medicosDataSource.paginator = this.paginator;
                this.medicosDataSource.sort = this.sort;
            },
            error: (err) => console.error('Error al obtener médicos', err),
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.medicosDataSource.filter = filterValue;
    }
}
