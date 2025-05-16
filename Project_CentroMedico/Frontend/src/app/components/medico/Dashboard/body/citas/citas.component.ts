import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-citas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
        NgbModule
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'nombre_paciente',
        'dni',
        'nombre_medico',
        'fecha',
        'hora',
        'estado',
        'observaciones',
        'acciones',
    ];

    fechaDesde: string = '';
    fechaHasta: string = '';
    citasOriginal: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private citaService: CitaService,
        private modalService: NgbModal
    ) { }

    ngOnInit(): void {
        this.getCitasDelMedicoLogueado();
        this.citasDataSource.filterPredicate = (data: any, filter: string) => {
            const nombreCompleto = (data.paciente?.nombre + ' ' + data.paciente?.apellidos).toLowerCase();
            const dni = data.paciente?.dni?.toLowerCase() || '';
            const medico = (data.medico?.nombre + ' ' + data.medico?.apellidos).toLowerCase();

            return (
                nombreCompleto.includes(filter) ||
                dni.includes(filter) ||
                medico.includes(filter)
            );
        };
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    getCitasDelMedicoLogueado(): void {
        this.citaService.getCitasDelMedico().subscribe((citas) => {
            this.citasOriginal = citas;
            this.citasDataSource.data = citas;
        });
    }

    filtrarPorFechas(): void {
        const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

        const citasFiltradas = this.citasOriginal.filter((cita: any) => {
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

    abrirModalEditar(cita: any): void {
    this.citaService.getHorariosDisponibles().subscribe({
        next: (horariosDisponibles) => {
            const modalRef = this.modalService.open(ModalEditComponent, { size: 'lg', centered: true, backdrop: 'static' });
            modalRef.componentInstance.citaSeleccionada = cita;
            modalRef.componentInstance.horariosDisponibles = horariosDisponibles;

            modalRef.result.then((resultado) => {
                if (resultado === 'guardado') {
                    this.getCitasDelMedicoLogueado();
                }
            }).catch(() => {});
        }
    });
}
}
