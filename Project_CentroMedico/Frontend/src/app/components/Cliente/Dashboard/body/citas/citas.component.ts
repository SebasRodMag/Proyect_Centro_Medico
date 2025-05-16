import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { AuthService } from '../../../../../auth/auth.service';

@Component({
    selector: 'app-citas',
    standalone: true,
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
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'id_paciente',
        'id_medico',
        'id_contrato',
        'fecha_hora_cita',
        'estado',
        'observaciones',
        'acciones'
    ];

    rol_id!: number;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private citaService: CitaService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.authService
            .me()
            .subscribe((response: { user: { rol_id: number } }) => {
                this.rol_id = response.user.rol_id;
                this.getCitasPorIdRol(this.rol_id);
            });
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    getCitasPorIdRol(rol_id: number): void {
        this.citaService.getCitasPorId(rol_id).subscribe((response) => {
            this.citasDataSource.data = response.citas;
        });
    }
}
