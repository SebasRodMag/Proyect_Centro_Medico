import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCreateComponent } from './modal-create/modal-create.component';
import { UsuariosService } from '../../../../../services/Usuario-Service/usuarios.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-usuarios',
    imports: [
        CommonModule, ModalCreateComponent
    ],
    templateUrl: './usuarios.component.html',
    styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
    usuarios: any[] = [];
    
    constructor(
        private usuarioService: UsuariosService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.getUsuarios();
    }

    getUsuarios() {
        this.usuarioService.getUsuarios().subscribe(
            (data: any[]) => {
                this.usuarios = data;
            },
            (error: any) => {
                console.error('Error al obtener los usuarios:', error);
            }
        );
    }
}