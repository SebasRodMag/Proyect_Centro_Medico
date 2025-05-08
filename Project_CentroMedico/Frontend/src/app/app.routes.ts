// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () =>
        import('./components/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () =>
        import('./auth/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'medicos/perfil',
        loadComponent: () =>
        import('./components/medico/medico.component').then((m) => m.MedicoComponent),
    },
    // Rutas para el cliente, Falta crear el controlador y el servicio
/*   {
        path: 'cliente',
        loadComponent: () => import('./components/clinete/cliente.component').then(m => m.ClienteComponent),
    }, */
    {
        path: 'citas',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/citas/citas.component').then((m) => m.CitasComponent),
    },
    {
        path: 'medico',
        loadComponent: () => import('./components/medico/medico.component').then(m => m.MedicoComponent),
    },
    {
        path: 'pacientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
    },
    {
        path: 'usuarios',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
    },
    {
        path: 'cards',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/cards/cards.component').then((m) => m.CardsComponent),
    },
    {
        path: 'logout',
        loadComponent: () =>
        import('./auth/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'clientes/:id/pacientes', 
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
    },    
    {
        path: '**',
        redirectTo: 'home',
    },

    // Rutas para el administrador, Falta crear el controlador y el servicio
    /* {
        path: 'admin',
        loadComponent: () => import('./components/Admin/Dashboard/body/').then(m => m.AdminComponent),
    }, */
];
