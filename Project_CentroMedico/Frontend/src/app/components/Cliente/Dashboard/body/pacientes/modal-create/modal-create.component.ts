import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { AuthService } from '../../../../../../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-modal-create',
    imports: [CommonModule, FormsModule],
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
})
export class ModalCreateComponent {
    isVisible = false;

    @Output() closed = new EventEmitter<void>();

    formData = {
        nombre: '',
        apellidos: '',
        dni: '',
        fecha_nacimiento: '',
        email: '',
        password: '',
    };

    constructor(
        private pacienteService: PacienteService,
        private authService: AuthService
    ) {}

    open() {
        this.isVisible = true;
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    onSubmit() {
        this.authService.me().subscribe({
            next: (response: any) => {
                const id_cliente = response.user.rol_id; // Asegúrate que sea `id`, no `rol_id`
                this.pacienteService
                    .createPaciente(this.formData, id_cliente)
                    .subscribe({
                        next: () => {
                            console.log('Paciente creado con éxito');
                            this.close();
                        },
                        error: (err) => {
                            console.error('Error al crear paciente', err);
                        },
                    });
            },
            error: (err) => {
                console.error('Error al obtener usuario', err);
            },
        });
    }
}
