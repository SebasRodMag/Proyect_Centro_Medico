import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../../../services/Paciente-Service/paciente.service';
import { AuthService } from '../../../../../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-modal-create',
    imports: [CommonModule, FormsModule],
    templateUrl: './modal-create.component.html',
    styleUrl: './modal-create.component.css',
})
export class ModalCreateComponent implements OnInit{
    isVisible = false;

    @Output() closed = new EventEmitter<void>();
    @Output() pacienteCreado = new EventEmitter<void>();


    formData = {
        nombre: '',
        apellidos: '',
        dni: '',
        fecha_nacimiento: '',
        email: '',
        password: '',
    };

    clienteId!: string;

    constructor(
        private pacienteService: PacienteService,
        private activatedRoute: ActivatedRoute
    ) {}

    open() {
        this.isVisible = true;
        this.activatedRoute.paramMap.subscribe((params: any) => {
            this.clienteId = params.get('id_cliente')!;
        });
    }

    close() {
        this.isVisible = false;
        this.closed.emit();
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.clienteId = params.get('id_cliente')!;
        });
    }

    onSubmit() {
        if (!this.clienteId) {
            console.error('ID del cliente no disponible.');
            return;
        }

        this.pacienteService
            .createPaciente(this.formData, this.clienteId)
            .subscribe({
                next: (res) => {
                    console.log('Paciente creado:', res);
                    this.close();
                    this.pacienteCreado.emit();
                },
                error: (err) => {
                    console.error('Error al crear paciente:', err);
                },
            });
    }
}
