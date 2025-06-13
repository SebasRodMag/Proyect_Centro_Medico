import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClienteService } from '../../../../../../services/Cliente-Service/cliente.service';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
import { CitaService } from '../../../../../../services/Cita-Service/cita.service';

import dayjs from 'dayjs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-modal-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatSelectModule,
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
    clientes: any[] = [];
    pacientes: any[] = [];
    medicos: any[] = [];
    horasDisponibles: string[] = [];
    idContrato: number | null = null;
    fechaDePartida: Date;

    @Output() cerrar = new EventEmitter<void>();
    @Output() citaCreada = new EventEmitter<void>();

    private clienteService = inject(ClienteService);
    private medicoService = inject(MedicoService);
    private citaService = inject(CitaService);
    private fb = inject(FormBuilder);

    constructor() {
        this.form = this.fb.group({
            id_cliente: ['', Validators.required],
            paciente: ['', Validators.required],
            medico: ['', Validators.required],
            fecha: ['', Validators.required],
            hora: ['', Validators.required],
        });
        this.fechaDePartida = new Date();
    }

    ngOnInit() {
        this.form.get('id_cliente')?.valueChanges.subscribe((id_cliente) => {
            if (id_cliente) {
                this.buscarPacientesPorIdCliente(id_cliente);
            } else {
                this.pacientes = [];
                this.idContrato = null;
                this.form.get('paciente')?.reset();
            }
        });

        this.form.get('fecha')?.valueChanges.subscribe((fecha) => {
            if (fecha && this.form.get('medico')?.value) {
                this.actualizarHorasDisponibles(fecha); //Se actualiza las horas disponibles cuando cambia la fecha
            }
        });

        this.form.get('medico')?.valueChanges.subscribe(() => {
            const fecha = this.form.get('fecha')?.value;
            if (fecha) {
                this.actualizarHorasDisponibles(fecha); //Se actualiza las horas disponibles cuando cambia el médico
            }else{
                this.horasDisponibles = []; //Se limpian las horas si no hay fecha
                this.form.get('hora')?.reset();
            }
        });
    }

    open() {
        this.isVisible = true;
        this.cargarMedicos();
        this.cargarClientes();
        this.form.reset();
        this.pacientes = [];
        this.horasDisponibles = [];
        this.idContrato = null;
    }

    close() {
        this.isVisible = false;
        this.cerrar.emit();
        this.form.reset();
        this.pacientes = [];
        this.medicos = [];
        this.idContrato = null;
        this.horasDisponibles = [];
    }

    cargarClientes() {
        this.clienteService.getListarClientesPorRazonSocial().subscribe({
            next: (data: any[]) => {
                this.clientes = data;
            },
            error: (err) => {
                console.error('Error al cargar clientes:', err);
                this.clientes = [];
                Swal.fire('Error', 'No se pudieron cargar las empresas.', 'error');
            },
        });
    }

    buscarPacientesPorIdCliente(id_cliente: number) {
        this.clienteService.getPacientesPorClienteId(id_cliente).subscribe({
            next: (data: any) => {
                this.pacientes = data.pacientes || [];
                this.idContrato = data.id_contrato || data.cliente?.id || null;

                if (this.pacientes.length === 0) {
                    this.form.get('paciente')?.reset();
                    Swal.fire('Información', 'No se encontraron pacientes para la empresa seleccionada.', 'info');
                }
            },
            error: (err) => {
                console.error('Error al obtener pacientes por ID de cliente:', err);
                this.pacientes = [];
                this.idContrato = null;
                this.form.get('paciente')?.reset();
                Swal.fire('Error', 'No se pudieron cargar los pacientes de la empresa.', 'error');
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
                Swal.fire('Error', 'No se pudieron cargar los médicos.', 'error');
            },
        });
    }

    onSubmit() {

        // --- INICIO DE DEPURACIÓN ---
        console.log('Intentando enviar formulario...');
        console.log('Formulario válido:', this.form.valid);
        console.log('idContrato:', this.idContrato);
        console.log('Horas disponibles:', this.horasDisponibles.length > 0);
        console.log('Valores del formulario:', this.form.value);
        // --- FIN DE DEPURACIÓN ---
        if (this.form.valid && this.idContrato && this.horasDisponibles.length > 0) {
            const { paciente, medico, fecha, hora } = this.form.value;

            const citaSeleccionada = {
                id_paciente: paciente,
                id_medico: medico,
                id_contrato: this.idContrato,
                fecha_hora_cita: `${dayjs(fecha).format('YYYY-MM-DD')}T${hora}`,
            };

            //Enviar la solicitud al backend para crear la cita
            this.citaService.storeCita(citaSeleccionada).subscribe({
                next: (response: any) => {
                    console.log('Cita creada con éxito:', response);
                    Swal.fire('Éxito', 'Cita creada con éxito.', 'success');
                    //Después de crear la cita se actualizan las horas disponibles
                    this.actualizarHorasDisponibles(fecha); //Se refrescan las horas disponibles
                    this.close();
                    this.citaCreada.emit();
                },
                error: (error: any) => {
                    console.error('Error al crear cita:', error);
                    let errorMessage = 'No se pudo crear la cita.';
                    if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.statusText) {
                        errorMessage = `Error: ${error.status} - ${error.statusText}`;
                    }
                    Swal.fire('Error', error.error?.message || 'No se pudo crear la cita.', 'error');
                },
            });
        } else {
            this.form.markAllAsTouched();
            let warningMessage = 'Por favor, completa todos los campos obligatorios.';
            if (!this.idContrato) {
                warningMessage = 'Por favor, selecciona una empresa válida.';
            } else if (this.horasDisponibles.length === 0 && this.form.get('fecha')?.valid && this.form.get('medico')?.valid) {
                warningMessage = 'No hay horas disponibles para la fecha y el médico seleccionados.';
            }
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios.', 'warning');
        }
    }

    actualizarHorasDisponibles(fecha: string | Date) {
        const dia = dayjs(fecha);
        const diaSemana = dia.day(); 
        
        //0 = domingo, 6 = sábado
        if (diaSemana === 0 || diaSemana === 6) {
            this.horasDisponibles = [];
            this.form.get('hora')?.reset();
            Swal.fire('Información', 'Los fines de semana no hay horas disponibles.', 'info');
            return;
        }

        const medicoId = this.form.get('medico')?.value;
        if (!medicoId) {
            this.horasDisponibles = [];
            this.form.get('hora')?.reset();
            return;
        };

        this.citaService
            .getHorasDisponibles(dia.format('YYYY-MM-DD'), medicoId)
            .subscribe({
                next: (response: any) => {
                    this.horasDisponibles = response.horas_disponibles || [];
                    if (this.horasDisponibles.length === 0) {
                        this.form.get('hora')?.reset();
                        Swal.fire('Información', 'No hay horas disponibles para la fecha y médico seleccionados.', 'info');
                    }
                },
                error: () => {
                    console.error('Error al obtener las horas disponibles');
                    this.horasDisponibles = [];
                    this.form.get('hora')?.reset();
                    Swal.fire('Error', 'No se pudieron cargar las horas disponibles para el médico seleccionado.', 'error');
                },
            });
    }

    filtrarDiasHabiles = (fecha: Date | null): boolean => {
        if (!fecha) return false;
        const dia = fecha.getDay();
        return dia !== 0 && dia !== 6 && fecha >= this.fechaDePartida;
    };
}
