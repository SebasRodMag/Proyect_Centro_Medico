import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
  selector: 'app-clientes',
  imports: [
    ModalCreateComponent
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent {

}
