import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, inject } from '@angular/core'; // Añadir ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-modal-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
})
export class ModalCreateComponent implements OnInit {
    isVisible = false;
    mostrarPassword = false;

    @Output() closed = new EventEmitter<void>();
    @Output() pacienteCreado = new EventEmitter<void>();

    pacienteForm!: FormGroup;
    clienteId!: string;

    private pacienteService = inject(PacienteService);
    private activatedRoute = inject(ActivatedRoute);
    private fb = inject(FormBuilder);
    private cdRef = inject(ChangeDetectorRef); // <<-- INYECTAR ChangeDetectorRef

    constructor() {
        this.pacienteForm = this.fb.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]],
            fecha_nacimiento: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]], // <<-- CAMBIADO DE minLength(6) A minLength(8)
        });
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.clienteId = params.get('id_cliente')!;
            if (!this.clienteId) {
                console.error('Error: ID de cliente no encontrado en la ruta para el modal de paciente.');
                Swal.fire('Error', 'No se pudo obtener el ID del cliente para registrar el paciente.', 'error');
                this.close();
            }
        });
    }

    open() {
        this.isVisible = true;
        this.pacienteForm.reset();
        this.mostrarPassword = false;
        // Limpiar el estado de validación del formulario al abrir
        this.pacienteForm.markAsPristine();
        this.pacienteForm.markAsUntouched();

        this.activatedRoute.paramMap.subscribe((params: any) => {
            this.clienteId = params.get('id_cliente')!;
        });
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
        this.pacienteForm.reset();
        // Limpiar el estado de validación del formulario al cerrar
        this.pacienteForm.markAsPristine();
        this.pacienteForm.markAsUntouched();
    }

    onSubmit() {
        if (!this.clienteId) {
            console.error('ID del cliente no disponible al enviar el formulario.');
            Swal.fire('Error', 'No se pudo registrar el paciente: ID de cliente no disponible.', 'error');
            return;
        }

        if (this.pacienteForm.valid) {
            const formData = { ...this.pacienteForm.value };

            // Formatear la fecha de nacimiento si MatDatepicker devuelve un objeto Date
            if (formData.fecha_nacimiento instanceof Date) {
                formData.fecha_nacimiento = formData.fecha_nacimiento.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            }

            this.pacienteService.createPaciente(formData, this.clienteId).subscribe({
                next: (res: any) => {
                    Swal.fire('Éxito', 'Paciente creado con éxito.', 'success');
                    this.close();
                    this.pacienteCreado.emit();
                },
                error: (error: any) => { // Mantener 'error' para claridad
                    console.error('Error al crear paciente:', error);
                    // Log detallado para depuración, si sigue sin funcionar
                    console.log('Estructura completa del objeto de error (stringified):', JSON.stringify(error, null, 2));


                    let errorMessage = 'No se pudo registrar el paciente. Inténtalo de nuevo.'; // Mensaje por defecto

                    let backendError: any;
                    // Intentar parsear error.error si es una cadena JSON
                    if (typeof error.error === 'string') {
                        try {
                            backendError = JSON.parse(error.error);
                        } catch (e) {
                            console.error('Error al parsear el string de error.error:', e);
                            backendError = null; // En caso de error de parseo, se considera nulo
                        }
                    } else {
                        // Si ya es un objeto, úsalo directamente
                        backendError = error.error;
                    }

                    // Verificar si es un error de validación de Laravel (código 422 y estructura 'errors')
                    if (error.status === 422 && backendError && backendError.errors) {
                        const validationErrors = backendError.errors;
                        let detailedErrors = '';
                        for (const fieldName in validationErrors) {
                            if (validationErrors.hasOwnProperty(fieldName)) {
                                const errorsForField = validationErrors[fieldName];
                                errorsForField.forEach((msg: string) => {
                                    // Personalizar el mensaje añadiendo el nombre del campo en negrita
                                    detailedErrors += `<strong>${fieldName}</strong>: ${msg}<br>`;
                                });
                            }
                        }
                        errorMessage = `Errores de validación:<br>${detailedErrors}`;
                    } else if (backendError && backendError.message) {
                        // Para otros errores del backend con un mensaje general
                        errorMessage = backendError.message;
                    } else if (error.statusText) {
                        // Para errores HTTP sin cuerpo de respuesta específico
                        errorMessage = `Error: ${error.status} - ${error.statusText}`;
                    }

                    Swal.fire('Error', errorMessage, 'error');
                    this.cdRef.detectChanges(); // <<-- Forzar detección de cambios después de mostrar el SweetAlert
                },
            });
        } else {
            this.pacienteForm.markAllAsTouched(); // Marca todos los campos como tocados
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos.', 'warning');
        }
    }
}