import { Component, Inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
    FormsModule,
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Swal from 'sweetalert2';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';

@Component({
    selector: 'app-modal-edit-medico',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private medicoService: MedicoService,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { medico: any }
    ) { }

    ngOnInit(): void {
        const medico = this.data.medico;
        this.form = this.fb.group({
            nombre: [medico.nombre, Validators.required],
            apellidos: [medico.apellidos, Validators.required],
            dni: [medico.dni, Validators.required],
            fecha_fin: [medico.fecha_fin ? new Date(medico.fecha_fin) : null, Validators.required],
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            console.log('Formulario inválido:', this.form.value);
            return;
        }

        const formValue = { ...this.form.value };
        if (formValue.fecha_fin instanceof Date) {
            formValue.fecha_fin = formValue.fecha_fin.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        }


        this.medicoService // **¡ATENCIÓN!** Usar medicoService
            .updateMedico(this.data.medico.id, formValue) // Pasar formValue
            .subscribe({
                next: () => {
                    Swal.fire(
                        'Actualizado',
                        'Médico actualizado correctamente',
                        'success'
                    );
                    this.dialogRef.close(true);
                },
                error: (err) => { // Capturar el error para mostrarlo
                    console.error('Error al actualizar médico:', err);
                    Swal.fire(
                        'Error',
                        'No se pudo actualizar el médico',
                        'error'
                    );
                },
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
