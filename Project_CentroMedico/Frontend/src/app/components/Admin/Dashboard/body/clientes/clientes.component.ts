import { Component } from '@angular/core';
import { ModalCreateComponent } from './modal-create/modal-create.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    ModalCreateComponent
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent {

}
