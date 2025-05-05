import { Component } from '@angular/core';
<<<<<<< Updated upstream
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/Admin/Dashboard/header/header.component';
import { BodyComponent } from './components/Admin/Dashboard/body/body.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, BodyComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Frontend';
=======

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
>>>>>>> Stashed changes
}
