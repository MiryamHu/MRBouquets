import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RamosService } from '../services/ramos.service';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';
import { RouterModule,Router } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';

interface Ramo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  img: string;
  tipo_flor: string;
  color: string;
  disponible: boolean;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  ramos: Ramo[] = [];
  ramosFiltrados: Ramo[] = [];
  loading = true;
  error = '';
  showLoginModal = false;

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

      return busquedaMatch && tipoFlorMatch && colorMatch && precioMinMatch && precioMaxMatch && ramo.disponible;
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

    agregarAlCarrito(ramo: Ramo): void {
      // 1) Si no está logueado, mostramos el modal
      if (!this.auth.isLoggedIn()) {
        this.showLoginModal = true;
        return;
      }

      // 2) Llamamos al servicio para añadir 1 unidad
      this.cartService.agregarArticulo(ramo.id, 1).subscribe({
        next: () => {
          // 3) Abrimos el panel lateral del carrito
          this.cartService.open();
        },
        error: err => console.error('Error al agregar al carrito', err)
      });

      // 4) Ocultamos el modal de login si estaba abierto
      this.showLoginModal = false;
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
} 