import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });

        if (this.authService.isLoggedIn()) {
            const rol = this.authService.getRol();
            if (rol === 'Administrador') {
                this.router.navigate(['/home']);
            } else if (rol === 'Medico') {
                this.router.navigate(['/medicos/perfil']);
            } else if (rol === 'Cliente') {
                this.router.navigate(['/clientes']);
            }
        }
    }

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {},
            error: (error) => {
                this.errorMessage = 'Credenciales incorrectas';
                console.error('Error al loguearse:', error);
            },
        });
    }
}
