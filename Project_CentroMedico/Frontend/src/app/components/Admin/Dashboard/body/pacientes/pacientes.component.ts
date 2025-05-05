import { Component } from '@angular/core';
<<<<<<< Updated upstream
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
  selector: 'app-pacientes',
  imports: [
    ModalCreateComponent
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent {

}
=======
import { ModalCreateComponent } from '../usuarios/modal-create/modal-create.component';

@Component({
    selector: 'app-pacientes',
    imports: [
        ModalCreateComponent
    ],
    templateUrl: './pacientes.component.html',
    styleUrl: './pacientes.component.css'
})
export class PacientesComponent {

}
>>>>>>> Stashed changes
