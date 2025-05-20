import { Component, OnInit } from '@angular/core';
import { AuthService } from '..//../auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [
    CommonModule,
    ReactiveFormsModule
    ]
})
export class LoginComponent implements OnInit {
    errorMessage: string | null = null;
    loginForm!: FormGroup;

    constructor(private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
        this.loginForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required]),
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    // El servicio authService ahora maneja la re dirección
                    console.log('Inicio de sesión exitoso');
                },
                error: (error) => {
                    this.errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
                    console.error('Error al iniciar sesión:', error);
                },
            });
        } else {
            this.errorMessage = 'Por favor, complete el formulario correctamente.';
        }
    }
}
