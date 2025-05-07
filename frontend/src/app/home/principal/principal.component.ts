import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService, Product } from '../../services/cart.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent {
  productos: Product[] = [
    {
      id: 1,
      nombre: 'Bouquet Romántico',
      descripcion: 'Rosas y lirios...',
      img: 'img/Bouquet_Romantico.webp',
      price: 49.99
    },
    {
      id: 2,
      nombre: 'Bouquet Alegre',
      descripcion: 'Colorido y vibrante...',
      img: 'img/Bouquet_Alegre.webp',
      price: 39.50
    },
    {
      id: 3,
      nombre: 'Bouquet Elegante',
      descripcion: 'Orquídeas y tulipanes...',
      img: 'img/Bouquet_Elegante.webp',
      price: 59.00
    },
  ];
  showLoginModal = false;
  isBrowser: boolean;

  constructor(
    public auth: AuthService,
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get userName(): string {
    const u = this.auth.getUser();
    return u?.nombre_usuario ?? u?.nombre ?? '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  onAddToCart(producto: Product): void {
    if (this.auth.isLoggedIn()) {
      this.cartService.add(producto);
    } else {
      this.showLoginModal = true;
    }
  }

  goLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }
}
