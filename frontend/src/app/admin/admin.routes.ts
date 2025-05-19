// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard }  from '../guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard, AdminGuard],
        children: [
        // aquí más sub-rutas de admin
        // { path: 'usuarios', component: UsuariosComponent },
        // { path: 'pedidos',  component: PedidosComponent   },
        { path: '', redirectTo: 'usuarios', pathMatch: 'full' }
        ]
    }
];
