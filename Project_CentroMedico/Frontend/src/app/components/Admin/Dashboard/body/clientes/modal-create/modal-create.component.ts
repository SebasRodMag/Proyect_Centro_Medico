import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../../../services/Cliente-Service/cliente.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2'

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

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
        MatSelectModule,
        MatIconModule
    ],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent {
    mostrarPassword: boolean = false;
    esVisible = false;
    form: FormGroup;

    @Output() cerrar = new EventEmitter<void>();
    @Output() usuarioCreado = new EventEmitter<void>();

    private clienteService = inject(ClienteService);
    private fb = inject(FormBuilder);

    constructor() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            razon_social: ['', Validators.required],
            cif: ['', Validators.required],
            direccion: ['', Validators.required],
            municipio: ['', Validators.required],
            provincia: ['', Validators.required],
            fechaInicio: ['', Validators.required],
            fechaFin: ['', Validators.required],
            reconocimientos: [0, [Validators.required, Validators.min(0)]],
        });
    }

    open() {
        this.esVisible = true;
        this.form.reset();
        this.form.get('reconocimientos')?.setValue(0);
    }

    close() {
        this.esVisible = false;
        this.cerrar.emit();
        this.form.reset();
        this.form.get('reconocimientos')?.setValue(0);
    }

    onSubmit() {
        if (this.form.valid) {
            const clienteData = this.form.value;
            if (clienteData.fechaInicio instanceof Date) {
                clienteData.fechaInicio = clienteData.fechaInicio.toISOString().split('T')[0];
            }
            if (clienteData.fechaFin instanceof Date) {
                clienteData.fechaFin = clienteData.fechaFin.toISOString().split('T')[0];
            }

            this.crearCliente(clienteData);
        } else {
            //Se marcan todos los inputs como 'touched' para que se muestren los mensajes de error
            this.form.markAllAsTouched();
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos.', 'warning');
        }
    }

    crearCliente(clienteData: any) {
        this.clienteService.crearCliente(clienteData).subscribe({
            next: (response) => {
                console.log('Cliente creado con éxito: ', response);
                Swal.fire('Éxito', 'Cliente registrado correctamente.', 'success');
                this.usuarioCreado.emit();
                this.close();
            },
            error: (error) => {
                console.error('Error al crear el cliente:', error); // Esto ya lo tienes, excelente
                console.log('Estructura completa del objeto de error:', JSON.stringify(error, null, 2)); // <-- ¡Añade esto!

                let errorMessage = 'No se pudo registrar el cliente. Inténtalo de nuevo.';

                // *** DEJA EL CÓDIGO DE MANEJO DE ERRORES QUE TENÍAS DESPUÉS DE ESTE PUNTO ***
                // Esto es para que podamos ver la estructura y tú puedas copiarla aquí.
                if (error.status === 422 && error.error && error.error.errors) {
                    const validationErrors = error.error.errors;
                    let detailedErrors = '';
                    for (const fieldName in validationErrors) {
                        if (validationErrors.hasOwnProperty(fieldName)) {
                            const errorsForField = validationErrors[fieldName];
                            errorsForField.forEach((msg: string) => {
                                detailedErrors += `${msg}<br>`;
                            });
                        }
                    }
                    errorMessage = `Errores de validación:<br>${detailedErrors}`;
                } else if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.statusText) {
                    errorMessage = `Error: ${error.status} - ${error.statusText}`;
                }

                Swal.fire('Error', errorMessage, 'error');
            },
        });
    }
}
