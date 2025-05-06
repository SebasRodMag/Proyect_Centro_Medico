import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalCreateComponent } from '../usuarios/modal-create/modal-create.component';

@Component({
    selector: 'app-medicos',
    imports: [
        CommonModule, ModalCreateComponent
    ],
    templateUrl: './medicos.component.html',
    styleUrls: ['./medicos.component.css']
})
export class MedicosComponent {

}