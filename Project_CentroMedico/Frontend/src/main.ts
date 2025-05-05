import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { Routes } from './app/app.routes';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(Routes)
  ]
});