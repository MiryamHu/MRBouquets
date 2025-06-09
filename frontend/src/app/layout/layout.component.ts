import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MenuComponent } from '../home/menu/menu.component';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MenuComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  userName: string = '';
  private userSubscription: Subscription;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {
    // Inicializar el userName con el usuario actual
    const currentUser = this.auth.getUser();
    if (currentUser) {
      this.userName = currentUser.nombre_usuario ?? currentUser.nombre ?? '';
    }

    // Suscribirse a cambios futuros
    this.userSubscription = this.auth.user$.subscribe(user => {
      if (user) {
        this.userName = user.nombre_usuario ?? user.nombre ?? '';
      } else {
        this.userName = '';
      }
    });
  }

  ngOnInit() {
    // Verificar si hay una sesión activa
    // if (!this.auth.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    // }
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
