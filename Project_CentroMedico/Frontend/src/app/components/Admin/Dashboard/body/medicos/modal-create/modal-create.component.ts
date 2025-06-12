// app/components/Admin/Dashboard/body/medicos/modal-create/modal-create.component.ts

import { ChangeDetectorRef, Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MedicoData {
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
        imports: [
                CommonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatIconModule,
                MatButtonModule
        ],
})
export class ModalCreateComponent implements OnInit {
        isVisible = false;
        isEditMode = false;
        mostrarPassword = false;
        mostrarConfirmPassword = false;
        form: FormGroup;
        @Output() closed = new EventEmitter<void>();
        @Output() medicoActualizado = new EventEmitter<void>();

        @Input() medicoEdit: any = null;

        private medicoService = inject(MedicoService);
        private fb = inject(FormBuilder);
        private cdRef = inject(ChangeDetectorRef);

        constructor() {
                this.form = this.fb.group({
                        id: [null],
                        email: ['', [Validators.required, Validators.email]],
                        nombre: ['', Validators.required],
                        apellidos: ['', Validators.required],
                        dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]],
                        password: ['', Validators.required],
                        confirmPassword: ['', Validators.required]
                }, {
                        validators: this.confirmaPassword
                });
        }

        ngOnInit(): void {
                // Suscribirse a los cambios en ambos campos para revalidar el formulario completo
                // Esto asegura que el validador a nivel de grupo se ejecuta.
                this.form.get('password')?.valueChanges.subscribe(() => {
                        this.form.updateValueAndValidity({ emitEvent: false }); // Revalidar el FormGroup
                        this.forcePasswordMismatchErrorDisplay();
                });

                this.form.get('confirmPassword')?.valueChanges.subscribe(() => {
                        this.form.updateValueAndValidity({ emitEvent: false }); // Revalidar el FormGroup
                        this.forcePasswordMismatchErrorDisplay();
                });

                // Lógica de inicio para el modo edición (existente)
                if (this.isEditMode) {
                        this.form.get('password')?.clearValidators();
                        this.form.get('confirmPassword')?.clearValidators();
                        this.form.get('password')?.updateValueAndValidity();
                        this.form.get('confirmPassword')?.updateValueAndValidity();
                        this.form.updateValueAndValidity();
                }
        }

        // Nuevo método para forzar la visualización del error de passwordMismatch
        private forcePasswordMismatchErrorDisplay(): void {
                const passwordControl = this.form.get('password');
                const confirmPasswordControl = this.form.get('confirmPassword');

                // Solo forzar la visualización si ambos campos tienen valores y el error existe
                if (passwordControl && confirmPasswordControl && passwordControl.value && confirmPasswordControl.value) {
                        if (this.form.hasError('passwordMismatch')) {
                                // Marca ambos como tocados si hay un error de coincidencia.
                                // Esto es más robusto si el usuario solo interactúa con uno.
                                passwordControl.markAsTouched();
                                confirmPasswordControl.markAsTouched();
                        } else {
                                // Si ya no hay error de mismatch y ambos están tocados, podrías querer
                                // remover el estado de tocado para que el mensaje desaparezca si el usuario
                                // corrige la contraseña (esto es opcional y depende del UX deseado).
                                // confirmPasswordControl.markAsUntouched(); // o markAsPristine()
                        }
                }
                this.cdRef.detectChanges(); // Asegurar que los cambios se reflejen en la vista
        }


        //Confirmar que los dos passwords sean iguales
        confirmaPassword: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
                const password = control.get('password');
                const confirmPassword = control.get('confirmPassword');

                if (!password || !confirmPassword) {
                        return null; // No validar si los controles no existen
                }

                // Si estamos en modo edición y ambos campos de contraseña están vacíos,
                // no hay error de coincidencia (permitimos no cambiar la contraseña).
                if (this.isEditMode && !password.value && !confirmPassword.value) {
                        return null;
                }

                // Si un campo tiene valor y el otro no, o si no coinciden
                if (password.value !== confirmPassword.value) {
                        return { 'passwordMismatch': true };
                }

                return null; // Las contraseñas coinciden
        };

        open(medico?: MedicoData) {
                this.isVisible = true;
                this.form.reset();
                this.form.get('id')?.setValue(null);
                this.mostrarPassword = false;
                this.mostrarConfirmPassword = false;

                this.form.markAsPristine();
                this.form.markAsUntouched();

                if (medico) {
                        this.isEditMode = true;
                        this.form.patchValue(medico);
                        // Limpiar validadores de password en edición
                        this.form.get('password')?.clearValidators();
                        this.form.get('confirmPassword')?.clearValidators();
                } else {
                        this.isEditMode = false;
                        // Establecer validadores para creación
                        this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
                        this.form.get('confirmPassword')?.setValidators([Validators.required]);
                }
                this.form.get('password')?.updateValueAndValidity();
                this.form.get('confirmPassword')?.updateValueAndValidity();
                this.form.updateValueAndValidity(); // Revalidar el formulario completo
                this.cdRef.detectChanges();
        }

        close() {
                this.isVisible = false;
                this.closed.emit();
                this.form.reset();
                this.mostrarPassword = false;
                this.mostrarConfirmPassword = false;
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.cdRef.detectChanges();
        }

        registrarMedico() {
                if (this.form.invalid) {
                        this.form.markAllAsTouched();
                        Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos, incluyendo la confirmación de contraseña.', 'warning');
                        this.cdRef.detectChanges();
                        return;
                }
                const medicoData: any = this.form.value;
                delete medicoData.confirmPassword;

                // Si estamos en modo edición y la contraseña está vacía, no enviarla al backend
                // Esto es importante para que el backend no intente actualizar la contraseña con un valor vacío
                if (this.isEditMode && (!medicoData.password || medicoData.password === '')) {
                        delete medicoData.password;
                }

                if (this.isEditMode && medicoData.id != null) {
                        const updatePayload: any = {
                                email: medicoData.email,
                                nombre: medicoData.nombre,
                                apellidos: medicoData.apellidos,
                                dni: medicoData.dni,
                        };
                        if (medicoData.password) {
                                updatePayload.password = medicoData.password;
                        }

                        this.medicoService.updateMedico(medicoData.id, updatePayload).subscribe({
                                next: (res: any) => {
                                        Swal.fire('Éxito', 'Médico actualizado correctamente.', 'success');
                                        this.medicoActualizado.emit();
                                        this.close();
                                },
                                error: (error: any) => {
                                        console.error('Error al actualizar médico', error);
                                        console.log('Estructura completa del objeto de error (stringified):', JSON.stringify(error, null, 2));

                                        let errorMessage = 'No se pudo actualizar el médico. Inténtalo de nuevo.';
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
                } else {
                        this.medicoService.createMedico(medicoData).subscribe({
                                next: (res: any) => {
                                        Swal.fire('Éxito', 'Médico registrado correctamente.', 'success');
                                        this.medicoActualizado.emit();
                                        this.close();
                                },
                                error: (error: any) => {
                                        console.error('Error al registrar médico', error);
                                        console.log('Estructura completa del objeto de error (stringified):', JSON.stringify(error, null, 2));

                                        let errorMessage = 'No se pudo registrar el médico. Inténtalo de nuevo.';
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
        }
}