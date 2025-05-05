import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
  selector: 'app-medicos',
  imports: [
    CommonModule, ModalCreateComponent
  ],
  templateUrl: './medicos.component.html',
  styleUrl: './medicos.component.css'
})
export class MedicosComponent {

}
=======
import { ModalCreateComponent } from '../usuarios/modal-create/modal-create.component';

@Component({
    selector: 'app-medicos',
    imports: [
        CommonModule, ModalCreateComponent
    ],
    templateUrl: './medicos.component.html',
    styleUrl: './medicos.component.css'
})
export class MedicosComponent {

}
>>>>>>> Stashed changes
