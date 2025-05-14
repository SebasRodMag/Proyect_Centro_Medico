import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../../../../services/Usuario-Service/usuarios.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
    selector: 'app-modal-create',
    imports: [
        CommonModule, FormsModule
    ],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css']
})
export class ModalCreateComponent {
    isVisible = false;
    mostrarPassword: boolean = false;

    email: string = '';
    password: string = '';
    rol: string = 'cliente';

    @Output() closed = new EventEmitter<void>();
    @Output() userCreated = new EventEmitter<void>();

    constructor(private usuarioService: UsuariosService) {}

    open() {
        this.isVisible = true;
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    crearUsuario(form: NgForm) {
        if (form.invalid) {
            return;
        }

        const userData = {
            email: this.email,
            password: this.password,
            rol: this.rol
        };

        this.usuarioService.crearUsuario(userData).subscribe(
            (response) => {
                this.userCreated.emit();
                this.close();
                console.log('Usuario creado: ', response);
            },
            (error) => {
                console.error('Error al crear al usuario:', error);
            }
        );
    }
}
