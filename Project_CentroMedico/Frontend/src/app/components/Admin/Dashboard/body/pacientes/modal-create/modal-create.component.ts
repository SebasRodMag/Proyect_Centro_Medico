// app/components/Admin/Dashboard/body/pacientes/modal-create/modal-create.component.ts

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importar Reactive Forms
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2'; // Para notificaciones

// Importar módulos de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necesario para MatDatepicker
import { MatIconModule } from '@angular/material/icon'; // Para el icono de visibilidad
import { MatButtonModule } from '@angular/material/button'; // Para el botón del icono

@Component({
    selector: 'app-modal-create',
    standalone: true, // Asegúrate de que el componente es standalone
    imports: [
        CommonModule,
        ReactiveFormsModule, // Usar ReactiveFormsModule
        MatFormFieldModule,  // Módulos de Material
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
    mostrarPassword = false; // Para el botón de visibilidad de contraseña

    @Output() closed = new EventEmitter<void>();
    @Output() pacienteCreado = new EventEmitter<void>();

    pacienteForm!: FormGroup; // Declarar el FormGroup
    clienteId!: string; // Se obtiene de la ruta

    private pacienteService = inject(PacienteService);
    private activatedRoute = inject(ActivatedRoute);
    private fb = inject(FormBuilder); // Inyectar FormBuilder

    constructor() {
        // Inicializar el FormGroup en el constructor
        this.pacienteForm = this.fb.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]], // Validación de DNI
            fecha_nacimiento: ['', Validators.required], // Se usará MatDatepicker
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    ngOnInit(): void {
        // Suscribirse a los parámetros de la ruta para obtener el clienteId
        this.activatedRoute.paramMap.subscribe((params) => {
            this.clienteId = params.get('id_cliente')!;
            if (!this.clienteId) {
                console.error('Error: ID de cliente no encontrado en la ruta para el modal de paciente.');
                Swal.fire('Error', 'No se pudo obtener el ID del cliente para registrar el paciente.', 'error');
                this.close(); // Cerrar el modal si no hay ID de cliente
            }
        });
    }

    open() {
        this.isVisible = true;
        this.pacienteForm.reset(); // Limpiar el formulario al abrir
        this.mostrarPassword = false; // Asegurar que la contraseña esté oculta
        // El clienteId ya se obtiene en ngOnInit, pero lo ponemos aquí también por si el modal se abre antes de que ngOnInit se haya ejecutado completamente
        this.activatedRoute.paramMap.subscribe((params: any) => {
            this.clienteId = params.get('id_cliente')!;
        });
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
        this.pacienteForm.reset(); // Limpiar el formulario al cerrar
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
                error: (err: any) => {
                    console.error('Error al crear paciente:', err);
                    Swal.fire('Error', err.error?.message || 'No se pudo crear el paciente.', 'error');
                },
            });
        } else {
            this.pacienteForm.markAllAsTouched(); // Marca todos los campos como tocados
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos.', 'warning');
        }
    }
}