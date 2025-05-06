import { Component, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  fechaActual = new Date();
  horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
  constructor(){}
  ngOnInit(): void {
    this.fechaActual = new Date();
    setInterval(() => {
      this.horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
  }  
}
