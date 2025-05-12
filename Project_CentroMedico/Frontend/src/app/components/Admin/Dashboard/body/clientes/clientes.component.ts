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
    contratosVigentes: { [key: number]: any } = {}; // Objeto para almacenar los contratos por id_cliente
    isLoading: boolean = true;
    isDataLoaded: boolean = false;
    constructor(private clienteService: ClienteService) {}

    ngOnInit() {
        this.clienteService.getClientes().subscribe(
            (data) => {
                console.log('Clientes: ', data);
                this.clientes = data;

                // Ahora obtenemos el contrato vigente para cada cliente
                this.clientes.forEach(cliente => {
                    this.getContratoVigente(cliente.id);
                    this.getReconocimientosRestantes(cliente.id);
                    this.getPacientes(cliente.id);
                });

                // setTimeout(() => {
                //     this.isLoading = false;
                //     this.isDataLoaded = true;
                // }, 3000);
                
            },
            (error) => {
                console.error('Error al obtener los clientes', error);
            }
        );
    }

    // Llamar al servicio para obtener el contrato vigente
    getContratoVigente(clienteId: number) {
        this.clienteService.getContratoVigente(clienteId.toString()).subscribe(
            (data) => {
                console.log('Contrato vigente para cliente ' + clienteId + ': ', data);
                if (data && data.contrato) {
                    // Asocia el contrato al cliente sin sobrescribir los reconocimientos
                    if (!this.contratosVigentes[clienteId]) {
                        this.contratosVigentes[clienteId] = {};
                    }
                    this.contratosVigentes[clienteId].contrato = data.contrato;
                }
            },
            (error) => console.error('Error al obtener el contrato vigente', error)
        );
    }

    getReconocimientosRestantes(clienteId: number) {
        this.clienteService.getReconocimientosRestantes(clienteId.toString()).subscribe(
            (data) => {
                console.log('Reconocimientos restantes para cliente ' + clienteId + ': ', data);
                if (data && data.reconocimientos_restantes) {
                    // Asocia los reconocimientos restantes al cliente sin sobrescribir el contrato
                    if (!this.contratosVigentes[clienteId]) {
                        this.contratosVigentes[clienteId] = {};
                    }
                    this.contratosVigentes[clienteId].reconocimientosRestantes = data.reconocimientos_restantes;
                }
            },
            (error) => console.error('Error al obtener los reconocimientos restantes', error)
        );
    }

    getPacientes(clienteId: number){
        this.clienteService.getPacientesDelCliente(clienteId.toString()).subscribe(
            (data) => {
                console.log('Pacientes: ', data);
                return data;
            },
            (error) => {
                console.error('Error al obtener los pacientes', error);
            }
        );
    }
}
