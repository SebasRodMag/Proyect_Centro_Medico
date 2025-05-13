import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-contratos',
    imports: [ModalCreateComponent, CommonModule],
    templateUrl: './contratos.component.html',
    styleUrl: './contratos.component.css',
})
export class ContratosComponent {
    contratos: any = [];
    clienteId!: string;

    constructor(
      private clienteService: ClienteService,
      private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.clienteId = params['id_cliente'];
            console.log('Cliente ID:', this.clienteId);
            this.getContratos();
        });
    }
  
    getContratos() {
        this.clienteService.getContratos(this.clienteId).subscribe(
            (data) => {
                console.log('Contratos: ', data);
                this.contratos = data.contratos;
            },
            (error) => console.error('Error al obtener los contratos', error)
        );
    }
}
