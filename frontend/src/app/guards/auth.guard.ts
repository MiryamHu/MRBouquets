import { CanActivate, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth   = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}