import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  link?: string;
  submenu?: SubmenuItem[];
  open?: boolean;
}

interface SubmenuItem {
  name: string;
  link: string;
}
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  // controla si la sidebar está contraída
  isClosed = true;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  // definición de todo el menú
  menu: MenuItem[] = [
    { name: 'Dashboard', icon: 'bx bx-grid-alt', link: '/admin/dashboard' },
    { name: 'Pedidos', icon: 'bx bx-grid-alt', link: '/admin/pedidos' },

    {
      name: 'Catálogo',
      icon: 'bx bx-book-alt',
      submenu: [
      { name: 'Productos', link: '/admin/catalogo/productos' },
      { name: 'Ocasiones', link: '/admin/catalogo/ocasiones' },
    ],
      open: false
    },
    { name: 'Clientes', icon: 'bx bx-pie-chart-alt-2', link: '/admin/clientes' },
  ];

  toggleSidebar() {
    this.isClosed = !this.isClosed;
  }

  toggleSubmenu(idx: number) {
    this.menu[idx].open = !this.menu[idx].open;
  }

    logoutAdmin() {
      this.auth.logout();
      this.router.navigate(['/']);
    
  }
}
