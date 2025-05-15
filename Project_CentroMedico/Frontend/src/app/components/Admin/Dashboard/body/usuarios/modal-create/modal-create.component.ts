import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../../../../services/Usuario-Service/usuarios.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
    selector: 'app-modal-create',
    imports: [CommonModule, FormsModule],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent {
    isVisible = false;
    mostrarPassword: boolean = false;

    email: string = '';
    password: string = '';
    rol: string = 'Cliente';

    isEditMode: boolean = false;
    usuarioId: number | null = null;

    @Output() closed = new EventEmitter<void>();
    @Output() userCreated = new EventEmitter<void>();
    @Output() userEdited = new EventEmitter<void>();

    constructor(private usuarioService: UsuariosService) {}

    open(usuario: any = null) {
        this.isVisible = true;

        if (usuario) {
            this.isEditMode = true;
            this.usuarioId = usuario.id;
            this.email = usuario.email;
            this.rol = usuario.roles[0]?.name || 'Cliente';
            // No se puede recuperar la contraseña, déjala vacía
            this.password = '';
        } else {
            this.isEditMode = false;
            this.usuarioId = null;
            this.email = '';
            this.password = '';
            this.rol = 'Cliente';
        }
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    crearUsuario(form: NgForm) {
        if (form.invalid) return;

        const userData = {
            email: this.email,
            password: this.password,
            rol: this.rol,
        };

        if (this.isEditMode && this.usuarioId !== null) {
            this.usuarioService
                .actualizarUsuario(this.usuarioId, userData)
                .subscribe(
                    () => {
                        this.userEdited.emit();
                        this.close();
                        console.log('Usuario actualizado');
                    },
                    (error: any) => {
                        console.error('Error al actualizar al usuario:', error);
                    }
                );
        } else {
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
}
