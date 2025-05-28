import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { Router, RouterModule  } from '@angular/router';

@Component({
  selector: 'app-datos-usuario',
  standalone: true, 
  imports: [CommonModule, RouterModule],
  templateUrl: './datos-usuario.component.html',
  styleUrl: './datos-usuario.component.css'
})
export class DatosUsuarioComponent implements OnInit{
    userData: User | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // AuthService.getUser() devuelve ya el usuario almacenado
    this.userData = this.auth.getUser();
  }

  get puedeCambiarContrasena(): boolean {
  return this.userData?.loginProvider !== 'google';
}

  modificarDatos(){
    this.router.navigate(['/perfil', 'actualizarDatos']);

  }

  cambiarContrasena(){
    this.router.navigate(['/perfil', 'cambiarPassword']);
  }
}
