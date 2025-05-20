import { Component, Input, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CitaService } from '../../../../../../services/Cita-Service/cita.service';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { ContratoService } from '../../../../../../services/Contrato-Service/contrato.service';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';


@Component({
    selector: 'app-modal-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent implements OnInit {
    @Input() mostrarModal = false;
    @Output() cerrarModal = new EventEmitter<void>();
    @Output() citaCreada = new EventEmitter<void>();
    @Input() visible: boolean = false;

    formulario!: FormGroup;

    pacientes: any[] = [];
    medicos: any[] = [];
    idContrato: number | null = null;
    

    private fb = inject(FormBuilder);
    private citaService = inject(CitaService);
    private pacienteService = inject(PacienteService);
    private contratoService = inject(ContratoService);
    private medicoService = inject(MedicoService);

    ngOnInit(): void {
        this.formulario = this.fb.group({
            id_paciente: [null, Validators.required],
            id_medico: [null, Validators.required],
            fecha_hora_cita: [null, Validators.required],
            observaciones: [''],
        });

        this.cargarPacientesDelCliente();
        this.cargarContratoDelCliente();
        this.cargarMedicos();
    }

    cargarPacientesDelCliente(): void {
        this.pacienteService.getPacientesPorCliente().subscribe({
            next: (pacientes) => {
                this.pacientes = pacientes;
            },
            error: (err) => {
                console.error('Error al cargar pacientes:', err);
            }
        });
    }

    cargarContratoDelCliente(): void {
        this.contratoService.getContratoCliente().subscribe({
            next: (contrato) => {
                this.idContrato = contrato.id;
            },
            error: (err) => {
                console.error('Error al obtener contrato:', err);
                this.idContrato = null;
            }
        });
    }

    cargarMedicos(): void {
        this.medicoService.getMedicos().subscribe({
            next: (medicos) => {
                this.medicos = medicos;
            },
            error: (err) => {
                console.error('Error al cargar médicos:', err);
            }
        });
    }

    crearCita(): void {
        if (this.formulario.invalid || !this.idContrato) {
            return;
        }

        const datosCita = {
            ...this.formulario.value,
            id_contrato: this.idContrato
        };

        this.citaService.storeCita(datosCita).subscribe({
            next: () => {
                this.cerrar();
                this.citaCreada.emit(); // Notifica al componente padre
            },
            error: (err) => {
                console.error('Error al crear cita:', err);
            }
        });
    }

    cerrar() {
        this.cerrarModal.emit();
    }
}
