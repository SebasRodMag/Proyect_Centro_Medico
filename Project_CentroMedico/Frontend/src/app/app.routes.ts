import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CitasComponent } from '../app/components/Admin/Dashboard/body/citas/citas.component';
import { ClientesComponent } from '../app/components/Admin/Dashboard/body/clientes/clientes.component';
import { MedicosComponent } from '../app/components/Admin/Dashboard/body/medicos/medicos.component';
import { PacientesComponent } from '../app/components/Admin/Dashboard/body/pacientes/pacientes.component';
import { CardsComponent } from '../app/components/Admin/Dashboard/body/cards/cards.component';
import { NavComponent } from '../app/components/Admin/Dashboard/body/nav/nav.component';
import { BodyComponent } from '../app/components/Admin/Dashboard/body/body.component';

// Para cuando implementemos el Home y Login
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
    { path: '', component: HomeComponent }, // Página principal
    { path: 'login', component: LoginComponent },
    { path: 'citas', component: CitasComponent },
    { path: 'clientes', component: ClientesComponent },
    { path: 'medicos', component: MedicosComponent },
    { path: 'pacientes', component: PacientesComponent },
    { path: 'cards', component: CardsComponent },
    { path: 'nav', component: NavComponent },
    { path: 'body', component: BodyComponent },
    { path: '**', redirectTo: '' }, // Redirección a Home si no se encuentra la ruta
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

