import { Routes } from '@angular/router';
import { LoginComponent } from './seguridad/login/login.component';
import { RegistroComponent } from './seguridad/registro/registro.component';
import{ PrincipalComponent } from './home/principal/principal.component';

export const routes: Routes = [
    { path: '', component: PrincipalComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'login', component: LoginComponent },

];
