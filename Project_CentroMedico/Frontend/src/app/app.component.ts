// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/Admin/Dashboard/body/nav/nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav></app-nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
