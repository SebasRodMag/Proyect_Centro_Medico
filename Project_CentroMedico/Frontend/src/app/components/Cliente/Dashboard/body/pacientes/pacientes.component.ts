import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    imports: [ModalCreateComponent, CommonModule, MatPaginator, MatTableModule, MatSort],
    styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit, AfterViewInit {
    pacientes: any[] = [];
    clienteId!: string;
    clienteNombre: string = '';

    displayedColumns = [
        'id',
        'cliente',
        'nombreCompleto',
        'dni',
        'email',
        'fechaNacimiento',
        'acciones',
    ];

    pacientesDataSource = new MatTableDataSource<any>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private clienteService: ClienteService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.clienteId = params['id_cliente'];
            console.log('Cliente ID:', this.clienteId);
            this.getPacientes();
        });
    }

    ngAfterViewInit(): void {
        this.pacientesDataSource.paginator = this.paginator;
        this.pacientesDataSource.sort = this.sort;
    }

    getPacientes(): void {
        this.clienteService.getPacientesDelCliente(this.clienteId).subscribe(
            (data: any) => {
                this.pacientes = data.pacientes;
                this.clienteNombre = data.cliente;
                this.pacientesDataSource.data = this.pacientes;
            },
            (error: any) => {
                console.error('Error al obtener los pacientes:', error);
            }
        );
    }

    eliminarPaciente(id: number) {
        // Aquí puedes agregar la lógica para eliminar paciente
        console.log('Eliminar paciente con id:', id);
    }
}
