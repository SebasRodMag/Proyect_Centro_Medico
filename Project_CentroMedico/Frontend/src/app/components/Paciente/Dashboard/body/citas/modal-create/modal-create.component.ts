import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClienteService } from '../../../../../../services/Cliente-Service/cliente.service';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { CitaService } from '../../../../../../services/Cita-Service/cita.service';

import dayjs from 'dayjs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-modal-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        NgSelectModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
    ],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent implements OnInit {
    isVisible = false;
    form: FormGroup;
    pacientes: any[] = [];
    medicos: any[] = [];
    availableHours: string[] = [];
    idContrato: number | null = null;

    @Output() closed = new EventEmitter<void>();

    private clienteService = inject(ClienteService);
    private medicoService = inject(MedicoService);
    private citaService = inject(CitaService);
    private fb = inject(FormBuilder);

    constructor() {
        this.form = this.fb.group({
            cif: [
                '',
                [
                    Validators.required,
                    Validators.minLength(9),
                    Validators.maxLength(9),
                ],
            ],
            paciente: ['', Validators.required],
            medico: ['', Validators.required],
            fecha: ['', Validators.required],
            hora: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.form
            .get('cif')
            ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((cif) => {
                if (cif && cif.length === 9) {
                    this.buscarPacientesPorCif(cif);
                } else {
                    this.pacientes = [];
                    this.idContrato = null;
                    this.form.get('paciente')?.reset();
                }
            });

        this.form.get('fecha')?.valueChanges.subscribe((fecha) => {
            if (fecha && this.form.get('medico')?.value) {
                this.actualizarHorasDisponibles(fecha); // Actualiza las horas disponibles cuando cambia la fecha
            }
        });

        this.form.get('medico')?.valueChanges.subscribe(() => {
            const fecha = this.form.get('fecha')?.value;
            if (fecha) {
                this.actualizarHorasDisponibles(fecha); // Actualiza las horas disponibles cuando cambia el médico
            }
        });
    }

    open() {
        this.isVisible = true;
        this.cargarMedicos();
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
        this.form.reset();
        this.pacientes = [];
        this.medicos = [];
        this.idContrato = null;
        this.availableHours = [];
    }

    buscarPacientesPorCif(cif: string) {
        this.clienteService.getPacientesPorCif(cif).subscribe({
            next: (data: any) => {
                this.pacientes = data.pacientes || [];
                this.idContrato = data.cliente?.id ?? null;

                if (this.pacientes.length === 0) {
                    this.form.get('paciente')?.reset();
                }
            },
            error: (err) => {
                console.error('Error al obtener pacientes por CIF:', err);
                this.pacientes = [];
                this.idContrato = null;
                this.form.get('paciente')?.reset();
            },
        });
    }

    cargarMedicos() {
        this.medicoService.getMedicos().subscribe({
            next: (data: any) => {
                this.medicos = data;
            },
            error: (err) => {
                console.error('Error al obtener médicos:', err);
                this.medicos = [];
            },
        });
    }

    onSubmit() {
        if (this.form.valid && this.idContrato) {
            const { paciente, medico, fecha, hora } = this.form.value;

            const citaPayload = {
                id_paciente: paciente,
                id_medico: medico,
                id_contrato: this.idContrato,
                fecha_hora_cita: `${dayjs(fecha).format('YYYY-MM-DD')}T${hora}`,
            };

            // Enviar la solicitud al backend para crear la cita
            this.citaService.storeCita(citaPayload).subscribe({
                next: (response: any) => {
                    console.log('Cita creada con éxito:', response);
                    // Después de crear la cita, actualizamos las horas disponibles
                    this.actualizarHorasDisponibles(fecha); // Refrescar las horas disponibles

                    // Cerrar el modal de creación de cita
                    this.close();
                },
                error: (error: any) => {
                    console.error('Error al crear cita:', error);
                },
            });
        } else {
            this.form.markAllAsTouched();
        }
    }

    actualizarHorasDisponibles(fecha: string | Date) {
        const dia = dayjs(fecha);
        const diaSemana = dia.day(); // 0 = domingo, 6 = sábado

        if (diaSemana === 0 || diaSemana === 6) {
            this.availableHours = [];
            return;
        }

        const medicoId = this.form.get('medico')?.value;
        if (!medicoId) return;

        this.citaService
            .getHorasDisponibles(dia.format('YYYY-MM-DD'), medicoId)
            .subscribe({
                next: (response: any) => {
                    this.availableHours = response.horas_disponibles || [];
                },
                error: () => {
                    console.error('Error al obtener las horas disponibles');
                },
            });
    }
    
    filtrarDiasHabiles = (fecha: Date | null): boolean => {
        if (!fecha) return false;
        const dia = fecha.getDay(); // 0: domingo, 6: sábado
        return dia !== 0 && dia !== 6;
    };
}
