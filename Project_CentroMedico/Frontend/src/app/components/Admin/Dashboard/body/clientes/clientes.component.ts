import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditComponent } from './modal-edit/modal-edit.component';

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [
        ModalCreateComponent,
        RouterLink,
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
    ],
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
    clientes: any[] = [];
    clientesDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'razon_social',
        'cif',
        'direccion',
        'municipio',
        'provincia',
        'contrato',
        'fecha_inicio',
        'fecha_fin',
        'reconocimientos_restantes',
        'acciones',
    ];

    razonSocialFiltro: string = '';
    municipioFiltro: string = '';
    busquedaGlobal: string = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private clienteService: ClienteService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.getClientes();
    }

    getClientes() {
        this.clienteService.getClientes().subscribe(
            (data) => {
                this.clientes = data;
                this.clientesDataSource.data = this.clientes;
                this.clientesDataSource.paginator = this.paginator;
                this.clientesDataSource.sort = this.sort;

                this.clientesDataSource.filterPredicate =
                    this.customFilterPredicate();

                console.log('Lista de clientes recibida: ', this.clientes);
            },
            (error) => console.error('Error al obtener los clientes', error)
        );
    }

    modalEditarOpen(cliente: any): void {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '500px',
            data: { cliente },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.getClientes(); // refresca la tabla
            }
        });
    }

    applyFilters() {
        const filtro = {
            razon_social: this.razonSocialFiltro.trim().toLowerCase(),
            municipio: this.municipioFiltro.trim().toLowerCase(),
            global: this.busquedaGlobal.trim().toLowerCase(),
        };

        this.clientesDataSource.filter = JSON.stringify(filtro);
    }

    customFilterPredicate() {
        return (data: any, filter: string): boolean => {
            const filtro = JSON.parse(filter);

            const matchRazon = data.razon_social
                ?.toLowerCase()
                .includes(filtro.razon_social);
            const matchMunicipio = data.municipio
                ?.toLowerCase()
                .includes(filtro.municipio);
            const matchGlobal = Object.values(data)
                .map((v) => v ?? '') // 🛡️ Protege contra undefined/null
                .join(' ')
                .toLowerCase()
                .includes(filtro.global);

            return matchRazon && matchMunicipio && matchGlobal;
        };
    }

    eliminarCliente(cliente: any): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará al cliente: ' + cliente.razon_social,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                this.clienteService.deleteCliente(cliente.id).subscribe({
                    next: () => {
                        Swal.fire(
                            'Eliminado',
                            'El cliente ha sido eliminado correctamente.',
                            'success'
                        );
                        this.clientes = this.clientes.filter(
                            (c) => c.id !== cliente.id
                        );
                        this.clientesDataSource.data = this.clientes;
                    },
                    error: (error) => {
                        Swal.fire(
                            'Error',
                            error.error?.message ||
                                'No se pudo eliminar el cliente.',
                            'error'
                        );
                    },
                });
            }
        });
    }
}
