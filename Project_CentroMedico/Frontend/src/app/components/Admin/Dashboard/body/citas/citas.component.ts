import { Component, OnInit, ViewChild } from '@angular/core';
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
        'acciones',
    ];

    @ViewChild(MatPaginator)
    paginator: MatPaginator = new MatPaginator();
    @ViewChild(MatSort)
    sort: MatSort = new MatSort();

    constructor(private citaService: CitaService) {}

    ngOnInit(): void {
        this.getCitas();
    }

    getCitas() {
        this.citaService.getCitas().subscribe(
            (data) => {
                console.log('Citas: ', data);
                this.citasDataSource.data = data.citas;
                this.citasDataSource.paginator = this.paginator;
                this.citasDataSource.sort = this.sort;
            },
            (error) => console.error('Error al obtener las citas', error)
        );
    }
}
