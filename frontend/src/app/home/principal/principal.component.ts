import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { RamosService, Ramo } from '../../services/ramos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule ],
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
  ramoSeleccionado: Ramo | null = null;
  cantidades: { [key: number]: number } = {};
  
  // Propiedades para el carrusel
  currentIndexRegulares = 0;
  currentIndexOcasiones = 0;
  itemsPerPage = 4;

  constructor(
    public auth: AuthService,
    private ramosService: RamosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private cartService: CartService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Métodos para el carrusel de productos regulares
  get productosRegularesVisibles(): Ramo[] {
    return this.productosRegulares.slice(
      this.currentIndexRegulares,
      this.currentIndexRegulares + this.itemsPerPage
    );
  }

  get productosOcasionesVisibles(): Ramo[] {
    return this.productosOcasiones.slice(
      this.currentIndexOcasiones,
      this.currentIndexOcasiones + this.itemsPerPage
    );
  }

  nextRegulares(): void {
    if (this.currentIndexRegulares + this.itemsPerPage < this.productosRegulares.length) {
      this.currentIndexRegulares += this.itemsPerPage;
    }
  }

  prevRegulares(): void {
    if (this.currentIndexRegulares > 0) {
      this.currentIndexRegulares -= this.itemsPerPage;
    }
  }

  nextOcasiones(): void {
    if (this.currentIndexOcasiones + this.itemsPerPage < this.productosOcasiones.length) {
      this.currentIndexOcasiones += this.itemsPerPage;
    }
  }

  prevOcasiones(): void {
    if (this.currentIndexOcasiones > 0) {
      this.currentIndexOcasiones -= this.itemsPerPage;
    }
  }
  // Getters para controlar la visibilidad de los botones de navegación
  get showPrevRegulares(): boolean {
    return this.currentIndexRegulares > 0;
  }

  get showNextRegulares(): boolean {
    return this.currentIndexRegulares + this.itemsPerPage < this.productosRegulares.length;
  }

  get showPrevOcasiones(): boolean {
    return this.currentIndexOcasiones > 0;
  }

  get showNextOcasiones(): boolean {
    return this.currentIndexOcasiones + this.itemsPerPage < this.productosOcasiones.length;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (this.isBrowser) {
      const sections = document.querySelectorAll('.seccion-destacados, .seccion-ocasiones, .seccion-novedades');
      const banner = document.querySelector('.seccion-banner');
      
      if (banner) {
        const scrolled = window.scrollY > 50;
        if (scrolled) {
          banner.classList.add('scrolled');
        } else {
          banner.classList.remove('scrolled');
        }
      }
      
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
  }

  ngOnDestroy() {
  }

  private loadRamos(): void {
    this.loading = true;
    // Cargar ramos regulares
    this.ramosService.getRamosRegulares().subscribe({
      next: (ramos) => {
        this.productosRegulares = ramos;
        // Inicializar cantidades para ramos regulares
        ramos.forEach(ramo => {
          this.cantidades[ramo.id] = 1;
        });
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
        // Inicializar cantidades para ramos de ocasiones
        ramos.forEach(ramo => {
          this.cantidades[ramo.id] = 1;
        });
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

  incrementarCantidad(id: number): void {
    if (this.cantidades[id] < 99) {
      this.cantidades[id]++;
    }
  }

  decrementarCantidad(id: number): void {
    if (this.cantidades[id] > 1) {
      this.cantidades[id]--;
    }
  }

  onAddToCart(producto: Ramo): void {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal = true;
      return;
    }
    const cantidad = this.cantidades[producto.id] || 1;
    for (let i = 0; i < cantidad; i++) {
      this.cartService.add(producto);
    }
    // Cerrar el modal de detalles si está abierto
    this.ramoSeleccionado = null;
    // Redirigir al carrito
    this.router.navigate(['/carrito']);
  }

  goLogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
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

  verDetalles(ramo: Ramo): void {
    this.ramoSeleccionado = ramo;
  }

  cerrarDetalles(): void {
    this.ramoSeleccionado = null;
  }
}
