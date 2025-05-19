import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../home/menu/menu.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, MenuComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})

export class LayoutComponent {
  userName: string = '';

  constructor(public auth: AuthService) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      const user = this.auth.getUser();
      this.userName = user?.nombre_usuario ?? user?.nombre ?? '';
    }
  }

  logout() {
    this.auth.logout();
    window.location.href = '/';
  }
}
