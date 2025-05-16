import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../../auth/auth.service';
import { data } from 'jquery';

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
    

    constructor(
        private clienteService: ClienteService,
        private route: ActivatedRoute, 
        private authService: AuthService,
    ) {}

    ngOnInit(): void {
        this.authService
            .me()
            .subscribe((response: { user: { rol_id: string } }) => {
                this.rol_id = response.user.rol_id;
                this.getPacientes(this.rol_id);
            });
    }

    ngAfterViewInit(): void {
        this.pacientesDataSource.paginator = this.paginator;
        this.pacientesDataSource.sort = this.sort;
    }

    getPacientes(rol_id:string): void {
        this.clienteService.getPacientesDelCliente(this.rol_id).subscribe(
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

    eliminarPaciente(pacienteId: number) {
        console.log('Eliminar paciente con id:', pacienteId);
    }
}
