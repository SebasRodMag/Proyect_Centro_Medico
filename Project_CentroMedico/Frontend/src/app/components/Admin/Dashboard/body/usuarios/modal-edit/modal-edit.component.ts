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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { UsuariosService } from '../../../../../../services/Usuario-Service/usuarios.service';

@Component({
    selector: 'app-modal-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
    ],
    templateUrl: './modal-edit.component.html',
    styleUrls: ['./modal-edit.component.css'],
})
export class ModalEditComponent implements OnInit {
    form!: FormGroup;
    roles: string[] = ['Administrador', 'Cliente', 'Paciente', 'Medico'];

    constructor(
        private fb: FormBuilder,
        private usuarioService: UsuariosService,
        private dialogRef: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { usuario: any }
    ) {}

    ngOnInit(): void {
        const usuario = this.data.usuario;
        this.form = this.fb.group({
            rol: [usuario.rol, Validators.required],
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formData = this.form.value;

        this.usuarioService
            .updateUsuario(this.data.usuario.id, formData)
            .subscribe({
                next: () => {
                    Swal.fire(
                        'Actualizado',
                        'Rol actualizado correctamente',
                        'success'
                    );
                    this.dialogRef.close(true);
                },
                error: (error:any) => {
                    Swal.fire('Error', 'No se pudo actualizar el rol', 'error');
                },
            });
    }

    close(): void {
        this.dialogRef.close();
    }
}
