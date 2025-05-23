import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { PacienteService } from '../../../../../services/Paciente-Service/paciente.service';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../auth/auth.service';

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    styleUrls: ['./pacientes.component.css'],
    standalone: true,
    imports: [
        ModalCreateComponent,
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        FormsModule,
    ],
})
export class PacientesComponent implements OnInit {
    pacientes: any[] = [];
    pacientesDataSource = new MatTableDataSource<any>();
    displayedColumns: string[] = [
        'id',
        'cliente',
        'nombre',
        'dni',
        'email',
        'fecha_nacimiento',
        'acciones'
    ];
    clienteId!: string;
    clienteNombre: string = '';
    busquedaGlobal: string = '';

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private clienteService: ClienteService,
        private pacienteService: PacienteService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        console.log('PacientesComponent iniciado...');
        
        this.route.params.subscribe((params) => {
            this.clienteId = params['id_cliente'];
            console.log('Id del cliente: '+this.clienteId);
            
            this.getPacientes();
        });
    }

    getPacientes(): void {
    this.clienteService.getPacientesDelCliente(this.clienteId).subscribe(
        (data: any) => {
            console.log('Respuesta pacientes:', data);
            this.pacientes = data;  // aquí asignas directamente el array
            this.clienteNombre = ''; // si no tienes el nombre del cliente en la respuesta

            this.pacientesDataSource.data = this.pacientes;
            this.pacientesDataSource.paginator = this.paginator;
            this.pacientesDataSource.sort = this.sort;

            this.pacientesDataSource.filterPredicate = this.customFilterPredicate();
        },
        (error: any) => {
            console.error('Error al obtener los pacientes:', error);
        }
    );
}


    applyFilters() {
        const filtro = this.busquedaGlobal.trim().toLowerCase();
        this.pacientesDataSource.filter = filtro;
    }

    customFilterPredicate() {
    return (data: any, filter: string): boolean => {
        try {
            const contenido = Object.values(data)
                .map((v) => v ?? '')
                .join(' ')
                .toLowerCase();

            return contenido.includes(filter);
        } catch (e) {
            console.error('Error en filtro personalizado:', e, data);
            return false;
        }
    };
}


    editarPaciente(paciente: any) {
        const dialogRef = this.dialog.open(ModalEditComponent, {
            width: '400px',
            data: { paciente }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getPacientes();
            }
        });
    }

    eliminarPaciente(paciente: any) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción eliminará al paciente: ${paciente.nombre} ${paciente.apellidos}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.pacienteService.deletePaciente(this.clienteId, paciente.id).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'Paciente eliminado correctamente.', 'success');
                        this.pacientes = this.pacientes.filter(p => p.id !== paciente.id);
                        this.pacientesDataSource.data = this.pacientes;
                    },
                    error: () => {
                        Swal.fire('Error', 'No se pudo eliminar el paciente.', 'error');
                    }
                });
            }
        });
    }
}
