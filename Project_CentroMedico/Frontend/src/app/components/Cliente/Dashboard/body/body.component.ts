import { Component } from '@angular/core';
import { NavComponent } from '../header/nav/nav.component';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-body',
  imports: [
    RouterOutlet, 
  ],
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent {

}