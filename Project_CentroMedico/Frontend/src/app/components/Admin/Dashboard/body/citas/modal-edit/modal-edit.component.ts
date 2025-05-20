import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import dayjs from 'dayjs';

import { MedicoService } from '../../../../../../services/Medico-Service/medico.service'; // Ajusta la ruta
import { CitaService } from '../../../../../../services/Cita-Service/cita.service'; // Ajusta la ruta

@Component({
    selector: 'app-edit-cita-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        NgSelectModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
    form!: FormGroup;
    medicos: any[] = [];
    horasDisponibles: string[] = [];

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        private medicoService: MedicoService,
        private citaService: CitaService,
        @Inject(MAT_DIALOG_DATA) public data: { cita: any }
    ) {}

    ngOnInit(): void {
        // Cargar médicos
        this.medicoService.getMedicos().subscribe({
            next: (medicos) => {
                this.medicos = medicos;
            },
            error: (err) => {
                console.error('Error cargando médicos:', err);
                this.medicos = [];
            },
        });

        this.initForm();

        // Actualizar horas disponibles cuando cambian fecha o médico
        this.form
            .get('fecha')
            ?.valueChanges.subscribe(() => this.loadHorasDisponibles());
        this.form
            .get('medico')
            ?.valueChanges.subscribe(() => this.loadHorasDisponibles());
    }

    initForm() {
        const cita = this.data.cita;

        // Convertir la fecha a formato dayjs para separar fecha y hora
        const fechaObj = cita.fecha ? dayjs(cita.fecha) : null;
        const fechaStr = fechaObj ? fechaObj.format('YYYY-MM-DD') : '';
        const horaStr = fechaObj ? fechaObj.format('HH:mm') : '';

        this.form = this.fb.group({
            medico: [cita.id_medico || '', Validators.required],
            fecha: [fechaStr, Validators.required],
            hora: [horaStr, Validators.required],
        });
    }

    loadHorasDisponibles() {
        const medicoId = this.form.get('medico')?.value;
        const fecha = this.form.get('fecha')?.value;

        if (!medicoId || !fecha) {
            this.horasDisponibles = [];
            this.form.get('hora')?.setValue('');
            return;
        }

        // La fecha debe enviarse en formato 'YYYY-MM-DD'
        const fechaFormateada = dayjs(fecha).format('YYYY-MM-DD');

        this.citaService
            .getHorasDisponibles(fechaFormateada, medicoId)
            .subscribe({
                next: (response: any) => {
                    this.horasDisponibles = response.horas_disponibles || [];

                    // Si la hora seleccionada ya no está disponible, la limpiamos
                    const horaActual = this.form.get('hora')?.value;
                    if (
                        horaActual &&
                        !this.horasDisponibles.includes(horaActual)
                    ) {
                        this.form.get('hora')?.setValue('');
                    }
                },
                error: (err) => {
                    console.error('Error cargando horas disponibles:', err);
                    this.horasDisponibles = [];
                    this.form.get('hora')?.setValue('');
                },
            });
    }

    onSubmit() {
        if (this.form.valid) {
            const { medico, fecha, hora } = this.form.value;

            // Convierte fecha (Date) a string YYYY-MM-DD antes de combinar
            const fechaStr = dayjs(fecha).format('YYYY-MM-DD');
            const fechaHoraCita = dayjs(`${fechaStr}T${hora}:00`).format("YYYY-MM-DDTHH:mm:ss");

            if (!dayjs(fechaHoraCita).isValid()) {
                console.error(
                    'Fecha y hora combinadas no son válidas:',
                    fechaHoraCita
                );
                return; // evita enviar datos inválidos
            }

            const citaActualizada = {
                id: this.data.cita.id,
                id_medico: Number(medico),
                fecha_hora_cita: fechaHoraCita,
            };

            this.dialogRef.close({ citaActualizada });
        } else {
            this.form.markAllAsTouched();
        }
    }

    close() {
        this.dialogRef.close();
    }

    filtrarDiasHabiles = (d: Date | null): boolean => {
        if (!d) return false;
        const day = d.getDay();
        return day !== 0 && day !== 6;
    };
}
