// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './home-admin/admin-dashboard/admin-dashboard.component';
import { SidebarComponent } from './home-admin/sidebar/sidebar.component';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard }  from '../guards/auth.guard';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DetallePedidoComponent } from './pages/detalle-pedido/detalle-pedido.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: SidebarComponent,
        children: [
        { path: 'dashboard', component: DashboardComponent },
        { path: 'pedidos', component: PedidosComponent },
        { path: 'pedidos/:id', component: DetallePedidoComponent },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
