import { Component, Input, OnInit, Output, EventEmitter, inject, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../../services/Cita-Service/cita.service';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { ContratoService } from '../../../../../../services/Contrato-Service/contrato.service';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { RefreshService } from '../../../../../../services/Comunicacion/refresh.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-modal-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent implements OnInit, OnDestroy, OnChanges {
    @Input() mostrarModal = false;
    @Input() cita: any | null = null;
    @Input() visible: boolean = false;

    @Output() cerrarModal = new EventEmitter<void>();
    @Output() citaCreada = new EventEmitter<void>();
    @Output() citaActualizada = new EventEmitter<void>();

    formulario!: FormGroup;
    todayMinDate: string;
    pacientes: any[] = [];
    medicos: any[] = [];
    idContrato: number | null = null;
    horariosDisponibles: string[] = [];
    isEditMode: boolean = false;
    citaId: number | null = null;

    private destroy$ = new Subject<void>();

    private fb = inject(FormBuilder);
    private citaService = inject(CitaService);
    private pacienteService = inject(PacienteService);
    private contratoService = inject(ContratoService);
    private medicoService = inject(MedicoService);
    private refreshService = inject(RefreshService);

    private diasNoLaborables: string[] = [
        '2025-01-01', // Año Nuevo
        '2025-05-01', // Día del Trabajo
        '2025-12-25'  // Navidad
    ];

    /**
     * Implementar restricción para que el cliente no pueda crear una cita en una fecha fuera a la de su contrato
     * o cuando no tienes mas citas disponibles.
     * 
     */
    constructor() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        this.todayMinDate = `${year}-${month}-${day}`;
    }
    ngOnInit(): void {
        this.initForm();

        this.cargarPacientesDelCliente();
        this.cargarContratoDelCliente();
        this.cargarMedicos();

        if (this.cita) {
            this.isEditMode = true;
            this.citaId = this.cita.id;
            this.formulario.patchValue({
                id_paciente: this.cita.paciente_id,
                id_medico: this.cita.medico_id,
                fecha_cita: this.cita.fecha,
                hora_cita: this.cita.hora,
            });
            this.cargarHorariosDisponibles();
        } else {
            this.isEditMode = false;
            this.citaId = null;
        }

        // Suscripción a los cambios en id_medico y fecha_cita
        this.formulario.get('id_medico')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.cargarHorariosDisponibles());

        this.formulario.get('fecha_cita')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.formulario.get('hora_cita')?.setValue(null);
                this.cargarHorariosDisponibles();
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && changes['visible'].currentValue === true && !changes['visible'].firstChange) {
            this.resetAndInitForm();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private fechaNoLaborableValidator(control: AbstractControl): ValidationErrors | null {
        const selectedDate = control.value;
        console.log('Validador: Fecha seleccionada (string):', selectedDate);

        if (!selectedDate) {
            return null; // Si no hay fecha, no hay error de validación (el Validators.required lo maneja)
        }

        // Parsear la fecha como UTC para evitar problemas de zona horaria al obtener el día de la semana
        // Ojo: new Date('YYYY-MM-DD') puede interpretarse de forma diferente en algunos navegadores.
        // Lo más seguro es dividir y construir.
        const [year, month, day] = selectedDate.split('-').map(Number);
        // month - 1 porque los meses en Date son 0-indexados (0=enero)
        const date = new Date(Date.UTC(year, month - 1, day));
        console.log('Validador: Fecha parseada (UTC Date obj):', date);

        const dayOfWeek = date.getUTCDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        console.log('Validador: Día de la semana (0=Dom, 6=Sab):', dayOfWeek);

        // 1. Validar fines de semana
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
            console.log('Validador: Es fin de semana.');
            return { finDeSemana: true };
        }

        // 2. Validar días específicos no laborables
        // Formatear la fecha de forma consistente para la comparación con diasNoLaborables
        const formattedDate = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
        console.log('Validador: Fecha formateada para comparación:', formattedDate);

        if (this.diasNoLaborables.includes(formattedDate)) {
            console.log('Validador: Es un día no laborable específico.');
            return { diaNoLaborable: true };
        }

        console.log('Validador: Fecha es válida.');
        return null; // La fecha es válida
    }

    initForm(): void {
        this.formulario = this.fb.group({
            id_paciente: [null, Validators.required],
            id_medico: [null, Validators.required],
            fecha_cita: [null, [Validators.required, this.fechaNoLaborableValidator.bind(this)]],
            hora_cita: [null, Validators.required],
        });
    }

    private resetAndInitForm(): void {
        // Asegurarse de que el formulario se haya creado antes de intentar resetear
        if (this.formulario) {
            this.formulario.reset();
        }
        this.horariosDisponibles = [];
        this.isEditMode = false;
        this.citaId = null;
        this.cita = null; // Limpiar la cita del input

        this.initForm(); // Re-inicializa el formulario

        // Si usas *ngIf, la lógica de ngOnInit ya manejará esto al abrir el modal
        // Este bloque solo sería necesario si el componente no se destruye con *ngIf
        if (this.cita) {
            this.isEditMode = true;
            this.citaId = this.cita.id;
            this.formulario.patchValue({
                id_paciente: this.cita.paciente_id,
                id_medico: this.cita.medico_id,
                fecha_cita: this.cita.fecha,
                // No parchear hora_cita aquí.
            });
            this.cargarHorariosDisponibles().then(() => {
                if (this.cita.hora && this.horariosDisponibles.includes(this.cita.hora)) {
                    this.formulario.get('hora_cita')?.setValue(this.cita.hora);
                }
            });
        }
    }

    cargarPacientesDelCliente(): void {
        this.pacienteService.getPacientesPorCliente().subscribe({
            next: (pacientes) => {
                console.log("Lista de pacientes: "+pacientes);
                
                this.pacientes = pacientes;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al cargar pacientes:', err);
                Swal.fire('Error', 'No se pudieron cargar los pacientes.', 'error');
            }
        });
    }

    cargarContratoDelCliente(): void {
        this.contratoService.getContratoCliente().subscribe({
            next: (contrato) => {
                this.idContrato = contrato.id;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al obtener contrato:', err);
                this.idContrato = null;
                Swal.fire('Error', 'No se pudo obtener el contrato del cliente.', 'error');
            }
        });
    }

    cargarMedicos(): void {
        this.medicoService.getMedicos().subscribe({
            next: (medicos) => {
                this.medicos = medicos;
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al cargar médicos:', err);
                Swal.fire('Error', 'No se pudieron cargar los médicos.', 'error');
            }
        });
    }

    cargarHorariosDisponibles(): Promise<void> {
        return new Promise((resolve, reject) => {
            const idMedico = this.formulario.get('id_medico')?.value;
            const fechaCitaControl = this.formulario.get('fecha_cita');
            const fechaCita = fechaCitaControl?.value;

            // **IMPORTANTE: Forzar revalidación de la fecha antes de comprobar errores**
            // Esto asegura que si el usuario selecciona una fecha, los errores se calculen inmediatamente.
            fechaCitaControl?.updateValueAndValidity({ emitEvent: false }); // No emite evento para evitar bucles

            if (fechaCitaControl?.errors && (fechaCitaControl.errors['finDeSemana'] || fechaCitaControl.errors['diaNoLaborable'])) {
                this.horariosDisponibles = [];
                this.formulario.get('hora_cita')?.setValue(null);
                console.warn('Fecha seleccionada es un día no laborable o fin de semana. No se cargarán horarios.');
                resolve(); // Resuelve la promesa aunque no haya horarios cargados
                return;
            }

            if (idMedico && fechaCita) {
                this.citaService.getHorasDisponibles(fechaCita, idMedico).subscribe({
                    next: (response: { horas_disponibles: string[] }) => {
                        this.horariosDisponibles = response.horas_disponibles;
                        const currentHoraFormValue = this.formulario.get('hora_cita')?.value;

                        // Si estamos en modo edición y la hora original no está en los disponibles, añadirla
                        if (this.isEditMode && this.cita?.hora && !this.horariosDisponibles.includes(this.cita.hora)) {
                            this.horariosDisponibles.push(this.cita.hora);
                            this.horariosDisponibles.sort();
                        }

                        // Si la hora actualmente seleccionada en el formulario no está en los disponibles, limpiarla
                        if (currentHoraFormValue && !this.horariosDisponibles.includes(currentHoraFormValue)) {
                            this.formulario.get('hora_cita')?.setValue(null);
                        }
                        resolve();
                    },
                    error: (err: HttpErrorResponse) => {
                        console.error('Error al cargar horarios disponibles:', err);
                        this.horariosDisponibles = [];
                        this.formulario.get('hora_cita')?.setValue(null);
                        Swal.fire('Error', 'No se pudieron cargar los horarios disponibles para esta fecha/médico.', 'error');
                        reject(err);
                    }
                });
            } else {
                this.horariosDisponibles = [];
                this.formulario.get('hora_cita')?.setValue(null);
                resolve();
            }
        });
    }

    onSubmit(): void {
        console.log('--- Intentando onSubmit ---');
        // Forzar revalidación de todo el formulario para capturar cualquier cambio pendiente
        this.formulario.markAllAsTouched(); // Asegura que todos los campos sean tocados para mostrar errores
        this.formulario.updateValueAndValidity(); // Recalcula la validez del formulario

        console.log('Formulario válido?', this.formulario.valid);
        console.log('Errores generales del formulario:', this.formulario.errors);
        console.log('Errores en id_paciente:', this.formulario.get('id_paciente')?.errors);
        console.log('Errores en id_medico:', this.formulario.get('id_medico')?.errors);
        console.log('Errores en fecha_cita:', this.formulario.get('fecha_cita')?.errors);
        console.log('Errores en hora_cita:', this.formulario.get('hora_cita')?.errors);


        if (this.formulario.invalid) {
            console.warn('Formulario inválido. Revise los campos obligatorios y la fecha seleccionada.');
            let errorMessage = 'Por favor, rellene todos los campos obligatorios.';
            const fechaControl = this.formulario.get('fecha_cita');
            if (fechaControl?.errors) {
                if (fechaControl.errors['finDeSemana']) {
                    errorMessage = 'No se pueden agendar citas los sábados y domingos.';
                } else if (fechaControl.errors['diaNoLaborable']) {
                    errorMessage = 'La fecha seleccionada es un día no laborable.';
                }
            }
            Swal.fire('Advertencia', errorMessage, 'warning');
            return;
        }

        if (!this.idContrato) {
            console.error('No se encontró el contrato del cliente. No se puede crear/actualizar la cita.');
            Swal.fire('Error', 'No se pudo asociar la cita a un contrato. Contacte con soporte.', 'error');
            return;
        }

        const rawFormValue = this.formulario.value;
        const fechaHoraCitaFinal = `${rawFormValue.fecha_cita} ${rawFormValue.hora_cita}:00`;

        const datosCita = {
            id_paciente: Number(rawFormValue.id_paciente),
            id_medico: Number(rawFormValue.id_medico),
            fecha_hora_cita: fechaHoraCitaFinal,
            id_contrato: this.idContrato,
            ...(this.isEditMode ? {} : { estado: 'pendiente' })
        };

        console.log('Datos de la cita a enviar:', datosCita);

        if (this.isEditMode && this.citaId) {
            this.citaService.actualizarCita(this.citaId, datosCita).subscribe({
                next: () => {
                    this.cerrar();
                    this.citaActualizada.emit();
                    this.refreshService.triggerRefreshCitas();
                    console.log('Cita actualizada con éxito.');
                    Swal.fire('¡Éxito!', 'La cita ha sido actualizada correctamente.', 'success');
                },
                error: (err: HttpErrorResponse) => {
                    console.error('Error al actualizar cita:', err);
                    let errorMessage = 'Ocurrió un error al actualizar la cita. Por favor, inténtelo de nuevo.';
                    if (err.error && err.error.errors) {
                        const validationErrors = Object.values(err.error.errors).flat();
                        errorMessage = validationErrors.join('<br>');
                    } else if (err.error && err.error.message) {
                        errorMessage = err.error.message;
                    }
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        } else {
            this.citaService.storeCita(datosCita).subscribe({
                next: () => {
                    this.cerrar();
                    this.citaCreada.emit();
                    this.refreshService.triggerRefreshCitas();
                    console.log('Cita creada con éxito.');
                    Swal.fire('¡Éxito!', 'La cita ha sido creada correctamente.', 'success');
                },
                error: (err: HttpErrorResponse) => {
                    console.error('Error al crear cita:', err);
                    let errorMessage = 'Ocurrió un error al crear la cita. Por favor, inténtelo de nuevo.';

                    if (err.error && err.error.errors) {
                        const validationErrors = Object.values(err.error.errors).flat();
                        errorMessage = validationErrors.join('<br>');
                    } else if (err.error && err.error.message) {
                        errorMessage = err.error.message;
                    }
                    Swal.fire('Error', errorMessage, 'error');
                }
            });
        }
    }

    cerrar(): void {
        this.cerrarModal.emit();
        this.formulario?.reset();
        this.horariosDisponibles = [];
        this.isEditMode = false;
        this.citaId = null;
        this.cita = null;
        // Limpiar touched y pristine para que el formulario se vea limpio al reabrir
        Object.keys(this.formulario.controls).forEach(key => {
            this.formulario.get(key)?.markAsUntouched();
            this.formulario.get(key)?.markAsPristine();
        });
    }
}
