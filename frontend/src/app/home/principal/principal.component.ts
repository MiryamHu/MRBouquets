import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { RamosService, Ramo } from '../../services/ramos.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit, OnDestroy {
  productosRegulares: Ramo[] = [];
  productosOcasiones: Ramo[] = [];
  showLoginModal = false;
  isBrowser: boolean;
  error: string = '';
  loading: boolean = true;

  // Variables para el carrusel
  currentSlide: number = 0;
  slideOffset: number = 0;
  autoSlideInterval: any;

  constructor(
    public auth: AuthService,
    private ramosService: RamosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (this.isBrowser) {
      const sections = document.querySelectorAll('.seccion-destacados, .seccion-ocasiones, .seccion-novedades');
      
      sections.forEach((section: Element) => {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.85) {
          section.classList.add('visible');
        }
      });
    }
  }

  ngOnInit(): void {
    this.loadRamos();
    if (this.isBrowser) {
      this.startAutoSlide();
      // Trigger initial check
      setTimeout(() => this.onWindowScroll(), 100);
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private loadRamos(): void {
    this.loading = true;
    // Cargar ramos regulares
    this.ramosService.getRamosRegulares().subscribe({
      next: (ramos) => {
        this.productosRegulares = ramos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los ramos regulares:', err);
        this.error = 'Error al cargar los productos. Por favor, intente más tarde.';
        this.loading = false;
      }
    });

    // Cargar ramos de ocasiones especiales
    this.ramosService.getRamosOcasiones().subscribe({
      next: (ramos) => {
        this.productosOcasiones = ramos;
      },
      error: (err) => {
        console.error('Error al cargar los ramos de ocasiones:', err);
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
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal = true;
      return;
    }
    this.cartService.add(producto);
  }

  goLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }

  // Métodos del carrusel
  public startAutoSlide(): void {
    if (this.isBrowser) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, 3000);
    }
  }

  public stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  public nextSlide(): void {
    const totalSlides = this.productosOcasiones.length;
    this.currentSlide = (this.currentSlide + 1) % totalSlides;
    this.updateSlideOffset();
    this.resetAutoplay();
  }

  public prevSlide(): void {
    const totalSlides = this.productosOcasiones.length;
    this.currentSlide = (this.currentSlide - 1 + totalSlides) % totalSlides;
    this.updateSlideOffset();
    this.resetAutoplay();
  }

  public goToSlide(index: number): void {
    const totalSlides = this.productosOcasiones.length;
    if (index >= 0 && index < totalSlides) {
      this.currentSlide = index;
      this.updateSlideOffset();
      this.resetAutoplay();
    }
  }

  private updateSlideOffset(): void {
    this.slideOffset = -this.currentSlide * 100;
  }

  private resetAutoplay(): void {
    if (this.isBrowser) {
      this.stopAutoSlide();
      this.startAutoSlide();
    }
  }

  public getIconForOcasion(ocasion: Ramo): string {
    const nombreLower = ocasion.nombre.toLowerCase();
    if (nombreLower.includes('cumpleaños')) {
      return 'fas fa-birthday-cake';
    } else if (nombreLower.includes('aniversario')) {
      return 'fas fa-heart';
    } else if (nombreLower.includes('graduación')) {
      return 'fas fa-graduation-cap';
    } else if (nombreLower.includes('pésame') || nombreLower.includes('condolencias')) {
      return 'fas fa-dove';
    }
    return 'fas fa-gift'; // Ícono por defecto
  }
}
