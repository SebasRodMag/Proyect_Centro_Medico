import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
// El guard que verifica el rol del usuario


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Rutas públicas (login)
    {
        path: 'login',
        loadComponent: () =>
        import('./auth/login/login.component').then((m) => m.LoginComponent),
    },

    // Rutas para el Administrador (protección por rol)
    {
        path: 'home',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/home/home.component').then((m) => m.HomeComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'citas',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/citas/citas.component').then((m) => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'medicos',
        loadComponent: () => import('./components/Admin/Dashboard/body/medicos/medicos.component').then(m => m.MedicosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'pacientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'usuarios',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'cards',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/cards/cards.component').then((m) => m.CardsComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'clientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/clientes/clientes.component').then((m) => m.ClientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'clientes/:id_cliente/pacientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'clientes/:id_cliente/contratos',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/contratos/contratos.component').then((m) => m.ContratosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'medicos/:id_medico/citas/:fecha',
        loadComponent: () => import('./components/Admin/Dashboard/body/citas/citas.component').then(m => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },

    // Ruta por defecto, si no se encuentra ninguna ruta
    {
        path: '**',
        redirectTo: 'home',
    },
];

//13-05-2025 09.35