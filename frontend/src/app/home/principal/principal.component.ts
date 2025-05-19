import { Component, Inject, PLATFORM_ID, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { RamosService, Ramo } from '../../services/ramos.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})

export class PrincipalComponent implements OnInit {
  productos: Ramo[] = [];

  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  showLoginModal = false;
  isBrowser: boolean;
  error: string = '';
  loading: boolean = true;

  constructor(
    public auth: AuthService,
    private cartService: CartService,
    private ramosService: RamosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }



  ngOnInit(): void {
    this.loadRamos();
  }

  
  private loadRamos(): void {
    this.loading = true;
    this.ramosService.getRamos().subscribe({
      next: (ramos) => {
        this.productos = ramos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los ramos:', err);
        this.error = 'Error al cargar los productos. Por favor, intente más tarde.';
        this.loading = false;
      }
    });
  }

  get userName(): string {
    const u = this.auth.getUser();
    return u?.nombre_usuario ?? u?.nombre ?? '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  onAddToCart(producto: Ramo): void {
    if (this.auth.isLoggedIn()) {
      this.cartService.add(producto);
      this.cartService.open(); 
    } else {
      this.showLoginModal = true;
    }
  }

  goLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }
}
