import {
    AfterViewInit,
    Component,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../services/Cita-Service/cita.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-citas',
    imports: [
        CommonModule,
        ModalCreateComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
    ],
    templateUrl: './citas.component.html',
    styleUrls: ['./citas.component.css'],
})
export class CitasComponent implements OnInit, AfterViewInit {
    citasDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'contrato_id',
        'numero_de_cita',
        'paciente',
        'cliente',
        'dni_paciente',
        'medico',
        'fecha',
        'hora',
        'estado',
        'acciones',
    ];

    fechaDesde: string = '';
    fechaHasta: string = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    citasOriginal: any;

    constructor(
        private citaService: CitaService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.getCitas();
    }

    ngAfterViewInit(): void {
        this.citasDataSource.paginator = this.paginator;
        this.citasDataSource.sort = this.sort;
    }

    getCitas() {
        this.citaService.getCitas().subscribe(
            (data) => {
                console.log('Citas: ', data);
                this.citasDataSource.data = data.citas;
            },
            (error) => console.error('Error al obtener las citas', error)
        );
    }

    openModal(cita: any): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '500px',
            data: {
                cita: { ...cita },
            },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result?.citaActualizada) {
                const citaEditada = result.citaActualizada;

                this.citaService
                    .actualizarCita(citaEditada.id, citaEditada)
                    .subscribe({
                        next: () => {
                            console.log(
                                'Cita enviada al backend:',
                                citaEditada
                            );
                            console.log(
                                'Cita que se va a enviar:',
                                citaEditada
                            );
                            this.citaService
                                .getCitas()
                                .subscribe((citasActualizadas) => {
                                    this.citasOriginal =
                                        citasActualizadas.citas;
                                    this.citasDataSource.data = [
                                        ...this.citasOriginal,
                                    ];
                                    this.snackBar.open(
                                        'Cita actualizada con éxito',
                                        'Cerrar',
                                        {
                                            duration: 3000,
                                        }
                                    );
                                });
                        },
                        error: (err) => {
                            this.snackBar.open(
                                err?.error?.message ||
                                    'No se pudo actualizar la cita',
                                'Cerrar',
                                { duration: 4000 }
                            );
                        },
                    });
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
            Swal.fire(
                'No permitido',
                'No se puede eliminar una cita ya realizada.',
                'info'
            );
            return;
        }
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción marcará la cita como eliminada. ' + cita.id,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.citaService.eliminarCita(cita.id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Eliminada',
                            'La cita ha sido eliminada.',
                            'success'
                        );
                        this.getCitas(); // O refresca el DataSource actual
                    },
                    error: (error) => {
                        Swal.fire(
                            'Error',
                            error.error?.message ||
                                'No se pudo eliminar la cita.',
                            'error'
                        );
                    },
                });
            }
        });
    }

    confirmarEliminacion(cita: any): void {
        const confirmado = confirm(
            `¿Estás seguro de que deseas eliminar la cita del ${new Date(
                cita.fecha_hora_cita
            ).toLocaleString()} com id: ${cita.id}?`
        );
        console.log('Se va a eliminar la cita: ', cita.id);

        if (confirmado) {
            this.citaService.eliminarCita(cita.id).subscribe({
                next: () => {
                    alert('Cita eliminada correctamente');
                    this.getCitas(); // vuelve a cargar la tabla
                },
                error: (error) => {
                    console.error('Error al eliminar cita:', error);
                    alert('No se pudo eliminar la cita.');
                },
            });
        }
    }

    //función para cambiar el campo estado de la tabla citas
    cambiarEstado(cita: any): void {
        if (cita.estado !== 'pendiente') {
            Swal.fire(
                'No permitido',
                'Solo puedes cambiar el estado de citas pendientes.',
                'info'
            );
            console.log('Estado actual:', cita.estado);
            return;
        }

        Swal.fire({
            title: 'Cambiar estado',
            text: 'Selecciona el nuevo estado de la cita:',
            icon: 'question',
            input: 'select',
            inputOptions: {
                realizado: 'Realizada',
                cancelado: 'Cancelada',
            },
            inputPlaceholder: 'Selecciona un estado',
            showCancelButton: true,
            confirmButtonText: 'Cambiar',
            cancelButtonText: 'Cancelar',
        }).then((result: any) => {
            if (result.isConfirmed && result.value) {
                const nuevoEstado = result.value;
                console.log(
                    `Solicitando cambio de estado para cita ID ${cita.id} a:`,
                    nuevoEstado
                );

                this.citaService
                    .cambiarEstadoCita(cita.id, { estado: nuevoEstado })
                    .subscribe({
                        next: (response) => {
                            console.log('Respuesta del servidor:', response);
                            Swal.fire(
                                'Éxito',
                                'El estado de la cita se ha actualizado.',
                                'success'
                            );
                            this.getCitas(); // <-- Esto debería recargar
                        },
                        error: (error) => {
                            console.error('Error al cambiar estado:', error);
                            Swal.fire(
                                'Error',
                                error.error?.message ||
                                    'No se pudo actualizar la cita.',
                                'error'
                            );
                        },
                    });
            } else {
                console.log('Cambio de estado cancelado o no seleccionado');
            }
        });
    }

    filtrarPorFechas(): void {
        const desde = this.fechaDesde;
        const hasta = this.fechaHasta;

        this.citasDataSource.filterPredicate = (data: any) => {
            const fechaCita = this.formatearFecha(data.fecha); // convierte a 'YYYY-MM-DD'

            const cumpleDesde = !desde || fechaCita >= desde;
            const cumpleHasta = !hasta || fechaCita <= hasta;

            return cumpleDesde && cumpleHasta;
        };

        this.citasDataSource.filter = '' + Math.random(); // fuerza la actualización del filtro
    }

    // Función auxiliar para extraer solo la fecha en formato 'YYYY-MM-DD'
    private formatearFecha(fechaStr: string): string {
        const fecha = new Date(fechaStr);
        const yyyy = fecha.getFullYear();
        const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dd = fecha.getDate().toString().padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.citasDataSource.filter = filterValue.trim().toLowerCase();
    }
}
