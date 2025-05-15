import { Component, EventEmitter, Output, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MedicoForm {
    id?: number;
    email: string;
    nombre: string;
    apellidos: string;
    dni: string;
}

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

    form: MedicoForm = {
        email: '',
        nombre: '',
        apellidos: '',
        dni: '',
    };

    constructor(private medicoService: MedicoService) {}

    isEditMode = false;

    @Input() medicoEdit: any = null;

    open(medico?: any) {
        this.isVisible = true;

        if (medico) {
            this.isEditMode = true;
            this.form = { ...medico };
        } else {
            this.isEditMode = false;
            this.form = {
                email: '',
                nombre: '',
                apellidos: '',
                dni: '',
            };
        }
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    registrarMedico() {
        if (this.isEditMode && this.form.id != null) {
            this.medicoService.updateMedico(this.form.id, this.form).subscribe({
                next: (res) => {
                    console.log('Médico actualizado', res);
                    this.close();
                },
                error: (err) =>
                    console.error('Error al actualizar médico', err),
            });
        } else {
            this.medicoService.createMedico(this.form).subscribe({
                next: (res) => {
                    console.log('Médico registrado', res);
                    this.close();
                },
                error: (err) => console.error('Error al registrar médico', err),
            });
        }
    }
}
