// src/app/principal/principal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent {
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  get userName(): string {
    const u = this.auth.getUser();
    // asume que tu objeto usuario tiene 'nombre' o 'nombre_usuario'
    return u?.nombre_usuario ?? u?.nombre ?? '';
  }
}
