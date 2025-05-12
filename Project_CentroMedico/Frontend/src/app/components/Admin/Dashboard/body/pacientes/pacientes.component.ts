import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service'; // Asegúrate de importar el servicio de pacientes correctamente
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    imports: [ModalCreateComponent],
    styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit {
    pacientes: any[] = [];
    clienteId!: string;

    constructor(
        private clienteService: ClienteService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        // Obtener el clienteId de la URL
        this.route.params.subscribe(params => {
            this.clienteId = params['id_cliente']; // Asignar el id_cliente a la propiedad clienteId
            console.log('Cliente ID:', this.clienteId);
        });

        // Obtener los pacientes del cliente con el servicio
        this.clienteService.getPacientesDelCliente(this.clienteId).subscribe(
            (data: any[]) => {
                this.pacientes = data; // Asignar los pacientes a la propiedad 'pacientes'
            },
            (error: any) => {
                console.error('Error al obtener los pacientes:', error);
            }
        );
    }
}
