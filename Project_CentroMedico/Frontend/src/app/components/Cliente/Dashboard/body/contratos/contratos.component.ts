import { Component, ViewChild } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../../auth/auth.service';

@Component({
    selector: 'app-contratos',
    imports: [CommonModule,MatTableModule,
        MatPaginatorModule,
        MatSortModule,],
    templateUrl: './contratos.component.html',
    styleUrls: ['./contratos.component.css'],
})
export class ContratosComponent {
    contratosDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'empresa',
        'num_reconocimientos',
        'reconocimientos_restantes',
        'fecha_inicio',
        'fecha_fin'
    ];

    rol_id!: string;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private clienteService: ClienteService,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.authService
            .me()
            .subscribe((response: { user: { rol_id: string } }) => {
                this.rol_id = response.user.rol_id;
                this.getContratos(this.rol_id);
            });
    }

    ngAfterViewInit(): void {
        this.contratosDataSource.paginator = this.paginator;
        this.contratosDataSource.sort = this.sort;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.contratosDataSource.filter = filterValue.trim().toLowerCase();
    }
    getContratos($rol_id: string) {
        this.clienteService.getContratos(this.rol_id).subscribe(
            (data) => {
                console.log('Contratos: ', data);
                this.contratosDataSource.data = data.contratos;
            },
            (error) => console.error('Error al obtener los contratos', error)
        );
    }
}
