import { Component, Input, OnInit, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
export class ModalCreateComponent implements OnInit, OnDestroy {
    @Input() mostrarModal = false;
    @Output() cerrarModal = new EventEmitter<void>();
    @Output() citaCreada = new EventEmitter<void>();
    @Input() visible: boolean = false;

    formulario!: FormGroup;
    todayMinDate: string;
    pacientes: any[] = [];
    medicos: any[] = [];
    idContrato: number | null = null;
    horariosDisponibles: string[] = [];
    private destroy$ = new Subject<void>();

    private fb = inject(FormBuilder);
    private citaService = inject(CitaService);
    private pacienteService = inject(PacienteService);
    private contratoService = inject(ContratoService);
    private medicoService = inject(MedicoService);
    private refreshService = inject(RefreshService);


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
        this.formulario = this.fb.group({
            id_paciente: [null, Validators.required],
            id_medico: [null, Validators.required],
            fecha_cita: [null, Validators.required],
            hora_cita: [null, Validators.required],
        });

        this.cargarPacientesDelCliente();
        this.cargarContratoDelCliente();
        this.cargarMedicos();

        // Suscripción a los cambios en id_medico y fecha_cita
        this.formulario.get('id_medico')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.cargarHorariosDisponibles());

        this.formulario.get('fecha_cita')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.cargarHorariosDisponibles());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarPacientesDelCliente(): void {
        this.pacienteService.getPacientesPorCliente().subscribe({
            next: (pacientes) => {
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

    cargarHorariosDisponibles(): void {
        const idMedico = this.formulario.get('id_medico')?.value;
        const fechaCita = this.formulario.get('fecha_cita')?.value;

        if (idMedico && fechaCita) {
            this.citaService.getHorasDisponibles(fechaCita, idMedico).subscribe({
                next: (response: { horas_disponibles: string[] }) => { 
                    this.horariosDisponibles = response.horas_disponibles;
                    if (this.formulario.get('hora_cita')?.value && !this.horariosDisponibles.includes(this.formulario.get('hora_cita')?.value)) {
                        this.formulario.get('hora_cita')?.setValue(null);
                    }
                },
                error: (err: HttpErrorResponse) => {
                    console.error('Error al cargar horarios disponibles:', err);
                    this.horariosDisponibles = [];
                    this.formulario.get('hora_cita')?.setValue(null);
                    Swal.fire('Error', 'No se pudieron cargar los horarios disponibles.', 'error');
                }
            });
        } else {
            this.horariosDisponibles = [];
            this.formulario.get('hora_cita')?.setValue(null);
        }
    }

    crearCita(): void {
        if (this.formulario.invalid) {
            console.warn('Formulario inválido. Revise los campos obligatorios.');
            Swal.fire('Advertencia', 'Por favor, rellene todos los campos obligatorios.', 'warning');
            return;
        }

        if (!this.idContrato) {
            console.error('No se encontró el contrato del cliente. No se puede crear la cita.');
            Swal.fire('Error', 'No se pudo asociar la cita a un contrato. Contacte con soporte.', 'error');
            return;
        }

        const rawFormValue = this.formulario.value;

        // Construir fecha_hora_cita a partir de fecha_cita y hora_cita
        const fechaHoraCitaFinal = `${rawFormValue.fecha_cita} ${rawFormValue.hora_cita}:00`;

        const datosCita = {
            id_paciente: Number(rawFormValue.id_paciente),
            id_medico: Number(rawFormValue.id_medico),
            fecha_hora_cita: fechaHoraCitaFinal,
            id_contrato: this.idContrato,
            estado: 'pendiente'
        };

        console.log('Datos de la cita a enviar:', datosCita);

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
                } else if (err.error && err.error.message) {
                    errorMessage = err.error.message;
                    Swal.fire('Error', errorMessage, 'error'); // Errores del servidor
                } else {
                    Swal.fire('Error', errorMessage, 'error'); // Error genérico
                }
            }
        });
    }

    cerrar() {
        this.cerrarModal.emit();
        this.formulario.reset();
        this.horariosDisponibles = [];
        // Desmarcar todos los controles para que no muestren errores al reabrirse
        Object.keys(this.formulario.controls).forEach(key => {
            this.formulario.get(key)?.markAsUntouched();
            this.formulario.get(key)?.markAsPristine();
        });
    }
}
