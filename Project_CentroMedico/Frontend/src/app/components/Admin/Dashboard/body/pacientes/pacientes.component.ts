import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService } from '../../../../../services/

'; // Asegúrate de importar el servicio de pacientes correctamente

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit {
    pacientes: any[] = [];
    clienteId!: string;

    constructor(
        private pacienteService: PacienteService, // Asegúrate de que el servicio esté bien importado
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        // Obtener el clienteId de la URL
        this.clienteId = this.route.snapshot.paramMap.get('id')!;
        console.log('Cliente ID:', this.clienteId);

        // Obtener los pacientes del cliente con el servicio
        this.pacienteService.getPacientesDelCliente(this.clienteId).subscribe(
            (data: any[]) => {
                this.pacientes = data; // Asignar los pacientes a la propiedad 'pacientes'
            },
            (error: any) => {
                console.error('Error al obtener los pacientes:', error);
            }
        );
    }
}
