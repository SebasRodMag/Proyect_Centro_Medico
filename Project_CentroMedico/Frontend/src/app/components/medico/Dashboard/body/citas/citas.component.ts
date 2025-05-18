import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import  Swal from 'sweetalert2';

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

    fechaDesde!: string;
    fechaHasta!: string;
    citasOriginal: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private citaService: CitaService,
        private modalService: NgbModal,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaActual = `${yyyy}-${mm}-${dd}`;

        this.fechaDesde = fechaActual;
        this.fechaHasta = fechaActual;
        
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
    console.log('Recargando citas del médico...');
    this.citaService.getCitasDelMedico().subscribe({
        next: (citas) => {
            console.log('Citas recibidas desde el backend:', citas);
            this.citasOriginal = citas;
            this.citasDataSource.data = citas;
            console.log('DataSource actualizado:', this.citasDataSource.data);
            this.filtrarPorFechas();
        },
        error: (error) => {
            console.error('Error al cargar las citas del médico:', error);
        }
    });
}

    filtrarPorFechas(): void {
        //se definen de esta forma para que no presente errores al comparar las fechas no haya diferencias por horas
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
                                console.log('Cita enviada al backend:', citaEditada)
                                this.citaService.getCitasDelMedico().subscribe((citasActualizadas) => {
                                    this.citasOriginal = citasActualizadas;
                                    this.citasDataSource.data = [...this.citasOriginal];
                                    this.snackBar.open('Cita actualizada con éxito', 'Cerrar', { duration: 3000 });
                                });
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
//función para comparar la fecha de la cita con el dia presente y saber sii se puede modificar una cita.
    esHoy(fecha: string): boolean {
    const hoy = new Date();
    const fechaCita = new Date(fecha);

    return (
        hoy.getFullYear() === fechaCita.getFullYear() &&
        hoy.getMonth() === fechaCita.getMonth() &&
        hoy.getDate() === fechaCita.getDate()
    );
    }
    eliminarCita(cita: any): void {
        if (cita.estado === 'realizada') {
        Swal.fire('No permitido', 'No se puede eliminar una cita ya realizada.', 'info');
        return;
    }
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción marcará la cita como eliminada. '+ cita.id,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.citaService.eliminarCita(cita.id).subscribe({
                    next: () => {
                        Swal.fire('Eliminada', 'La cita ha sido eliminada.', 'success');
                        this.getCitasDelMedicoLogueado(); // O refresca el DataSource actual
                    },
                    error: (error) => {
                        Swal.fire('Error', error.error?.message || 'No se pudo eliminar la cita.', 'error');
                    }
                });
            }
        });
    }

    confirmarEliminacion(cita: any): void {
        const confirmado = confirm(`¿Estás seguro de que deseas eliminar la cita del ${new Date(cita.fecha_hora_cita).toLocaleString()} com id: ${cita.id}?`);
        console.log('Se va a eliminar la cita: ', cita.id)

        if (confirmado) {
            this.citaService.eliminarCita(cita.id).subscribe({
                next: () => {
                    alert('Cita eliminada correctamente');
                    this.getCitasDelMedicoLogueado(); // vuelve a cargar la tabla
                },
                error: (error) => {
                    console.error('Error al eliminar cita:', error);
                    alert('No se pudo eliminar la cita.');
                }
            });
        }
    }

    //función para cambiar el campo estado de la tabla citas
    cambiarEstado(cita: any): void {
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
                realizada: 'Realizada',
                cancelado: 'Cancelada'
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
                        this.getCitasDelMedicoLogueado();  // <-- Esto debería recargar
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
}
