import { CanActivate, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private auth   = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    const user = this.auth.getUser();
    if (user?.rol === 'admin') return true;
    // si está logueado pero no es admin, le mandas al home
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
