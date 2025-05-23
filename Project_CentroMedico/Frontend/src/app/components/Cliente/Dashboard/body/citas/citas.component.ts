import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { RefreshService } from '../../../../../services/Comunicacion/refresh.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { AuthService } from '../../../../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-citas',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
        ModalCreateComponent,
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit, OnDestroy {

    private destroy$ = new Subject<void>();
    private citaService = inject(CitaService);
    private refreshService = inject(RefreshService);
    private authService = inject(AuthService)

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

    rol_id!: number;
    fechaDesde: string = '';
    fechaHasta: string = '';
    mostrarModal: boolean = false;
    modalVisible = false;
    filtroBusqueda: string = '';
    citaParaEditar: any | null = null; 

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    ngOnInit(): void {
        this.authService.me().subscribe({
            next: (response: { user: { rol_id: number } }) => {
                this.rol_id = response.user.rol_id;
                this.cargarCitasPorRol();
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al obtener el rol del usuario:', err);
                Swal.fire('Error', 'No se pudo obtener la información del usuario. Por favor, intente de nuevo.', 'error');
            }
        });

        this.refreshService.refreshCitas$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Señal de refresco recibida en CitasComponent. Recargando citas...');
                this.cargarCitasPorRol();
            });

        this.citasDataSource.filterPredicate = this.crearFiltroPersonalizado();
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    cargarCitasPorRol(): void {
        if (this.rol_id) {
            this.citaService.getCitasPorId(this.rol_id).subscribe({
                next: (response: { citas: any[] }) => {
                    console.log('Respuesta de la API de citas:', response);
                    const citasConSearchString = response.citas.map(cita => {
                        const fechaHoraCompletaStr = `${cita.fecha} ${cita.hora}`;
                        const fechaCitaForFilter = new Date(fechaHoraCompletaStr); //Para el filtro de rango de fechas
                        return {
                            ...cita,
                            search_string: `${cita.id} ${cita.nombre_paciente || ''} ${cita.nombre_medico || ''} ${cita.observaciones || ''} ${cita.fecha || ''} ${cita.hora || ''}`.toLowerCase()
                        };
                    });
                    this.citasDataSource.data = citasConSearchString;
                    this.aplicarTodosLosFiltros();
                    console.log('Citas cargadas con éxito para rol:', this.rol_id);
                },
                error: (err: HttpErrorResponse) => {
                    console.error('Error al cargar citas por rol:', err);
                    Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
                }
            });
        } else {
            console.warn('Rol de usuario no disponible para cargar citas.');
            this.citasDataSource.data = [];
            Swal.fire('Información', 'No se pudo determinar el rol del usuario para cargar las citas.', 'info');
        }
    }

    aplicarTodosLosFiltros(): void {
        this.citasDataSource.filter = 'custom_filter_trigger';
        if (this.citasDataSource.paginator) {
            this.citasDataSource.paginator.firstPage();
        }
    }

    crearFiltroPersonalizado(): (data: any, filter: string) => boolean {
        return (data: any, filter: string): boolean => {
            const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
            const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T23:59:59') : null;

            const fechaHoraForComparison = new Date(`${data.fecha} ${data.hora}`);

            let matchesDateRange = true;
            if (desde && fechaHoraForComparison < desde) {
                matchesDateRange = false;
            }
            if (hasta && fechaHoraForComparison > hasta) {
                matchesDateRange = false;
            }

            const textFilter = this.filtroBusqueda.trim().toLowerCase();
            const matchesText = data.search_string.includes(textFilter);

            return matchesDateRange && matchesText;
        };
    }

    abrirModalCreacion(): void {
        this.citaParaEditar = null; // Asegurarse de que no hay cita de edición
        this.modalVisible = true;
    }

    modificaCita(cita: any): void {
        if (cita.estado !== 'pendiente') {
            Swal.fire('No permitido', 'Solo puedes modificar citas pendientes.', 'info');
            console.log('Estado actual:', cita.estado);
            return;
        }
        this.citaParaEditar = { ...cita }; // Pasamos una copia de la cita
        this.modalVisible = true;
    }

    cerrarModalCita(): void {
        this.modalVisible = false;
        this.citaParaEditar = null; // Limpiar la cita de edición al cerrar
        this.cargarCitasPorRol(); // Recargar las citas para reflejar cualquier cambio
    }

    cancelarCita(cita: any): void {
        if (cita.estado !== 'pendiente') {
            Swal.fire('No permitido', 'Solo puedes cambiar el estado de citas pendientes.', 'info');
            console.log('Estado actual:', cita.estado);
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
                console.log(`Solicitando cambio de estado para cita ID ${cita.id} a:`, nuevoEstado);
                this.citaService.cambiarEstadoCita(cita.id, { estado: nuevoEstado }).subscribe({
                    next: (response) => {
                        Swal.fire('¡Éxito!', 'La cita ha sido cancelada correctamente.', 'success');
                        console.log('Respuesta del backend:', response);
                        // No necesitas 'cita.estado = nuevoEstado;' aquí porque 'cargarCitasPorRol()' lo actualizará
                        this.cargarCitasPorRol(); // Recargar las citas para reflejar el cambio
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