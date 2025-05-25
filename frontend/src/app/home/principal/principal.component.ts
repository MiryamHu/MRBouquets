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

export class PrincipalComponent implements OnInit, AfterViewInit {
  productosRegulares: Ramo[] = [];
  productosOcasiones: Ramo[] = [];

  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;

  @ViewChild('mainCanvas', { static: false }) mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('copyCanvas', { static: false }) copyCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('square', { static: false }) square!: ElementRef<HTMLDivElement>;

  private mainCtx: CanvasRenderingContext2D | null = null;
  private copyCtx: CanvasRenderingContext2D | null = null;
  private isZoomActive = false;
  private currentImage: HTMLImageElement | null = null;
  
  private scale   = 1;
  private offsetX = 0;
  private offsetY = 0;


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

  ngAfterViewInit() {
    console.log('ngAfterViewInit ejecutado');
    // No inicializamos los canvas aquí ya que el modal no está visible
  }

  private initializeCanvas() {
    console.log('Inicializando canvas...');
    
    // Solo intentar inicializar si el modal está visible
    if (this.ramoSeleccionado) {
      if (this.mainCanvas?.nativeElement) {
        this.mainCtx = this.mainCanvas.nativeElement.getContext('2d');
        console.log('Canvas principal inicializado:', {
          canvas: this.mainCanvas.nativeElement,
          context: this.mainCtx
        });
      }

      if (this.copyCanvas?.nativeElement) {
        this.copyCtx = this.copyCanvas.nativeElement.getContext('2d');
        this.copyCanvas.nativeElement.width  = 200;
        this.copyCanvas.nativeElement.height = 200;
      }
    } else {
      console.log('Modal no visible, omitiendo inicialización de canvas');
    }
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
    this.abrirDetalles(ramo);
  }

  abrirDetalles(ramo: Ramo): void {
    console.log('Iniciando abrirDetalles con ramo:', ramo);
    this.ramoSeleccionado = ramo;
    this.cantidades[ramo.id] = 1;
  
    // Esperar a que el modal esté en el DOM
    setTimeout(() => {
  
      /* 1.- Reinicializar canvas */
      this.initializeCanvas();
      if (!this.mainCanvas?.nativeElement || !this.mainCtx) {
        console.error('Canvas principal no disponible');
        return;
      }
      // Dimensionar también el canvas de copia
      if (this.copyCanvas?.nativeElement) {
        this.copyCanvas.nativeElement.width  = 200;
        this.copyCanvas.nativeElement.height = 200;
      }
  
      /* 2.- Cargar la imagen */
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imageUrl = `http://localhost/MRBouquets/frontend/public/img/${ramo.img}`;
      console.log('Intentando cargar imagen desde:', imageUrl);
      img.src = imageUrl;
  
      img.onload = () => {
        console.log('Imagen cargada', { w: img.naturalWidth, h: img.naturalHeight });
        this.currentImage = img;
  
        /* 3.- Redimensionar mainCanvas al contenedor */
        const container = this.mainCanvas.nativeElement.parentElement;
        if (container) {
          this.mainCanvas.nativeElement.width  = container.clientWidth;
          this.mainCanvas.nativeElement.height = container.clientHeight;
        }
  
        /* 4.- Calcular escala y offsets */
        this.scale   = Math.min(
          this.mainCanvas.nativeElement.width  / img.width,
          this.mainCanvas.nativeElement.height / img.height
        );
        this.offsetX = (this.mainCanvas.nativeElement.width  - img.width  * this.scale) / 2;
        this.offsetY = (this.mainCanvas.nativeElement.height - img.height * this.scale) / 2;
  
        /* 5.- Dibujar la imagen */
        this.mainCtx.clearRect(
          0, 0,
          this.mainCanvas.nativeElement.width,
          this.mainCanvas.nativeElement.height
        );
        this.mainCtx.drawImage(
          img,
          this.offsetX, this.offsetY,
          img.width  * this.scale,
          img.height * this.scale
        );
      };
  
      img.onerror = err =>
        console.error('Error al cargar la imagen', { err, url: imageUrl });
    }, 100);          // pequeño delay para esperar al modal
  }
  

  cerrarDetalles() {
    this.ramoSeleccionado = null;
    this.isZoomActive = false;
    this.square.nativeElement.style.display = 'none';
    this.copyCanvas.nativeElement.style.display = 'none';
  }

  onMouseMove(event: MouseEvent): void {
    if (
      !this.isZoomActive ||
      !this.currentImage ||
      !this.mainCanvas?.nativeElement ||
      !this.copyCtx ||
      !this.square?.nativeElement
    ) { return; }
  
    /* 1.- Posición del puntero dentro del canvas principal */
    const rect = this.mainCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    /* 2.- Mostrar y posicionar selector */
    this.square.nativeElement.style.display = 'block';
    this.square.nativeElement.style.left   = `${x - 50}px`;
    this.square.nativeElement.style.top    = `${y - 50}px`;
  
    /* 3.- Preparar canvas de copia */
    this.copyCanvas.nativeElement.style.display = 'block';
    this.copyCtx.clearRect(0, 0, 200, 200);
  
    /* 4.- Calcular el área que se va a ampliar */
    const sourceX = ((x - this.offsetX) / this.scale) - 50;
    const sourceY = ((y - this.offsetY) / this.scale) - 50;
  
    /* 5.- Dibujar la ampliación (factor ×2) */
    this.copyCtx.drawImage(
      this.currentImage,
      sourceX, sourceY, 100, 100,   // recorte original
      0, 0, 200, 200                // dibujado ampliado
    );
  }
  

  onMouseLeave() {
    if (this.square?.nativeElement && this.copyCanvas?.nativeElement) {
      this.square.nativeElement.style.display = 'none';
      this.copyCanvas.nativeElement.style.display = 'none';
    }
  }

  toggleZoom() {
    this.isZoomActive = !this.isZoomActive;
    if (!this.isZoomActive && this.square?.nativeElement && this.copyCanvas?.nativeElement) {
      this.square.nativeElement.style.display = 'none';
      this.copyCanvas.nativeElement.style.display = 'none';
    }
  }
}
