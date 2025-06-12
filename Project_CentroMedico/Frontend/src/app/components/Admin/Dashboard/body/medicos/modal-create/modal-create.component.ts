// app/components/Admin/Dashboard/body/medicos/modal-create/modal-create.component.ts

import { Component, EventEmitter, Output, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicoService } from '../../../../../../services/Medico-Service/medico.service';
// Importar FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
interface MedicoData {
    id?: number;
    email: string;
    nombre: string;
    apellidos: string;
    dni: string;
}

@Component({
    selector: 'app-modal-create',
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule
    ],
})
export class ModalCreateComponent implements OnInit {
    isVisible = false;
    isEditMode = false;
    mostrarPassword = false;
    mostrarConfirmPassword = false;
    form: FormGroup;
    @Output() closed = new EventEmitter<void>();
    @Output() medicoActualizado = new EventEmitter<void>();

    @Input() medicoEdit: any = null;

    private medicoService = inject(MedicoService);
    private fb = inject(FormBuilder);

    constructor() {
        this.form = this.fb.group({
            id: [null],
            email: ['', [Validators.required, Validators.email]],
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i)]],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        }, {
            validators: this.confirmaPassword
        });
    }

    ngOnInit(): void {
        this.form.get('password')?.valueChanges.subscribe(() => {
            this.form.get('confirmPassword')?.updateValueAndValidity();
        });
    }

    //Confirmar que los dos passwords sean iguales
    confirmaPassword: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (!password || !confirmPassword || password.value === confirmPassword.value) {
            return null;
        }
        return { 'passwordMismatch': true };
    };

    open(medico?: MedicoData) {
        this.isVisible = true;
        this.form.reset();
        this.form.get('id')?.setValue(null);
        this.mostrarPassword = false;
        this.mostrarConfirmPassword = false;

        if (medico) {
            this.isEditMode = true;
            this.form.patchValue(medico);
            this.form.get('password')?.clearValidators();
            this.form.get('confirmPassword')?.clearValidators();
        } else {
            this.isEditMode = false;
            this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
            this.form.get('confirmPassword')?.setValidators([Validators.required]);
        }
        this.form.get('password')?.updateValueAndValidity();
        this.form.get('confirmPassword')?.updateValueAndValidity();
        this.form.updateValueAndValidity();
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
        this.form.reset();
        this.mostrarPassword = false;
        this.mostrarConfirmPassword = false;
    }

    registrarMedico() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            Swal.fire('Atención', 'Por favor, completa todos los campos obligatorios y válidos, incluyendo la confirmación de contraseña.', 'warning');
            return;
        }
        const medicoData: any = this.form.value;
        delete medicoData.confirmPassword;

        if (this.isEditMode && medicoData.id != null) {
            const updatePayload: any = {
                email: medicoData.email,
                nombre: medicoData.nombre,
                apellidos: medicoData.apellidos,
                dni: medicoData.dni,
            };
            if (medicoData.password) {
                updatePayload.password = medicoData.password;
            }

            this.medicoService.updateMedico(medicoData.id, updatePayload).subscribe({
                next: (res: any) => {
                    Swal.fire('Éxito', 'Médico actualizado correctamente.', 'success');
                    this.medicoActualizado.emit();
                    this.close();
                },
                error: (err: any) => {
                    console.error('Error al actualizar médico', err);
                    Swal.fire('Error', err.error?.message || 'No se pudo actualizar el médico.', 'error');
                },
            });
        } else {
            this.medicoService.createMedico(medicoData).subscribe({
                next: (res: any) => {
                    Swal.fire('Éxito', 'Médico registrado correctamente.', 'success');
                    this.medicoActualizado.emit();
                    this.close();
                },
                error: (err: any) => {
                    console.error('Error al registrar médico', err);
                    Swal.fire('Error', err.error?.message || 'No se pudo registrar el médico.', 'error');
                },
            });
        }
    }
}