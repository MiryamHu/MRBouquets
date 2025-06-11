import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RamosService } from '../services/ramos.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { RouterModule,Router } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';

interface Ramo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  img: string;
  tipo_flor: string;
  color: string;
  activo: boolean;
  disponible: boolean;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent, MatButtonModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  ramos: Ramo[] = [];
  ramosFiltrados: Ramo[] = [];
  loading = true;
  error = '';
  showLoginModal = false;
  ramoSeleccionado: Ramo | null = null;
  cantidades: { [key: number]: number } = {};

  @ViewChild('mainCanvas', { static: false }) mainCanvas!: ElementRef<HTMLCanvasElement>;

  // Filtros
  filtros = {
    busqueda: '',
    tipoFlor: '',
    color: '',
    precioMin: null as number | null,
    precioMax: null as number | null
  };

  // Opciones de filtro
  tiposFlor: string[] = [];
  colores: string[] = [];

  constructor(
    private ramosService: RamosService,
    private cartService: CarritoService,
    public auth: AuthService,
    private router: Router
  ) {
    console.log('DI check →',
    { ramosService, cartService, auth, router } );
  }

  ngOnInit(): void {
    this.cargarRamos();
  }

  cargarRamos(): void {
    this.loading = true;
    this.ramosService.getRamos().subscribe({
      next: (ramos) => {
        this.ramos = ramos;
        this.extraerOpciones();
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los ramos:', err);
        this.error = 'Error al cargar el catálogo. Por favor, intente más tarde.';
        this.loading = false;
      }
    });
  }

  extraerOpciones(): void {
    // Extraer tipos de flor únicos
    this.tiposFlor = [...new Set(this.ramos.map(ramo => ramo.tipo_flor))];
    // Extraer colores únicos
    this.colores = [...new Set(this.ramos.map(ramo => ramo.color))];
  }

  aplicarFiltros(): void {
    this.ramosFiltrados = this.ramos.filter(ramo => {
      // Filtro por búsqueda (nombre o descripción)
      const busquedaMatch = !this.filtros.busqueda || 
        ramo.nombre.toLowerCase().includes(this.filtros.busqueda.toLowerCase()) ||
        ramo.descripcion.toLowerCase().includes(this.filtros.busqueda.toLowerCase());

      // Filtro por tipo de flor
      const tipoFlorMatch = !this.filtros.tipoFlor || 
        ramo.tipo_flor === this.filtros.tipoFlor;

      // Filtro por color
      const colorMatch = !this.filtros.color || 
        ramo.color === this.filtros.color;

      // Filtro por precio mínimo
      const precioMinMatch = !this.filtros.precioMin || 
        ramo.precio >= this.filtros.precioMin;

      // Filtro por precio máximo
      const precioMaxMatch = !this.filtros.precioMax || 
        ramo.precio <= this.filtros.precioMax;

      return busquedaMatch
        && tipoFlorMatch
        && colorMatch
        && precioMinMatch
        && precioMaxMatch
        && ramo.activo;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      tipoFlor: '',
      color: '',
      precioMin: null,
      precioMax: null
    };
    this.aplicarFiltros();
  }

  incrementarCantidad(ramoId: number): void {
    if (!this.cantidades[ramoId]) {
      this.cantidades[ramoId] = 1;
    }
    if (this.cantidades[ramoId] < 99) {
      this.cantidades[ramoId]++;
    }
  }

  decrementarCantidad(ramoId: number): void {
    if (!this.cantidades[ramoId]) {
      this.cantidades[ramoId] = 1;
    }
    if (this.cantidades[ramoId] > 1) {
      this.cantidades[ramoId]--;
    }
  }

  agregarAlCarrito(ramo: Ramo, cantidad: number = 1): void {
    if (!this.auth.isLoggedIn()) {
      this.ramoSeleccionado = null;
      this.showLoginModal = true;
      return;
    }
    if (!cantidad || cantidad < 1) cantidad = 1;
    this.cartService.agregarArticulo(ramo.id, cantidad).subscribe({
      next: () => {
        this.cartService.open();
      },
      error: err => console.error('Error al agregar al carrito', err)
    });
    this.showLoginModal = false;
    this.cantidades[ramo.id] = 1; // Reiniciar a 1 tras agregar
  }

  irALogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }
  get userName(): string {
    const u = this.auth.getUser();
    return u?.nombre_usuario ?? u?.nombre ?? '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  verDetalles(ramo: Ramo): void {
    this.abrirDetalles(ramo);
  }

  abrirDetalles(ramo: Ramo): void {
    console.log('Iniciando abrirDetalles con ramo:', ramo);
    this.ramoSeleccionado = ramo;
    this.cantidades[ramo.id] = this.cantidades[ramo.id] || 1;
    // Esperar a que el modal esté en el DOM
    setTimeout(() => {
      this.initializeCanvas();
      if (!this.mainCanvas?.nativeElement) {
        console.error('Canvas principal no disponible');
        return;
      }
      // Cargar la imagen
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const imageUrl = `http://localhost/MRBouquets/frontend/public/img/${ramo.img}`;
      console.log('Intentando cargar imagen desde:', imageUrl);
      img.src = imageUrl;
      this.loadImage(img);
    }, 100);
  }

  cerrarDetalles() {
    this.ramoSeleccionado = null;
  }

  private initializeCanvas() {
    console.log('Inicializando canvas...');
    
    // Solo intentar inicializar si el modal está visible
    if (this.ramoSeleccionado) {
      if (this.mainCanvas?.nativeElement) {
        const ctx = this.mainCanvas.nativeElement.getContext('2d');
        console.log('Canvas principal inicializado:', {
          canvas: this.mainCanvas.nativeElement,
          context: ctx
        });
      }
    } else {
      console.log('Modal no visible, omitiendo inicialización de canvas');
    }
  }

  getCantidad(ramoId: number): number {
    return this.cantidades[ramoId] || 1;
  }

  private loadImage(img: HTMLImageElement): void {
    img.onload = () => {
      if (!this.mainCanvas?.nativeElement) {
        console.error('Canvas no disponible');
        return;
      }

      const canvas = this.mainCanvas.nativeElement;
      const ctx = canvas.getContext('2d');

      // Ajustar el tamaño del canvas al de la imagen
      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar la imagen
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
    };

    img.onerror = () => {
      console.error('Error al cargar la imagen:', img.src);
    };
  }
} 