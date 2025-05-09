import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Inicializamos el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Validación de email
      password: ['', Validators.required] // Validación de contraseña
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    console.log('Formulario enviado');
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log('Inicio de sesión exitoso');
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }
}