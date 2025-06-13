import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
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
        NgbModule,
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();

    displayedColumns: string[] = [];
    userRole: string | null = null;

    fechaDesde!: string;
    fechaHasta!: string;
    citasOriginal: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private citaService: CitaService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit(): void {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaActual = `${yyyy}-${mm}-${dd}`;

        this.fechaDesde = fechaActual;
        this.fechaHasta = fechaActual;

        this.userRole = sessionStorage.getItem('rol');
        console.log('Rol de usuario detectado en CitasComponent (directo de sessionStorage):', this.userRole);

        this.setDisplayedColumns();

        if (this.userRole === 'Medico' || this.userRole === 'Paciente') {
            this.getCitasDelUsuarioLogueado();
        } else {
            this.citasDataSource.data = [];
            this.snackBar.open('No tienes un rol válido para ver citas.', 'Cerrar', { duration: 3000 });
        }
        
        this.citasDataSource.filterPredicate = (data: any, filter: string) => {
            const filterLower = filter.toLowerCase();

            if (this.userRole === 'Paciente' && data.nombre_medico) {
                return data.nombre_medico.toLowerCase().includes(filterLower);
            }
            if (this.userRole === 'Medico') {
                const nombrePaciente = data.nombre_paciente ? data.nombre_paciente.toLowerCase() : '';
                const dniPaciente = data.dni ? data.dni.toLowerCase() : ''; 
                return nombrePaciente.includes(filterLower) || dniPaciente.includes(filterLower);
            }
            return false;
        };
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    setDisplayedColumns(): void {
        if (this.userRole === 'Medico') {
            this.displayedColumns = [
                'id',
                'nombre_paciente',
                'dni',
                'fecha',
                'hora',
                'estado',
                'observaciones',
                'acciones',
            ];
        } else if (this.userRole === 'Paciente') {
            this.displayedColumns = [
                'id',
                'nombre_medico',
                'fecha',
                'hora',
                'estado',
                'observaciones',
            ];
        } else {
            this.displayedColumns = [
                'id',
                'fecha',
                'hora',
                'estado',
                'observaciones',
            ];
        }
    }

    getCitasDelUsuarioLogueado(): void {
        console.log('Recargando citas del usuario logueado...');
        this.citaService.getCitasDelUsuarioLogueado().subscribe({
            next: (citas) => {
                console.log('Citas recibidas desde el backend:', citas);
                this.citasOriginal = citas;
                this.citasDataSource.data = citas;
                console.log('DataSource actualizado:', this.citasDataSource.data);
            },
            error: (error) => {
                console.error('Error al cargar las citas del usuario:', error);
                this.snackBar.open('Error al cargar las citas.', 'Cerrar', { duration: 3000 });
            }
        });
    }

    filtrarPorFechas(): void {
        const desde = this.fechaDesde ? new Date(this.fechaDesde + 'T00:00:00') : null;
        const hasta = this.fechaHasta ? new Date(this.fechaHasta + 'T23:59:59') : null;

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

    openModal(cita: any): void {
        if (this.userRole !== 'Medico') {
            this.snackBar.open('No tienes permiso para editar citas.', 'Cerrar', { duration: 3000 });
            return;
        }

        this.citaService.getHorariosDisponiblesParaHoy().subscribe({
            next: (response: any) => {
                console.log('Respuesta horarios disponibles:', response);
                const horariosDisponibles = response.horas_disponibles;

                const dialogRef = this.dialog.open(ModalEditComponent, {
                    width: '500px',
                    data: {
                        cita: { ...cita },
                        horariosDisponibles
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result?.citaActualizada) {
                        const citaEditada = result.citaActualizada;

                        this.citaService.actualizarCita(citaEditada.id, citaEditada).subscribe({
                            next: () => {
                                console.log('Cita enviada al backend:', citaEditada);
                                this.getCitasDelUsuarioLogueado();
                                this.snackBar.open('Cita actualizada con éxito', 'Cerrar', { duration: 3000 });
                            },
                            error: (err) => {
                                this.snackBar.open(err?.error?.message || 'No se pudo actualizar la cita', 'Cerrar', {
                                    duration: 4000,
                                });
                            }
                        });
                    }
                });
            },
            error: (err) => {
                this.snackBar.open('No se pudieron cargar los horarios disponibles', 'Cerrar', { duration: 4000 });
            }
        });
    }

    esHoy(fechaHora: string): boolean {
        const fechaCita = new Date(fechaHora);
        const hoy = new Date();

        return (
            fechaCita.getFullYear() === hoy.getFullYear() &&
            fechaCita.getMonth() === hoy.getMonth() &&
            fechaCita.getDate() === hoy.getDate()
        );
    }

    eliminarCita(cita: any): void {
        if (this.userRole !== 'Medico') {
            Swal.fire('No permitido', 'No tienes permiso para eliminar citas.', 'info');
            return;
        }

        if (cita.estado === 'realizada') {
            Swal.fire('No permitido', 'No se puede eliminar una cita ya realizada.', 'info');
            return;
        }
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción marcará la cita como eliminada. ' + cita.id,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.citaService.eliminarCita(cita.id).subscribe({
                    next: () => {
                        Swal.fire('Eliminada', 'La cita ha sido eliminada.', 'success');
                        this.getCitasDelUsuarioLogueado();
                    },
                    error: (error) => {
                        Swal.fire('Error', error.error?.message || 'No se pudo eliminar la cita.', 'error');
                    }
                });
            }
        });
    }

    cambiarEstado(cita: any): void {
        if (this.userRole !== 'Medico') {
            Swal.fire('No permitido', 'No tienes permiso para cambiar el estado de citas.', 'info');
            return;
        }

        if (cita.estado !== 'pendiente') {
            Swal.fire('No permitido', 'Solo puedes cambiar el estado de citas pendientes.', 'info');
            console.log('Estado actual:', cita.estado);
            return;
        }

        Swal.fire({
            title: 'Cambiar estado',
            text: 'Selecciona el nuevo estado de la cita:',
            icon: 'question',
            input: 'select',
            inputOptions: {
                realizado: 'Realizado',
                cancelado: 'Cancelado'
            },
            inputPlaceholder: 'Selecciona un estado',
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const nuevoEstado = result.value;
                console.log(`Solicitando cambio de estado para cita ID ${cita.id} a:`, nuevoEstado);

                this.citaService.cambiarEstadoCita(cita.id, { estado: nuevoEstado }).subscribe({
                    next: (response) => {
                        console.log('Respuesta del servidor:', response);
                        Swal.fire('Éxito', 'El estado de la cita se ha actualizado.', 'success');
                        this.getCitasDelUsuarioLogueado();
                    },
                    error: (error) => {
                        console.error('Error al cambiar estado:', error);
                        Swal.fire('Error', error.error?.message || 'No se pudo actualizar la cita.', 'error');
                    }
                });
            } else {
                console.log('Cambio de estado cancelado o no seleccionado');
            }
        });
    }

    mostrarObservaciones(observaciones: string): void {
        Swal.fire({
            title: 'Observaciones de la Cita',
            html: observaciones && observaciones.trim() !== '' ? observaciones : 'Esta cita no tiene observaciones.',
            icon: 'info',
            confirmButtonText: 'Cerrar',
            allowOutsideClick: true,
            allowEscapeKey: true,
            width: '600px',
            padding: '1.5em',
            backdrop: true
        });
    }
}