import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  name: string;
  icon: string;
  link?: string;
  submenu?: string[];
  open?: boolean;
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
      name: 'Inventario',
      icon: 'bx bx-book-alt',
      submenu: ['Web Design', 'Login Form', 'Card Design'],
      open: false
    },
    { name: 'Clientes', icon: 'bx bx-pie-chart-alt-2', link: '/analytics' },
    // { name: 'Chart',     icon: 'bx bx-line-chart',         link: '/chart' },
    {
      name: 'Reportes',
      icon: 'bx bx-plug',
      submenu: ['UI Face', 'Pigments', 'Box Icons'],
      open: false
    },
    // { name: 'Explore', icon: 'bx bx-compass', link: '/explore' },
    // { name: 'History', icon: 'bx bx-history', link: '/history' },
    // { name: 'Setting', icon: 'bx bx-cog',     link: '/setting' }
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
