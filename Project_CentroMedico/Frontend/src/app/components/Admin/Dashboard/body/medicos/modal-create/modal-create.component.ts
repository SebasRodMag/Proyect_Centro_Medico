import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-modal-create',
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
    standalone: true,
    imports: [CommonModule, FormsModule],
})
export class ModalCreateComponent {
    isVisible = false;

    @Output() closed = new EventEmitter<void>();

    form = {
        email: '',
        nombre: '',
        apellidos: '',
        dni: '',
    };

    constructor(private medicoService: MedicoService) {}

    open() {
        this.isVisible = true;
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    registrarMedico() {
        this.medicoService.createMedico(this.form).subscribe({
            next: (res) => {
                console.log('Médico registrado', res);
                this.close();
            },
            error: (err) => {
                console.error('Error al registrar médico', err);
            },
        });
    }
}
