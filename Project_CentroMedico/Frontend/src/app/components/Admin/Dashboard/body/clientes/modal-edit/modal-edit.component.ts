import { Component, Inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ClienteService } from '../../../../../../services/Cliente-Service/cliente.service';

@Component({
    selector: 'app-modal-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
    form!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private clienteService: ClienteService,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { cliente: any }
    ) {}

    ngOnInit(): void {
        const cliente = this.data.cliente;
        this.form = this.fb.group({
            razon_social: [cliente.razon_social, Validators.required],
            cif: [cliente.cif, Validators.required],
            direccion: [cliente.direccion, Validators.required],
            municipio: [cliente.municipio, Validators.required],
            provincia: [cliente.provincia, Validators.required],
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.clienteService
            .updateCliente(this.data.cliente.id, this.form.value)
            .subscribe({
                next: () => {
                    Swal.fire(
                        'Actualizado',
                        'Cliente actualizado correctamente',
                        'success'
                    );
                    this.dialogRef.close(true);
                },
                error: () => {
                    Swal.fire(
                        'Error',
                        'No se pudo actualizar el cliente',
                        'error'
                    );
                },
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
