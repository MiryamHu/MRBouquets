import { Routes } from '@angular/router';
import { LoginComponent } from './seguridad/login/login.component';
import { RegistroComponent } from './seguridad/registro/registro.component';
import { PrincipalComponent } from './home/principal/principal.component';
import { CarritoComponent } from './carrito/carrito.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { LayoutComponent } from './layout/layout.component';
import { ContactoComponent } from './contacto/contacto.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: PrincipalComponent },
      { path: 'registro', component: RegistroComponent },
      { path: 'login', component: LoginComponent },
      { path: 'catalogo', component: CatalogoComponent },
      { path: 'contacto', component: ContactoComponent },
      {
        path: 'carrito',
        component: CarritoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'perfil',
        component: MiPerfilComponent,
        canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '**', redirectTo: '' }
];

