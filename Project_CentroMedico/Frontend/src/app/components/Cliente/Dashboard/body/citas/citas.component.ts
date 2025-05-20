import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { AuthService } from '../../../../../auth/auth.service';
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
        ModalCreateComponent
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'nombre_paciente',
        'nombre_medico',
        'fecha',
        'hora',
        'observaciones',
        'acciones',
    ];

    rol_id!: number;
    fechaDesde: string = '';
    fechaHasta: string = '';
    mostrarModal: boolean = false;
    modalVisible = false;

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

    filtrarPorFechas(): void {
        //se definen de esta forma para que no presente errores al comparar las fechas no haya diferencias por horas
        const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T23:59:59') : null;

        const citasFiltradas = this.citasDataSource.data.filter((cita: any) => {
            const fechaCita = new Date(cita.fecha_hora_cita);
            if (desde && fechaCita < desde) return false;
            if (hasta && fechaCita > hasta) return false;
            return true;
        });

        this.citasDataSource.data = citasFiltradas;
    }

    aplicarFiltro(event: Event): void {
        const filtroValor = (event.target as HTMLInputElement).value;
        this.citasDataSource.filter = filtroValor.trim().toLowerCase();
    }
    abrirModal() {
        this.modalVisible = true;
    }
}
