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
    styleUrls: ['./modal-edit.component.css'], // Usar styleUrls en lugar de styleUrl para consistencia
})
export class ModalEditComponent implements OnInit, OnDestroy { // Cambiar OnChanges a OnDestroy

    pacienteForm!: FormGroup;
    isEditMode = false;
    modalTitle = 'Registrar Paciente';

    constructor(
        private fb: FormBuilder,
        private pacienteService: PacienteService,
        private authService: AuthService,
        private refreshService: RefreshService,
        public dialogRef: MatDialogRef<ModalEditComponent>, // Inyecta MatDialogRef
        @Inject(MAT_DIALOG_DATA) public data: any // Inyecta los datos pasados al modal
    ) { }

    ngOnInit(): void {
        this.initForm(); // Inicializa el formulario

        // Si se reciben datos, estamos en modo edición
        if (this.data && this.data.paciente) {
            this.isEditMode = true;
            this.modalTitle = 'Editar Paciente';
            this.pacienteForm.patchValue(this.data.paciente);

            // Ajustar el formato de la fecha de nacimiento para el datepicker
            if (this.data.paciente.fecha_nacimiento) {
                // Asume que la fecha de nacimiento viene en formato 'YYYY-MM-DD HH:MM:SS' o 'YYYY-MM-DD'
                // MatDatepicker necesita un objeto Date o una string en formato ISO (YYYY-MM-DD)
                const fechaNacimiento = new Date(this.data.paciente.fecha_nacimiento);
                this.pacienteForm.get('fecha_nacimiento')?.setValue(fechaNacimiento);
            }

            // La contraseña no es obligatoria en edición a menos que se modifique
            this.pacienteForm.get('password')?.clearValidators();
            this.pacienteForm.get('password')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            this.modalTitle = 'Registrar Paciente';
            // Asegurarse de que el validador de password esté activo para el modo registro
            this.pacienteForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.pacienteForm.get('password')?.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        // Lógica de limpieza si es necesaria
    }

    // Cierra el modal de MatDialog
    close(): void {
        this.dialogRef.close(); // Cierra el diálogo de Material
    }

    // Inicializa el formulario con Validators
    initForm(): void {
        this.pacienteForm = this.fb.group({
            id: [null],
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]],
            fecha_nacimiento: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            // La contraseña se manejará dinámicamente en ngOnInit
            password: [''] // Iniciar con un valor vacío
        });
    }

    onSubmit() {
        this.pacienteForm.markAllAsTouched();

        if (this.pacienteForm.invalid) {
            console.warn('Formulario de paciente inválido.');
            Swal.fire('Error de Validación', 'Por favor, rellene todos los campos obligatorios y corrija los errores.', 'warning');
            return;
        }

        const pacienteData = { ...this.pacienteForm.value }; // Copia los valores del formulario

        // Formatear la fecha de nacimiento a 'YYYY-MM-DD' antes de enviar
        if (pacienteData.fecha_nacimiento instanceof Date) {
            pacienteData.fecha_nacimiento = pacienteData.fecha_nacimiento.toISOString().split('T')[0];
        }

        // Si la contraseña está vacía en modo edición, no la envíes
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
                            this.dialogRef.close(true); // Cierra y envía 'true' para indicar éxito
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
                            this.dialogRef.close(true); // Cierra y envía 'true' para indicar éxito
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