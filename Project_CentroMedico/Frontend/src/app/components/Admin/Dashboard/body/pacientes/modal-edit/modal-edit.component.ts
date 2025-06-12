import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ChangeDetectorRef } from '@angular/core';

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
        private pacienteService: PacienteService,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        private cdRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: { paciente: any }
    ) { }

    ngOnInit(): void {
        const paciente = this.data.paciente;
        let nombre = '';
        let apellidos = '';
        if (paciente.nombre_completo) {
            const partes = paciente.nombre_completo.split(',');
            if (partes.length === 2) {
                apellidos = partes[0].trim();
                nombre = partes[1].trim();
            } else {
                const palabras = paciente.nombre_completo.trim().split(' ');
                if (palabras.length >= 2) {
                    nombre = palabras[palabras.length - 1];
                    apellidos = palabras.slice(0, palabras.length - 1).join(' ');
                } else if (palabras.length === 1) {
                    nombre = palabras[0];
                }
            }
        }

        this.form = this.fb.group({
            nombre: [nombre, Validators.required],
            apellidos: [apellidos, Validators.required],
            dni: [paciente.dni, Validators.required],
            fecha_nacimiento: [paciente.fecha_nacimiento, Validators.required],
        });

        this.form.markAsPristine();
        this.form.markAsUntouched();
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos.', 'warning');
            this.cdRef.detectChanges();
            return;
        }
        const formData = { ...this.form.value };

        if (formData.fecha_nacimiento instanceof Date) {
            formData.fecha_nacimiento = formData.fecha_nacimiento.toISOString().split('T')[0]; //Formato YYYY-MM-DD
        }

        this.pacienteService.updatePaciente(this.data.paciente.id, formData) // Pasamos formData actualizado
            .subscribe({
                next: () => {
                    Swal.fire('Actualizado', 'Paciente actualizado correctamente', 'success');
                    this.dialogRef.close(true);
                },
                error: (error: any) => {
                    console.error('Error al actualizar el paciente:', error);
                    console.log('Estructura completa del objeto de error (stringified):', JSON.stringify(error, null, 2));

                    let errorMessage = 'No se pudo actualizar el paciente. Inténtalo de nuevo.';
                    let backendError: any;

                    if (typeof error.error === 'string') {
                        try {
                            backendError = JSON.parse(error.error);
                        } catch (e) {
                            console.error('Error al parsear el string de error.error:', e);
                            backendError = null;
                        }
                    } else {
                        backendError = error.error;
                    }

                    if (error.status === 422 && backendError && backendError.errors) {
                        const validationErrors = backendError.errors;
                        let detailedErrors = '';
                        for (const fieldName in validationErrors) {
                            if (validationErrors.hasOwnProperty(fieldName)) {
                                const errorsForField = validationErrors[fieldName];
                                errorsForField.forEach((msg: string) => {
                                    detailedErrors += `<strong>${fieldName}</strong>: ${msg}<br>`;
                                });
                            }
                        }
                        errorMessage = `Errores de validación:<br>${detailedErrors}`;
                    } else if (backendError && backendError.message) {
                        errorMessage = backendError.message;
                    } else if (error.statusText) {
                        errorMessage = `Error: ${error.status} - ${error.statusText}`;
                    }

                    Swal.fire('Error', errorMessage, 'error');
                    this.cdRef.detectChanges();
                },
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
