import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../../../services/Cliente-Service/cliente.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
    selector: 'app-modal-create',
    imports: [
        CommonModule, FormsModule
    ],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent {
    mostrarPassword: boolean = false;
    isVisible = false;
    cliente = {
        email: '',
        password: '',
        razon_social: '',
        cif: '',
        direccion: '',
        municipio: '',
        provincia: '',
        fechaInicio: '',
        fechaFin: '',
        reconocimientos: 0,
    };

    @Output() closed = new EventEmitter<void>();
    @Output() usuarioCreado = new EventEmitter<void>();

    constructor(private clienteService: ClienteService) {}

    open() {
        this.isVisible = true;
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    // Método llamado al enviar el formulario
    onSubmit() {
        // Validamos que el formulario sea válido
        if (!this.cliente.email || !this.cliente.password || !this.cliente.razon_social || !this.cliente.cif || !this.cliente.direccion 
        || !this.cliente.municipio || !this.cliente.provincia || !this.cliente.reconocimientos) {
            return;
        }
        // Llamamos al servicio para crear el cliente
        this.createCliente(this.cliente);
    }

    // Método para crear un cliente
    createCliente(cliente: any) {
        this.clienteService.createCliente(cliente).subscribe(
            (response) => {
                console.log('Cliente creado con éxito: ', response);
                this.usuarioCreado.emit();
                this.close();
            },
            (error) => {
                console.error('Error al crear el cliente:', error);
            }
        );
    }
}
