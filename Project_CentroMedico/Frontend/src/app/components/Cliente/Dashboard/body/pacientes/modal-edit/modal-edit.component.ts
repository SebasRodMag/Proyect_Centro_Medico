import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { AuthService } from '../../../../../../auth/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importa ReactiveFormsModule y FormBuilder, FormGroup, Validators
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { RefreshService } from '../../../../../../services/Comunicacion/refresh.service'; // Asumiendo que tienes un RefreshService

@Component({
    selector: 'app-modal-edit-paciente', // CAMBIO DE SELECTOR: Más específico
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule], // Añade ReactiveFormsModule
    templateUrl: './modal-edit.component.html',
    styleUrl: './modal-edit.component.css',
})
export class ModalEditComponent implements OnInit, OnChanges {
    @Input() paciente: any | null = null; // Input para recibir el paciente a editar
    @Input() isVisible: boolean = false; // Control de visibilidad del modal

    @Output() closed = new EventEmitter<void>();
    @Output() pacienteSaved = new EventEmitter<void>(); // Evento cuando se guarda (crea/edita) un paciente

    // Usaremos un FormGroup para un manejo más robusto de los formularios
    pacienteForm!: FormGroup;
    
    isEditMode = false;
    modalTitle = 'Registrar Paciente'; // Título del modal

    constructor(
        private fb: FormBuilder, // Inyecta FormBuilder
        private pacienteService: PacienteService,
        private authService: AuthService,
        private refreshService: RefreshService // Inyecta RefreshService
    ) {}

    ngOnInit(): void {
        this.initForm(); // Inicializa el formulario en ngOnInit
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
            this.initForm(); // Inicializa el formulario al abrir
            if (this.paciente) {
                this.isEditMode = true;
                this.modalTitle = 'Editar Paciente';
                this.pacienteForm.patchValue(this.paciente);
                if (this.paciente.fecha_nacimiento) {
                    this.pacienteForm.get('fecha_nacimiento')?.setValue(this.paciente.fecha_nacimiento.split(' ')[0]);
                }
            } else {
                this.isEditMode = false;
                this.modalTitle = 'Registrar Paciente';
                this.pacienteForm.reset(); // Limpia para nuevo registro
            }
        }
        // Limpiar el formulario si el modal se oculta
        if (changes['isVisible'] && changes['isVisible'].currentValue === false && changes['isVisible'].previousValue === true) {
            this.resetForm();
        }
        if (changes['paciente'] && this.isVisible) {
            this.initForm();
            // ... (misma lógica de edición/creación que en el primer if)
            if (this.paciente) {
                this.isEditMode = true;
                this.modalTitle = 'Editar Paciente';
                this.pacienteForm.patchValue(this.paciente);
                if (this.paciente.fecha_nacimiento) {
                    this.pacienteForm.get('fecha_nacimiento')?.setValue(this.paciente.fecha_nacimiento.split(' ')[0]);
                }
            } else {
                this.isEditMode = false;
                this.modalTitle = 'Registrar Paciente';
                this.pacienteForm.reset();
            }
        }
    }

    close() {
        this.closed.emit(); // ¡Esta es la línea que emite el evento al padre!
        this.resetForm(); // Limpiar el formulario del modal
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
            password: ['', [Validators.required, Validators.minLength(6)]],
        });

        // La contraseña no es obligatoria en edición, a menos que se quiera cambiar
        if (this.isEditMode) {
            this.pacienteForm.get('password')?.clearValidators();
            this.pacienteForm.get('password')?.updateValueAndValidity();
        } else {
            this.pacienteForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.pacienteForm.get('password')?.updateValueAndValidity();
        }
    }

    onSubmit() {
        // Marcar todos los campos como "touched" para que se muestren los errores de validación
        this.pacienteForm.markAllAsTouched();

        if (this.pacienteForm.invalid) {
            console.warn('Formulario de paciente inválido.');
            Swal.fire('Error de Validación', 'Por favor, rellene todos los campos obligatorios y corrija los errores.', 'warning');
            return;
        }

        const pacienteData = this.pacienteForm.value;
        console.log('Datos a enviar:', pacienteData);

        this.authService.me().subscribe({
            next: (response: any) => {
                const id_cliente = response.user.cliente_id || response.user.rol_id; // Mejorar la obtención del id_cliente
                if (!id_cliente) {
                    Swal.fire('Error', 'No se pudo obtener el ID del cliente. Intente de nuevo.', 'error');
                    return;
                }

                if (this.isEditMode && pacienteData.id) {
                // Modo edición: Actualizar paciente
                // Llama a updatePaciente con solo 2 argumentos, como espera tu servicio y backend
                this.pacienteService.updatePaciente(pacienteData.id, pacienteData).subscribe({ // ¡CAMBIO AQUÍ!
                    next: () => {
                        Swal.fire('¡Éxito!', 'Paciente actualizado correctamente.', 'success');
                        this.close();
                        this.pacienteSaved.emit(); // Emitir evento para recargar la tabla
                        this.refreshService.triggerRefreshPacientes(); // Notificar para recargar
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
                // Modo creación: Crear paciente
                // Aquí sí pasamos el id_cliente porque tu método createPaciente lo espera
                this.pacienteService.createPaciente(pacienteData, id_cliente).subscribe({
                    next: () => {
                        Swal.fire('¡Éxito!', 'Paciente creado correctamente.', 'success');
                        this.close();
                        this.pacienteSaved.emit(); // Emitir evento para recargar la tabla
                        this.refreshService.triggerRefreshPacientes(); // Notificar para recargar
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

    resetForm(): void {
        this.pacienteForm.reset();
        this.paciente = null;
        this.isEditMode = false;
        this.modalTitle = 'Registrar Paciente';
        this.pacienteForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.pacienteForm.get('password')?.updateValueAndValidity();
        Object.keys(this.pacienteForm.controls).forEach(key => {
            this.pacienteForm.get(key)?.markAsUntouched();
            this.pacienteForm.get(key)?.markAsPristine();
        });
    }
}