import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AuthService } from '../../../../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { RefreshService } from '../../../../../services/Comunicacion/refresh.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-citas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
        DatePipe,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatIconModule
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit, OnDestroy {

    private destroy$ = new Subject<void>();
    private citaService = inject(CitaService);
    private refreshService = inject(RefreshService);
    private authService = inject(AuthService);
    private cdRef = inject(ChangeDetectorRef);
    private dialog = inject(MatDialog);

    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'nombre_paciente',
        'nombre_medico',
        'fecha',
        'hora',
        'estado',
        'observaciones',
        'acciones',
    ];

    loggedInUserId!: number;
    fechaDesde: string = '';
    fechaHasta: string = '';
    filtroBusqueda: string = '';
    puedeCrearCitas: boolean = true;
    puedeVerCitas: boolean = true;

    nowDate: Date = new Date();

    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
        if (mp) {
            this.citasDataSource.paginator = mp;
            this.cdRef.detectChanges();
        }
    }

    @ViewChild(MatSort) set matSort(ms: MatSort) {
        if (ms) {
            this.citasDataSource.sort = ms;
            this.cdRef.detectChanges();
        }
    }

    ngOnInit(): void {
        this.nowDate = new Date();

        this.authService.me().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response: { user: { id: number, rol_id: number } }) => {
                this.loggedInUserId = response.user.id;
                console.log('ID del usuario logueado (id_cliente):', this.loggedInUserId);
                this.cargarCitas();
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al obtener el ID del usuario:', err);
                Swal.fire('Error', 'No se pudo obtener la información del usuario. No se cargarán las citas.', 'error');
                this.citasDataSource.data = [];
                this.cdRef.detectChanges();
            }
        });

        this.refreshService.refreshCitas$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Señal de refresco recibida en CitasComponent. Recargando citas...');
                this.cargarCitas();
            });

        this.citasDataSource.filterPredicate = this.crearFiltroPersonalizado();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarCitas(): void {
        if (!this.loggedInUserId) {
            console.warn('ID de usuario logueado no disponible para cargar citas.');
            this.citasDataSource.data = [];
            this.cdRef.detectChanges();
            return;
        }

        this.citaService.getCitasPorId(this.loggedInUserId).subscribe({
            next: (response: { citas: any[] }) => {
                console.log('Respuesta cruda de la API de citas:', response);
                console.log('Citas recibidas:', response.citas);

                const citasConSearchString = response.citas.map(cita => {
                    return {
                        ...cita,
                        fecha_hora_cita_combinada: cita.fecha && cita.hora ? `${cita.fecha}T${cita.hora}` : null,
                        search_string: `${cita.id} ${cita.nombre_paciente || ''} ${cita.nombre_medico || ''} ${cita.observaciones || ''} ${cita.fecha || ''} ${cita.hora || ''} ${cita.estado || ''}`.toLowerCase()
                    };
                });

                this.citasDataSource.data = citasConSearchString;
                this.aplicarTodosLosFiltros();
                this.cdRef.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al cargar citas:', err);
                Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
                this.citasDataSource.data = [];
                this.cdRef.detectChanges();
            }
        });
    }

    aplicarTodosLosFiltros(): void {
        this.citasDataSource.filter = 'custom_filter_trigger';
        if (this.citasDataSource.paginator) {
            this.citasDataSource.paginator.firstPage();
        }
        this.cdRef.detectChanges();
    }

    crearFiltroPersonalizado(): (data: any, filter: string) => boolean {
        return (data: any, filter: string): boolean => {
            const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
            const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T23:59:59') : null;

            let fechaHoraForComparison: Date | null = null;
            if (data.fecha_hora_cita_combinada) {
                try {
                    fechaHoraForComparison = new Date(data.fecha_hora_cita_combinada);
                    if (isNaN(fechaHoraForComparison.getTime())) {
                        console.warn('Fecha de cita inválida (combinada):', data.fecha_hora_cita_combinada);
                        fechaHoraForComparison = null;
                    }
                } catch (e) {
                    console.error('Error parseando fecha (combinada):', data.fecha_hora_cita_combinada, e);
                    fechaHoraForComparison = null;
                }
            }

            let matchesDateRange = true;
            if (desde && fechaHoraForComparison && fechaHoraForComparison < desde) {
                matchesDateRange = false;
            }
            if (hasta && fechaHoraForComparison && fechaHoraForComparison > hasta) {
                matchesDateRange = false;
            }
            if (!fechaHoraForComparison && (desde || hasta)) {
                matchesDateRange = false;
            }

            const textFilter = this.filtroBusqueda.trim().toLowerCase();
            const matchesText = (data.search_string || '').includes(textFilter);

            return matchesDateRange && matchesText;
        };
    }

    isCitaActionable(cita: any): boolean {
        if (cita.estado !== 'pendiente') {
            return false;
        }

        if (!cita.fecha_hora_cita_combinada) {
            return false;
        }

        try {
            const citaDateTime = new Date(cita.fecha_hora_cita_combinada);

            if (isNaN(citaDateTime.getTime())) {
                console.warn('Fecha de cita inválida para isCitaActionable:', cita.fecha_hora_cita_combinada);
                return false;
            }

            return citaDateTime >= this.nowDate;

        } catch (e) {
            console.error('Error al verificar la capacidad de acción de la cita:', e);
            return false;
        }
    }


    abrirModalCreacion(): void {
        const dialogRef = this.dialog.open(ModalCreateComponent, {
            width: '600px',
            disableClose: true,
            data: { cita: null }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.cargarCitas();
            }
        });
    }

    modificaCita(cita: any): void {
        if (!this.isCitaActionable(cita)) {
            Swal.fire('No permitido', 'Solo puedes modificar citas pendientes y futuras.', 'info');
            return;
        }
        const dialogRef = this.dialog.open(ModalCreateComponent, {
            width: '600px',
            disableClose: true,
            data: { cita: { ...cita } }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.cargarCitas();
            }
        });
    }

    cancelarCita(cita: any): void {
        if (!this.isCitaActionable(cita)) {
            Swal.fire('No permitido', 'Solo puedes cancelar citas pendientes y futuras.', 'info');
            return;
        }

        Swal.fire({
            title: 'Cancelar cita',
            text: 'Va a cancelar la cita. Esto deja la cita disponible para otros usuarios',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cancelar cita',
            cancelButtonText: 'Abortar'
        }).then((result) => {
            if (result.isConfirmed) {
                const nuevoEstado = 'cancelado';
                this.citaService.cambiarEstadoCita(cita.id, { estado: nuevoEstado }).subscribe({
                    next: (response) => {
                        Swal.fire('¡Éxito!', 'La cita ha sido cancelada correctamente.', 'success');
                        this.cargarCitas();
                    },
                    error: (error) => {
                        console.error('Error al cancelar la cita:', error);
                        let errorMessage = 'Ha ocurrido un error al cancelar la cita.';
                        if (error.error && error.error.message) {
                            errorMessage = error.error.message;
                        } else if (error.error && error.error.error) {
                            errorMessage = error.error.error;
                        }
                        Swal.fire('Error', errorMessage, 'error');
                    }
                });
            }
        })
    }
}