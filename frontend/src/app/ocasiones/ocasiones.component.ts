import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RamosService, Ramo, Ocasion } from '../services/ramos.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ocasiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ocasiones.component.html',
  styleUrls: ['./ocasiones.component.css']
})
export class OcasionesComponent implements OnInit, AfterViewInit {
  // ramos y filtros
  ramos: Ramo[] = [];
  ramosFiltrados: Ramo[] = [];
  cantidades: { [id: number]: number } = {};
  filtros = {
    busqueda: '',
    tipoFlor: '',
    color: '',
    precioMin: null as number | null,
    precioMax: null as number | null
  };
  tiposFlor: string[] = [];
  colores: string[] = [];

  // ocasión seleccionada
  ocasiones: Ocasion[] = [];
  ocasionId: number | null = null;
  ocasionNombre = '';

    public showLoginModal: boolean = false;
    
  // modal & lupa
  @ViewChild('mainCanvas', { static: false }) mainCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('copyCanvas', { static: false }) copyCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('square',     { static: false }) square!: ElementRef<HTMLDivElement>;
  ramoSeleccionado: Ramo | null = null;
  private mainCtx!: CanvasRenderingContext2D;
  private copyCtx!: CanvasRenderingContext2D;
  private currentImage!: HTMLImageElement;
  private isZoomActive = false;
  private isBrowser: boolean;

  constructor(
    private ramosService: RamosService,
    private route: ActivatedRoute,
    private cartService: CarritoService,
    public auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // 1) Leer queryParam de la ocasión
    this.route.queryParams.subscribe(params => {
      this.ocasionId = params['oc'] ? +params['oc'] : null;
      this.loadOcasiones();  // recarga ocasiones y ramos siempre que cambie el param
    });
  }

  private loadOcasiones() {
    // 2) Cargar lista de ocasiones para mostrar nombre
    this.ramosService.getOcasiones().subscribe({
      next: oc => {
        this.ocasiones = oc;
        const sel = this.ocasiones.find(o => o.id === this.ocasionId);
        this.ocasionNombre = sel ? sel.nombre : '';
        this.loadRamosOcasiones();
      },
      error: err => console.error('Error cargando ocasiones', err)
    });
  }

  private loadRamosOcasiones() {
    // 3) Traer sólo ramos de ocasión y filtrar por id_ocasion
    this.ramosService.getRamosOcasiones().subscribe({
      next: all => {
        this.ramos = this.ocasionId
          ? all.filter(r => r.id_ocasion === this.ocasionId)
          : all;
        // Init cantidades y filtros
        this.ramos.forEach(r => this.cantidades[r.id] = 1);
        this.extraerOpciones();
        this.aplicarFiltros();
      },
      error: err => console.error('Error cargando ramosOcasiones', err)
    });
  }

  // ===== Filtros (idénticos a tu lógica actual) =====
  extraerOpciones(): void {
    this.tiposFlor = [...new Set(this.ramos.map(r => r.tipo_flor))];
    this.colores   = [...new Set(this.ramos.map(r => r.color))];
  }

