import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [ModalCreateComponent, RouterLink, CommonModule],
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.css'],
})
export class ClientesComponent {
    clientes: any[] = [];

    constructor(private clienteService: ClienteService) {}

    ngOnInit() {
        this.clienteService.getClientes().subscribe(
            (data) => {
                console.log('Clientes: ', data);
                this.clientes = data;
            },
            (error) => console.error('Error al obtener los clientes', error)
        );
    }
}
