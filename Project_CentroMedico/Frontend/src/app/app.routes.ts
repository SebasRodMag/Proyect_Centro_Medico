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
////////////////////////////////////////////////////////////////////////////////


                // Rutas para el ADMINISTRADOR (protección por rol)


////////////////////////////////////////////////////////////////////////////////
    {
        path: 'admin/dashboard/home',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/home/home.component').then((m) => m.HomeComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/citas',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/citas/citas.component').then((m) => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/medicos',
        loadComponent: () => import('./components/Admin/Dashboard/body/medicos/medicos.component').then(m => m.MedicosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/pacientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/usuarios',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/cards',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/cards/cards.component').then((m) => m.CardsComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/clientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/clientes/clientes.component').then((m) => m.ClientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/clientes/:id_cliente/pacientes',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/clientes/:id_cliente/contratos',
        loadComponent: () =>
        import('./components/Admin/Dashboard/body/contratos/contratos.component').then((m) => m.ContratosComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },
    {
        path: 'admin/dashboard/medicos/:id_medico/citas/:fecha',
        loadComponent: () => import('./components/Admin/Dashboard/body/citas/citas.component').then(m => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Administrador' },
    },


    ////////////////////////////////////////////////////////////////////////////////


                    // Rutas para el MÉDICO con protección por rol)


    ////////////////////////////////////////////////////////////////////////////////

    {
        path: 'medico/dashboard/home',
        loadComponent: () =>import('./components/medico/Dashboard/body/citas/citas.component').then((m) => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Medico
        data: { role: 'Medico' },
    },

    
    ////////////////////////////////////////////////////////////////////////////////


                    // Rutas para el PACIENTE con protección por rol)


    ////////////////////////////////////////////////////////////////////////////////

    
    {
        path: 'paciente/dashboard/home',
        loadComponent: () =>import('./components/Paciente/Dashboard/body/home/home.component').then((m) => m.HomeComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Medico
        data: { role: 'Paciente' },
    },
    {
        path: 'paciente/dashboard/citas',
        loadComponent: () => import('./components/Paciente/Dashboard/citas/citas.component').then(m => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],  // Verifica si está logueado y es Administrador
        data: { role: 'Paciente' },
    },


    ////////////////////////////////////////////////////////////////////////////////


                    // Rutas para el CLIENTE con protección por rol)


    ////////////////////////////////////////////////////////////////////////////////
    

    {
        path: 'cliente/dashboard/home',
        loadComponent: () =>import('./components/Cliente/Dashboard/body/home/home.component').then((m) => m.HomeComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'Cliente' },
    },
    {
        path: 'cliente/dashboard/citas',
        loadComponent: () =>import('./components/Cliente/Dashboard/body/citas/citas.component').then((m) => m.CitasComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'Cliente' },
    },
    {
        path: 'cliente/dashboard/pacientes',
        loadComponent: () =>import('./components/Cliente/Dashboard/body/pacientes/pacientes.component').then((m) => m.PacientesComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'Cliente' },
    },
    {
        path: 'cliente/dashboard/contratos',
        loadComponent: () =>import('./components/Cliente/Dashboard/body/contratos/contratos.component').then((m) => m.ContratosComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { role: 'Cliente' },
    },
    // Ruta por defecto, si no se encuentra ninguna ruta
    {
        path: '**',
        redirectTo: 'login',
    },
];

//13-05-2025 09.35