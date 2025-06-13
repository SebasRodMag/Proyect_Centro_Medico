import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { PacienteService } from '../../../../../services/Paciente-Service/paciente.service';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../../auth/auth.service';
import { RefreshService } from '../../../../../services/Comunicacion/refresh.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-pacientes',
    standalone: true,
    templateUrl: './pacientes.component.html',
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule
    ],
    styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit, AfterViewInit, OnDestroy {
    pacientes: any[] = [];
    clienteId!: string;
    clienteNombre: string = '';
    rol_id!: string;

    displayedColumns = [
        'id',
        'nombreCompleto',
        'dni',
        'email',
        'fechaNacimiento',
        'acciones',
    ];

    pacientesDataSource = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private destroy$ = new Subject<void>();

    fechaDesde: string = '';
    fechaHasta: string = '';
    filtroBusqueda: string = '';

    constructor(
        private clienteService: ClienteService,
        private pacienteService: PacienteService,
        private route: ActivatedRoute,
        private authService: AuthService,
        private refreshService: RefreshService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.authService
            .me()
            .pipe(takeUntil(this.destroy$))
            .subscribe((response: { user: { rol_id: string, cliente_id?: string } }) => {
                this.rol_id = response.user.rol_id;
                let idParaGetPacientes: string;
                if (response.user.cliente_id) {
                    idParaGetPacientes = response.user.cliente_id;
                    this.clienteId = response.user.cliente_id;
                } else {
                    idParaGetPacientes = this.rol_id;
                    this.clienteId = this.rol_id;
                }
                this.getPacientes(idParaGetPacientes);
            }, error => {
                console.error('Error al obtener datos de usuario (authService.me()):', error);
                Swal.fire('Error', 'No se pudo obtener la información de su cuenta.', 'error');
            });

        this.refreshService.refreshPacientes$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Evento de refresco de pacientes recibido. Recargando tabla...');
                if (this.clienteId) {
                    this.getPacientes(this.clienteId);
                } else {
                    console.warn('clienteId no disponible para recargar pacientes.');
                }
            });
    }

    ngAfterViewInit(): void {
        this.pacientesDataSource.paginator = this.paginator;
        this.pacientesDataSource.sort = this.sort;

        this.pacientesDataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'nombreCompleto': return item.apellidos + item.nombre;
                default: return (item as any)[property];
            }
        };

        this.pacientesDataSource.filterPredicate = this.createFilterPredicate();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getPacientes(idParam: string): void {
        if (!idParam) {
            console.warn('ID de cliente no disponible para cargar pacientes.');
            return;
        }
        this.pacienteService.getPacientesPorCliente().subscribe(
            (data: any) => {
                if (Array.isArray(data)) {
                    this.pacientes = data;
                } else if (data && typeof data === 'object' && data.message) {
                    console.warn('API respondió con un mensaje:', data.message);
                    this.pacientes = [];
                } else {
                    console.error('Formato de respuesta inesperado de la API de pacientes:', data);
                    this.pacientes = [];
                }
                this.pacientesDataSource.data = this.pacientes;
                this.aplicarTodosLosFiltros();
            },
            (error: any) => {
                console.error('Error al obtener los pacientes:', error);
                if (error.status === 200 && error.error && error.error.message && error.error.message.includes('No se encontraron pacientes')) {
                    console.warn('Backend indicó que no se encontraron pacientes para este cliente.');
                    this.pacientes = [];
                    this.pacientesDataSource.data = [];
                } else {
                    Swal.fire('Error', 'No se pudieron cargar los pacientes. Por favor, inténtelo de nuevo más tarde.', 'error');
                }
            }
        );
    }

    openCreatePacienteModal(): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '600px',
            disableClose: true,
            data: { paciente: null }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getPacientes(this.clienteId);
            }
        });
    }

    openEditPacienteModal(paciente: any): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '600px',
            disableClose: true,
            data: { paciente: { ...paciente } }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getPacientes(this.clienteId);
            }
        });
    }


    aplicarTodosLosFiltros(): void {
        this.pacientesDataSource.filter = 'trigger_filter_update';

        if (this.pacientesDataSource.paginator) {
            this.pacientesDataSource.paginator.firstPage();
        }
    }

    private createFilterPredicate(): (data: any, filter: string) => boolean {
        return (data: any, filter: string): boolean => {
            const fechaNacimientoPaciente = this.formatearFecha(data.fecha_nacimiento);
            const cumpleFechaDesde = !this.fechaDesde || fechaNacimientoPaciente >= this.fechaDesde;
            const cumpleFechaHasta = !this.fechaHasta || fechaNacimientoPaciente <= this.fechaHasta;

            const searchTerms = this.filtroBusqueda.toLowerCase().trim();
            const dataStr = (
                data.nombre + ' ' +
                data.apellidos + ' ' +
                data.dni + ' ' +
                data.email + ' ' +
                fechaNacimientoPaciente
            ).toLowerCase();

            const includesSearch = !searchTerms || dataStr.includes(searchTerms);

            return cumpleFechaDesde && cumpleFechaHasta && includesSearch;
        };
    }

    private formatearFecha(fechaStr: string): string {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        const yyyy = fecha.getFullYear();
        const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dd = fecha.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    eliminarPaciente(pacienteId: number) {
        if (!this.clienteId) {
            Swal.fire('Error', 'No se pudo obtener el ID del cliente para realizar la eliminación.', 'error');
            console.error('Error: clienteId no está definido al intentar eliminar paciente.');
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto! El paciente se eliminará de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.pacienteService.deletePaciente(this.clienteId, pacienteId).subscribe({
                    next: () => {
                        Swal.fire(
                            '¡Eliminado!',
                            'El paciente ha sido eliminado correctamente.',
                            'success'
                        );
                        this.getPacientes(this.clienteId);
                    },
                    error: (err) => {
                        console.error('Error al eliminar paciente:', err);
                        let errorMessage = 'Hubo un error al eliminar el paciente.';
                        if (err.error && err.error.message) {
                            errorMessage = err.error.message;
                        } else if (err.status === 404) {
                            errorMessage = 'El paciente o el cliente no fueron encontrados.';
                        } else if (err.status === 403) {
                            errorMessage = 'No tienes permiso para eliminar este paciente.';
                        }
                        Swal.fire('Error', errorMessage, 'error');
                    }
                });
            }
        });
    }
}