  aplicarFiltros(): void {
    this.ramosFiltrados = this.ramos.filter(ramo => {
      const b = !this.filtros.busqueda ||
        ramo.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) ||
        ramo.descripcion.toLowerCase().includes(this.filtros.busqueda.toLowerCase());
      const t = !this.filtros.tipoFlor || ramo.tipo_flor === this.filtros.tipoFlor;
      const c = !this.filtros.color   || ramo.color     === this.filtros.color;
      const min = !this.filtros.precioMin || ramo.precio >= this.filtros.precioMin!;
      const max = !this.filtros.precioMax || ramo.precio <= this.filtros.precioMax!;
      return b && t && c && min && max ;
    });
  }

  limpiarFiltros(): void {
    this.filtros = { busqueda: '', tipoFlor: '', color: '', precioMin: null, precioMax: null };
    this.aplicarFiltros();
  }

  // ===== Carrito & Login =====
  incrementarCantidad(id: number)   { if (this.cantidades[id] < 99) this.cantidades[id]++; }
  decrementarCantidad(id: number)   { if (this.cantidades[id] > 1) this.cantidades[id]--; }

    onAddToCart(producto: Ramo): void {
    if (!this.auth.isLoggedIn()) {
      this.ramoSeleccionado = null;
      this.showLoginModal = true;
      return;
    }
    const cantidad = this.cantidades[producto.id] || 1;
    this.cartService.agregarArticulo(producto.id, cantidad).subscribe({
      next: () => {
        this.cartService.open();
      },
      error: err => console.error('Error al añadir al carrito', err)
    });
    // Cierra el modal de detalles si está abierto
    this.ramoSeleccionado = null;
  }


  irALogin() {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }

  // ===== Modal & Lupa (idéntico a Principal) =====
  ngAfterViewInit(): void {
    if (this.copyCanvas?.nativeElement) {
      this.copyCtx = this.copyCanvas.nativeElement.getContext('2d')!;
    }
  }

  verDetalles(r: Ramo): void {
    this.ramoSeleccionado = r;
    setTimeout(() => {
      if (!this.mainCanvas) return;
      this.initializeCanvas();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `http://localhost/MRBouquets/frontend/public/img/${r.img}`;
      img.onload  = () => this.drawToCanvas(img);
    }, 50);
  }

  private initializeCanvas() {
    if (!this.isBrowser) return;
    const mc = this.mainCanvas.nativeElement;
    this.mainCtx = mc.getContext('2d')!;
    this.square.nativeElement.style.display    = 'none';
    this.copyCanvas.nativeElement.style.display = 'none';
  }

  private drawToCanvas(img: HTMLImageElement) {
    const mc = this.mainCanvas.nativeElement;
    // ajustar al contenedor
    const cont = mc.parentElement;
    if (cont) {
      mc.width  = cont.clientWidth;
      mc.height = cont.clientHeight;
    }
    const scale   = Math.min(mc.width / img.width, mc.height / img.height);
    const offX    = (mc.width  - img.width  * scale) / 2;
    const offY    = (mc.height - img.height * scale) / 2;
    this.mainCtx.clearRect(0, 0, mc.width, mc.height);
    this.mainCtx.drawImage(img, offX, offY, img.width * scale, img.height * scale);
    // preparar imagen de lupa
    this.currentImage = img;
    this.copyCanvas.nativeElement.width  = 200;
    this.copyCanvas.nativeElement.height = 200;
  }

  toggleZoom() {
    this.isZoomActive = !this.isZoomActive;
    this.square.nativeElement.style.display    = this.isZoomActive ? 'block' : 'none';
    this.copyCanvas.nativeElement.style.display = this.isZoomActive ? 'block' : 'none';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(evt: MouseEvent) {
    if (!this.isZoomActive || !this.currentImage) return;
    const rect = this.mainCanvas.nativeElement.getBoundingClientRect();
    const x = evt.clientX - rect.left, y = evt.clientY - rect.top;
    // mover selector
    const sq = this.square.nativeElement;
    sq.style.left    = `${x - 50}px`;
    sq.style.top     = `${y - 50}px`;
    // dibujar lupa
    const cc = this.copyCanvas.nativeElement;
    this.copyCtx.clearRect(0, 0, cc.width, cc.height);
    this.copyCtx.drawImage(
      this.currentImage,
      (x - rect.left) / (rect.width  / this.currentImage.width) - 50,
      (y - rect.top ) / (rect.height / this.currentImage.height) - 50,
      100, 100,
      0, 0,
      cc.width, cc.height
    );
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.square.nativeElement.style.display    = 'none';
    this.copyCanvas.nativeElement.style.display = 'none';
  }

  cerrarDetalles() {
    this.ramoSeleccionado = null;
    this.isZoomActive = false;
  }
}
