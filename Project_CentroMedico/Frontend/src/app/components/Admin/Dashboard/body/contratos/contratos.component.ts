import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-contratos',
    templateUrl: './contratos.component.html',
    styleUrls: ['./contratos.component.css'],
    standalone: true,
    imports: [
        ModalCreateComponent,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
    ],
})
export class ContratosComponent implements OnInit {
    contratos: any[] = [];
    filteredContratosDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'contrato',
        'empresa',
        'num_reconocimientos',
        'reconocimientos_restantes',
        'fecha_inicio',
        'fecha_fin',
        'acciones',
    ];
    clienteId!: string;
    searchQuery: string = '';
    autorenovacion: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private clienteService: ClienteService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.clienteId = params['id_cliente'];
            this.getContratos();
        });
    }

    getContratos() {
        this.clienteService.getContratos(this.clienteId).subscribe(
            (data: any) => {
                this.contratos = data.contratos;
                this.filteredContratosDataSource.data = this.contratos;
                this.filteredContratosDataSource.paginator = this.paginator;
                this.filteredContratosDataSource.sort = this.sort;
            },
            (error) => console.error('Error al obtener los contratos', error)
        );
    }

    filterContratos() {
        const filterValue = this.searchQuery.trim().toLowerCase();
        this.filteredContratosDataSource.filter = filterValue;
    }

    editarContrato(contrato: any) {
        console.log('Editar contrato:', contrato);
        // Aquí abrir modal editar
    }

    eliminarContrato(contrato: any) {
        console.log('Eliminar contrato:', contrato);
        // Aquí abrir confirmación y eliminar
    }

    
}
