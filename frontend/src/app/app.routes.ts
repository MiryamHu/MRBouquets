import { Routes } from '@angular/router';
import { LoginComponent } from './seguridad/login/login.component';
import { RegistroComponent } from './seguridad/registro/registro.component';
import { PrincipalComponent } from './home/principal/principal.component';
import { CarritoComponent } from './carrito/carrito.component';
import { PrincipalPerfilComponent } from './mi-perfil/principal-perfil/principal-perfil.component';
import { CatalogoComponent } from './catalogo/catalogo.component';
import { LayoutComponent } from './layout/layout.component';
import { ContactoComponent } from './contacto/contacto.component';
import { GarantiaComponent } from './garantia/garantia.component';
import { EnviosComponent } from './envios/envios.component';

import { DatosUsuarioComponent } from './mi-perfil/datos-usuario/datos-usuario.component';
import { DireccionesUsuarioComponent } from './mi-perfil/direcciones-usuario/direcciones-usuario.component';
import { PedidosUsuarioComponent } from './mi-perfil/pedidos-usuario/pedidos-usuario.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ActualizarDatosPerfilComponent } from './formularios/actualizar-datos-perfil/actualizar-datos-perfil.component';
import {CambiarPasswordComponent} from './formularios/cambiar-password/cambiar-password.component';
import { FaqComponent } from './faq/faq.component';
import { ADMIN_ROUTES } from './admin/admin.routes';

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
      { path: 'garantia', component: GarantiaComponent },
      { path: 'envios', component: EnviosComponent },
      {
        path: 'carrito',
        component: CarritoComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'perfil',
        component: PrincipalPerfilComponent,
        children: [
          { path: '', redirectTo: 'datos', pathMatch: 'full' },
          { path: 'datos', component: DatosUsuarioComponent },
          { path: 'direcciones', component: DireccionesUsuarioComponent },
          { path: 'pedidos', component: PedidosUsuarioComponent },
          { path: 'actualizarDatos', component: ActualizarDatosPerfilComponent},
          { path: 'cambiarPassword', component: CambiarPasswordComponent},
        ]
      },
    ]
  },
  {
    path: 'admin',
    children: ADMIN_ROUTES,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  { path: '**', redirectTo: '' }
];

