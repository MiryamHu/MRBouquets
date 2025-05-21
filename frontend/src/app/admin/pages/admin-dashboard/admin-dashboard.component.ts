import { Component } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule, Router }   from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { SidebarComponent } from '../../home-admin/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
    constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
