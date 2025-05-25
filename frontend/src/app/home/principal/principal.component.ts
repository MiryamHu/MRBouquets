import { Component, Inject, PLATFORM_ID, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CarritoService } from '../../services/carrito.service';
import { RamosService, Ramo } from '../../services/ramos.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, FormsModule],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})

export class PrincipalComponent implements OnInit {
  productosRegulares: Ramo[] = [];
  productosOcasiones: Ramo[] = [];

  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;


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

  isZoomActive = false;

  private zoomLevel = 2.5; // Nivel de zoom
  private isZooming = false;
  private zoomContainer: HTMLElement | null = null;
  private zoomImage: HTMLElement | null = null;
  private zoomLens: HTMLElement | null = null;

  constructor(
    public auth: AuthService,
    private ramosService: RamosService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private carritoService: CarritoService
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
    this.carritoService.agregarArticulo(producto.id, cantidad).subscribe({
      next: () => {
        this.carritoService.open();
      },
      error: err => console.error('Error al añadir al carrito', err)
    });
    // Cierra el modal de detalles si está abierto
    this.ramoSeleccionado = null;
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

  toggleZoom() {
    this.isZoomActive = !this.isZoomActive;
    const modalImagen = document.querySelector('.modal-imagen') as HTMLElement;
    
    if (modalImagen) {
      if (this.isZoomActive) {
        // Asegurarnos de que la imagen esté cargada antes de inicializar el zoom
        const img = modalImagen.querySelector('img');
        if (img) {
          if (img.complete) {
            this.initializeZoom(modalImagen);
          } else {
            img.onload = () => {
              this.initializeZoom(modalImagen);
            };
          }
        }
      } else {
        this.cleanupZoom();
      }
    }
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.isZooming || !this.zoomLens || !this.zoomContainer || !this.zoomImage) return;

    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const img = container.querySelector('img');
    
    if (!img) return;

    // Calcular posición del lente
    const lensSize = 150; // Tamaño del lente de zoom
    let x = e.clientX - rect.left - lensSize / 2;
    let y = e.clientY - rect.top - lensSize / 2;
    
    // Mantener el lente dentro de los límites
    x = Math.max(0, Math.min(x, rect.width - lensSize));
    y = Math.max(0, Math.min(y, rect.height - lensSize));
    
    // Calcular el factor de zoom basado en el tamaño de la imagen original
    const zoomFactor = img.naturalWidth / rect.width;
    
    // Actualizar posición del lente
    this.zoomLens.style.display = 'block';
    this.zoomLens.style.left = `${x}px`;
    this.zoomLens.style.top = `${y}px`;
    
    // Actualizar vista ampliada
    this.zoomContainer.style.display = 'block';
    this.zoomImage.style.backgroundImage = `url(${img.src})`;
    this.zoomImage.style.backgroundSize = `${img.naturalWidth}px ${img.naturalHeight}px`;
    this.zoomImage.style.backgroundPosition = `-${x * zoomFactor}px -${y * zoomFactor}px`;
  }

  private initializeZoom(container: HTMLElement) {
    // Limpiar cualquier zoom existente
    this.cleanupZoom();

    // Crear elementos para el zoom
    this.zoomContainer = document.createElement('div');
    this.zoomContainer.className = 'zoom-container';
    this.zoomContainer.style.display = 'none';
    
    this.zoomLens = document.createElement('div');
    this.zoomLens.className = 'zoom-lens';
    this.zoomLens.style.display = 'none';
    
    this.zoomImage = document.createElement('div');
    this.zoomImage.className = 'zoom-image';
    
    // Configurar el contenedor
    container.style.position = 'relative';
    container.appendChild(this.zoomLens);
    container.appendChild(this.zoomContainer);
    this.zoomContainer.appendChild(this.zoomImage);
    
    // Configurar eventos
    const boundHandleMouseMove = this.handleMouseMove.bind(this);
    container.addEventListener('mousemove', boundHandleMouseMove);
    
    container.addEventListener('mouseenter', () => {
      if (this.isZoomActive) {
        this.isZooming = true;
        const img = container.querySelector('img');
        if (img) {
          img.style.cursor = 'none';
        }
      }
    });
    
    container.addEventListener('mouseleave', () => {
      this.isZooming = false;
      if (this.zoomLens) {
        this.zoomLens.style.display = 'none';
      }
      if (this.zoomContainer) {
        this.zoomContainer.style.display = 'none';
      }
      const img = container.querySelector('img');
      if (img) {
        img.style.cursor = 'zoom-in';
      }
    });
  }

  private cleanupZoom() {
    if (this.zoomLens) {
      this.zoomLens.remove();
      this.zoomLens = null;
    }
    if (this.zoomContainer) {
      this.zoomContainer.remove();
      this.zoomContainer = null;
    }
    this.zoomImage = null;
  }

  ngOnDestroy() {
    this.cleanupZoom();
  }
}
