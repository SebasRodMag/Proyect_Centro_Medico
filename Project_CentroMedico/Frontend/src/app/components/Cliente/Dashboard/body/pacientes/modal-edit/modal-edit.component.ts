import { Component, OnInit, OnDestroy, Inject } from '@angular/core'; // Eliminar EventEmitter, Output, Input, OnChanges, SimpleChanges
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { AuthService } from '../../../../../../auth/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { RefreshService } from '../../../../../../services/Comunicacion/refresh.service';

// Angular Material Imports
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necesario para MatDatepicker
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-edit-paciente',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit, OnDestroy {

    pacienteForm!: FormGroup;
    isEditMode = false;
    modalTitle = 'Registrar Paciente';

    constructor(
        private fb: FormBuilder,
        private pacienteService: PacienteService,
        private authService: AuthService,
        private refreshService: RefreshService,
        public dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.initForm();

        if (this.data && this.data.paciente) {
            this.isEditMode = true;
            this.modalTitle = 'Editar Paciente';
            this.pacienteForm.patchValue(this.data.paciente);

            if (this.data.paciente.fecha_nacimiento) {
                const fechaNacimiento = new Date(this.data.paciente.fecha_nacimiento);
                this.pacienteForm.get('fecha_nacimiento')?.setValue(fechaNacimiento);
            }

            this.pacienteForm.get('password')?.clearValidators();
            this.pacienteForm.get('password')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            this.modalTitle = 'Registrar Paciente';
            this.pacienteForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.pacienteForm.get('password')?.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        //
    }

    close(): void {
        this.dialogRef.close();
    }

    initForm(): void {
        this.pacienteForm = this.fb.group({
            id: [null],
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]],
            fecha_nacimiento: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['']
        });
    }

    onSubmit() {
        this.pacienteForm.markAllAsTouched();

        if (this.pacienteForm.invalid) {
            console.warn('Formulario de paciente inválido.');
            Swal.fire('Error de Validación', 'Por favor, rellene todos los campos obligatorios y corrija los errores.', 'warning');
            return;
        }

        const pacienteData = { ...this.pacienteForm.value };

        if (pacienteData.fecha_nacimiento instanceof Date) {
            pacienteData.fecha_nacimiento = pacienteData.fecha_nacimiento.toISOString().split('T')[0];
        }

        if (this.isEditMode && pacienteData.password === '') {
            delete pacienteData.password;
        }

        console.log('Datos a enviar:', pacienteData);

        this.authService.me().subscribe({
            next: (response: any) => {
                const id_cliente = response.user.cliente_id || response.user.rol_id;
                if (!id_cliente) {
                    Swal.fire('Error', 'No se pudo obtener el ID del cliente. Intente de nuevo.', 'error');
                    return;
                }

                if (this.isEditMode && pacienteData.id) {
                    this.pacienteService.updatePaciente(pacienteData.id, pacienteData).subscribe({
                        next: () => {
                            Swal.fire('¡Éxito!', 'Paciente actualizado correctamente.', 'success');
                            this.dialogRef.close(true);
                            this.refreshService.triggerRefreshPacientes();
                        },
                        error: (err: HttpErrorResponse) => {
                            console.error('Error al actualizar paciente:', err);
                            let errorMessage = 'Ocurrió un error al actualizar el paciente.';
                            if (err.error && err.error.errors) {
                                errorMessage = Object.values(err.error.errors).flat().join('<br>');
                            } else if (err.error && err.error.message) {
                                errorMessage = err.error.message;
                            }
                            Swal.fire('Error', errorMessage, 'error');
                        },
                    });
                } else {
                    this.pacienteService.createPaciente(pacienteData, id_cliente).subscribe({
                        next: () => {
                            Swal.fire('¡Éxito!', 'Paciente creado correctamente.', 'success');
                            this.dialogRef.close(true);
                            this.refreshService.triggerRefreshPacientes();
                        },
                        error: (err: HttpErrorResponse) => {
                            console.error('Error al crear paciente:', err);
                            let errorMessage = 'Ocurrió un error al crear el paciente.';
                            if (err.error && err.error.errors) {
                                errorMessage = Object.values(err.error.errors).flat().join('<br>');
                            } else if (err.error && err.error.message) {
                                errorMessage = err.error.message;
                            }
                            Swal.fire('Error', errorMessage, 'error');
                        },
                    });
                }
            },
            error: (err) => {
                console.error('Error al obtener datos de usuario:', err);
                Swal.fire('Error', 'No se pudo obtener la información de autenticación.', 'error');
            },
        });
    }
}