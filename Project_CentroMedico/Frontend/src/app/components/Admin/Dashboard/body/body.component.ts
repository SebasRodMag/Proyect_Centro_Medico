import { Component } from '@angular/core';
import { NavComponent } from './nav/nav.component';
import { ClientesComponent } from './clientes/clientes.component';

@Component({
  selector: 'app-body',
  imports: [
    NavComponent, ClientesComponent
  ],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent {

}
