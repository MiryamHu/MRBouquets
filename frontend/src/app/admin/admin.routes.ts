import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './home-admin/admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from './home-admin/sidebar/sidebar.component';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard }  from '../guards/auth.guard';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetallePedidoComponent } from './pages/detalle-pedido/detalle-pedido.component';
import { ProductosComponent } from './pages/catalogo/productos/productos.component';
import { FormularioCrearProductoComponent } from './pages/catalogo/formulario-crear-producto/formulario-crear-producto.component';
import { FormularioEditarProductoComponent } from './pages/catalogo/formulario-editar-producto/formulario-editar-producto.component';
import { OcasionesComponent } from './pages/catalogo/ocasiones/ocasiones.component';
import { ClienteComponent } from './pages/cliente/cliente.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: SidebarComponent,
        children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'pedidos', component: PedidosComponent },       
        { path: 'pedidos/:id', component: DetallePedidoComponent },
        { path: 'catalogo/productos', component: ProductosComponent },
        { path: 'catalogo/productos/nuevo', component: FormularioCrearProductoComponent },
        { path: 'catalogo/productos/editar/:id', component: FormularioEditarProductoComponent },
        { path: 'catalogo/ocasiones', component: OcasionesComponent },
        { path: 'clientes', component: ClienteComponent},
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
