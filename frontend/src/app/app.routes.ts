import { Routes } from '@angular/router';
import { LoginComponent } from './seguridad/login/login.component';
import { RegistroComponent } from './seguridad/registro/registro.component';
import { PrincipalComponent } from './home/principal/principal.component';
import { CarritoComponent } from './carrito/carrito.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { CatalogoComponent } from './catalogo/catalogo.component';

export const routes: Routes = [
  { path: '',           component: PrincipalComponent },
  { path: 'registro',   component: RegistroComponent },
  { path: 'login',      component: LoginComponent },
  { path: 'carrito',    component: CarritoComponent },
  { path: 'perfil',     component: MiPerfilComponent },
  { path: 'catalogo',   component: CatalogoComponent },
  // { path: '**',       redirectTo: '' } // opcional: ruta fallback
];
