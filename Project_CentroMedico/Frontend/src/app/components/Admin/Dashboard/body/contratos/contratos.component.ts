import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { ClienteService } from '../../../../../services/Cliente-Service/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-contratos',
    imports: [ModalCreateComponent, CommonModule],
    templateUrl: './contratos.component.html',
    styleUrls: ['./contratos.component.css'],
})
export class ContratosComponent {
    contratos: any = [];
    filteredContratos: any = [];
    clienteId!: string;
    searchQuery: string = '';

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
                this.filteredContratos = this.contratos; // Inicia con todos los contratos
            },
            (error) => console.error('Error al obtener los contratos', error)
        );
    }

    // Filtra los contratos según la búsqueda
    filterContratos() {
        if (this.searchQuery.trim() === '') {
            this.filteredContratos = this.contratos;
        } else {
            this.filteredContratos = this.contratos.filter(
                (contrato: any) =>
                    contrato.contrato
                        .toLowerCase()
                        .includes(this.searchQuery.toLowerCase()) ||
                    contrato.empresa
                        .toLowerCase()
                        .includes(this.searchQuery.toLowerCase())
            );
        }
    }

    // Método para eliminar un contrato
    // deleteContrato(contratoId: number) {
    //     // Aquí puedes llamar al servicio para eliminar el contrato
    //     this.clienteService.deleteContrato(contratoId).subscribe(
    //         (response) => {
    //             console.log('Contrato eliminado con éxito', response);
    //             this.getContratos(); // Actualiza la lista de contratos después de la eliminación
    //         },
    //         (error) => {
    //             console.error('Error al eliminar el contrato', error);
    //         }
    //     );
    // }
}
