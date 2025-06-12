import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { MedicoService } from '../../../../../services/Medico-Service/medico.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-medicos',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        ModalCreateComponent,
    ],
    templateUrl: './medicos.component.html',
    styleUrls: ['./medicos.component.css'],
})
export class MedicosComponent implements OnInit {
    medicos: any[] = [];
    medicosDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'nombre',
        'dni',
        'fecha_inicio',
        'fecha_fin',
        'acciones',
    ];

    nombreFiltro: string = '';
    dniFiltro: string = '';
    busquedaGlobal: string = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('modalRegistrarMedicoRef') modalRegistrarMedico!: ModalCreateComponent;

    constructor(private medicoService: MedicoService, private dialog: MatDialog, private cdRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadMedicos();
    }

    loadMedicos() {
        this.medicoService.getAllMedicos().subscribe({
            next: (data) => {
                this.medicos = data;
                this.medicosDataSource.data = this.medicos;
                this.medicosDataSource.paginator = this.paginator;
                this.medicosDataSource.sort = this.sort;
                this.medicosDataSource.filterPredicate = this.filtrosPersonalizados();
                this.aplicarFiltros();
                this.cdRef.detectChanges();
            },
            error: (err) => console.error('Error al obtener médicos', err),
        });
    }

    openModalRegMedico(): void {
        if (this.modalRegistrarMedico) {
            this.modalRegistrarMedico.open();
        } else {
            console.error('El componente del modal de creación no está disponible.');
        }
    }

    modalEditar(medico: any): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '500px',
            data: { medico },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadMedicos();
            }
        });
    }

    aplicarFiltros() {
        const filtro = {
            nombre: this.nombreFiltro.trim().toLowerCase(),
            dni: this.dniFiltro.trim().toLowerCase(),
            global: this.busquedaGlobal.trim().toLowerCase(),
        };
        this.medicosDataSource.filter = JSON.stringify(filtro);
        if (this.medicosDataSource.paginator) {
            this.medicosDataSource.paginator.firstPage();
        }
    }

    filtrosPersonalizados() {
        return (data: any, filter: string): boolean => {
            const f = JSON.parse(filter);
            const nombreCompleto =
                `${data.apellidos || ''}, ${data.nombre || ''}`.toLowerCase();

            const matchNombre = nombreCompleto.includes(f.nombre);
            const matchDni = data.dni?.toLowerCase().includes(f.dni);
            const dataParaBusquedaGlobal = `${nombreCompleto} ${data.dni || ''} ${data.email || ''}`.toLowerCase();
            const matchGlobal = dataParaBusquedaGlobal.includes(f.global);


            return matchNombre && matchDni && matchGlobal;
        };
    }

    eliminarMedico(medico: any): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text:'Esta acción eliminará al médico: ' + medico.apellidos +', ' +medico.nombre,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.medicoService.deleteMedico(medico.id).subscribe({
                    next: () => {
                        this.loadMedicos();
                        Swal.fire('Eliminado','El médico ha sido eliminado correctamente.','success');
                    },
                    error: (error) => {
                        Swal.fire('Error',error.error?.message ||'No se pudo eliminar el médico.','error');
                    },
                });
            }
        });
    }
}