import { Routes } from '@angular/router';
import { CitasComponent } from './components/Admin/Dashboard/body/citas/citas.component';
import { ClientesComponent } from './components/Admin/Dashboard/body/clientes/clientes.component';
import { MedicosComponent } from './components/Admin/Dashboard/body/medicos/medicos.component';
import { UsuariosComponent } from './components/Admin/Dashboard/body/usuarios/usuarios.component';

export const routes: Routes = [
    { path: '', redirectTo: 'admin', pathMatch: 'full'},
    { path: 'citas', component: CitasComponent},
    { path: 'clientes', component: ClientesComponent},
    { path: 'medicos', component: MedicosComponent},
    { path: 'usuarios', component: UsuariosComponent},
];
