import { Component, Inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';

@Component({
    selector: 'app-modal-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private pacienteService: PacienteService,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { paciente: any }
    ) {}

    ngOnInit(): void {
        const paciente = this.data.paciente;
        this.form = this.fb.group({
            nombre: [paciente.nombre, Validators.required],
            apellidos: [paciente.apellidos, Validators.required],
            dni: [paciente.dni, Validators.required],
            fecha_nacimiento: [paciente.fecha_nacimiento, Validators.required],
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.pacienteService.updatePaciente(this.data.paciente.id, this.form.value)
            .subscribe({
                next: () => {
                    Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
                    this.dialogRef.close(true);
                },
                error: () => {
                    Swal.fire('Error', 'No se pudo actualizar el paciente', 'error');
                },
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
