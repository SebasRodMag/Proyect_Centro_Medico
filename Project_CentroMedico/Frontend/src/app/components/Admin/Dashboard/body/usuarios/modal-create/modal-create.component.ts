import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../../../../services/Usuario-Service/usuarios.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'; // Importar módulos de formularios reactivos
import { MatFormFieldModule } from '@angular/material/form-field'; // Importar módulos de Material
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon'; // Para el icono de visibilidad de contraseña
import { MatButtonModule } from '@angular/material/button'; // Para el botón del icono de visibilidad

@Component({
    selector: 'app-modal-create',
    standalone: true, // Asegúrate de que el componente sea standalone si tu proyecto lo es
    imports: [
        CommonModule,
        ReactiveFormsModule, // Usar ReactiveFormsModule en lugar de FormsModule
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './modal-create.component.html',
    styleUrls: ['./modal-create.component.css'],
})
export class ModalCreateComponent implements OnInit { // Implementar OnInit
    isVisible = false;
    mostrarPassword = false;
    isEditMode = false;
    usuarioId: number | null = null;

    userForm!: FormGroup; // Declarar el FormGroup

    @Output() closed = new EventEmitter<void>();
    @Output() userCreated = new EventEmitter<void>();
    @Output() userEdited = new EventEmitter<void>();

    constructor(private fb: FormBuilder, private usuarioService: UsuariosService) { } // Inyectar FormBuilder

    ngOnInit() {
        this.initForm(); // Inicializar el formulario cuando el componente se inicializa
    }

    initForm() {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rol: ['Cliente', Validators.required],
        });
    }

    open(usuario: any = null) {
        this.isVisible = true;

        if (usuario) {
            this.isEditMode = true;
            this.usuarioId = usuario.id;
            // Usar patchValue para establecer los valores del formulario reactivo
            this.userForm.patchValue({
                email: usuario.email,
                rol: usuario.roles[0]?.name || 'Cliente',
                // No se puede recuperar la contraseña, déjala vacía al editar
                password: '',
            });
            // Cuando se edita, la contraseña no es obligatoria
            this.userForm.get('password')?.setValidators(null);
            this.userForm.get('password')?.updateValueAndValidity();
        } else {
            this.isEditMode = false;
            this.usuarioId = null;
            this.userForm.reset(); // Resetea el formulario a sus valores iniciales/vacíos
            this.userForm.get('rol')?.setValue('Cliente'); // Asegura que el rol por defecto sea Cliente
            // Cuando se crea, la contraseña es obligatoria
            this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.userForm.get('password')?.updateValueAndValidity();
        }
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
        this.userForm.reset(); // Limpiar el formulario al cerrar
        this.userForm.get('rol')?.setValue('Cliente'); // Restablecer el rol por defecto
    }

    crearUsuario() { // Cambiar el parámetro de NgForm a void
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
            return;
        }

        const userData = {
            email: this.userForm.value.email,
            password: this.userForm.value.password,
            rol: this.userForm.value.rol,
        };

        if (this.isEditMode && this.usuarioId !== null) {
            // Si la contraseña está vacía, no la envíes en la actualización
            const updateData: any = {
                email: userData.email,
                rol: userData.rol
            };
            if (userData.password) {
                updateData.password = userData.password;
            }

            this.usuarioService.updateUsuario(this.usuarioId, updateData).subscribe(
                () => {
                    this.userEdited.emit();
                    this.close();
                    console.log('Usuario actualizado');
                },
                (error: any) => {
                    console.error('Error al actualizar al usuario:', error);
                }
            );
        } else {
            this.usuarioService.crearUsuario(userData).subscribe(
                (response) => {
                    this.userCreated.emit();
                    this.close();
                    console.log('Usuario creado: ', response);
                },
                (error) => {
                    console.error('Error al crear al usuario:', error);
                }
            );
        }
    }
}