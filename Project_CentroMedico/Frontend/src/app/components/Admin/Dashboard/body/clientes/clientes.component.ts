import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

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
    ],
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent implements OnInit {
    clientes: any[] = [];
    contratosVigentes: { [key: number]: any } = {};
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
        'reconocimientos',
        'acciones',
    ];

    @ViewChild(MatPaginator)
    paginator: MatPaginator = new MatPaginator();

    @ViewChild(MatSort)
    sort: MatSort = new MatSort();

    constructor(private clienteService: ClienteService) {}

    ngOnInit() {
        this.clienteService.getClientes().subscribe(
            (data) => {
                this.clientes = data;
                this.clientesDataSource.data = this.clientes;
                this.clientesDataSource.paginator = this.paginator;
                this.clientesDataSource.sort = this.sort;

                // Obtener contrato vigente y reconocimientos restantes para cada cliente
                this.clientes.forEach((cliente) => {
                    this.getContratoVigente(cliente.id);
                });
            },
            (error) => console.error('Error al obtener los clientes', error)
        );
    }

    getContratoVigente(clienteId: number) {
        this.clienteService.getContratoVigente(clienteId.toString()).subscribe(
            (data) => {
                if (data?.contrato) {
                    this.contratosVigentes[clienteId] = {
                        contrato: data.contrato,
                        reconocimientos_restantes: data.reconocimientos_restantes,
                        fecha_inicio: data.contrato.fecha_inicio,
                        fecha_fin: data.contrato.fecha_fin,
                    };
                }
            },
            (error) =>
                console.error('Error al obtener el contrato vigente', error)
        );
    }
}
