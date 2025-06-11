import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
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
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './ocasiones.component.html',
  styleUrl: './ocasiones.component.css'
})
export class OcasionesComponent implements OnInit {
  ramos: Ramo[] = [];
  ramosFiltrados: Ramo[] = [];
  ocasionId: number | null = null;
  ocasionNombre: string = '';
  showLoginModal: boolean = false;
  cantidades: { [key: number]: number } = {};
  ocasiones: Ocasion[] = [];

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
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CarritoService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    // Cargar todas las ocasiones
    this.ramosService.getOcasiones().subscribe({
      next: (ocasiones) => {
        this.ocasiones = ocasiones;
        // Obtener el ID de la ocasión de los parámetros de la URL
        this.route.queryParams.subscribe(params => {
          this.ocasionId = params['oc'] ? Number(params['oc']) : null;
          console.log('ID de ocasión:', this.ocasionId);
          if (this.ocasionId) {
            const ocasionSeleccionada = this.ocasiones.find(o => o.id === this.ocasionId);
            this.ocasionNombre = ocasionSeleccionada ? ocasionSeleccionada.nombre : '';
          }
          this.cargarRamos();
        });
      },
      error: (error) => {
        console.error('Error al cargar las ocasiones:', error);
      }
    });
  }

  cargarRamos() {
    console.log('Cargando ramos para ocasión ID:', this.ocasionId);
    this.ramosService.getRamosOcasiones().subscribe({
      next: (ramos) => {
        console.log('Ramos obtenidos del servicio:', ramos);
        // Si hay un ID de ocasión, filtrar por ese ID
        if (this.ocasionId) {
          console.log('Filtrando por ocasión ID:', this.ocasionId);
          this.ramos = ramos.filter(ramo => {
            console.log('Ramo:', ramo.id, 'id_ocasion:', ramo.id_ocasion);
            return ramo.id_ocasion === this.ocasionId;
          });
          console.log('Ramos filtrados:', this.ramos);
        } else {
          this.ramos = ramos;
        }
        this.extraerOpciones();
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar los ramos:', error);
      }
    });
  }

  extraerOpciones(): void {
    // Extraer tipos de flor únicos
    this.tiposFlor = [...new Set(this.ramos.map(ramo => ramo.tipo_flor))];
    // Extraer colores únicos
    this.colores = [...new Set(this.ramos.map(ramo => ramo.color))];
  }

  aplicarFiltros() {
    console.log('Aplicando filtros a ramos:', this.ramos);
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
    console.log('Ramos después de filtros:', this.ramosFiltrados);
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

  agregarAlCarrito(ramo: Ramo) {
    if (!this.auth.isLoggedIn()) {
      this.showLoginModal = true;
      return;
    }

    const cantidad = this.getCantidad(ramo.id);
    this.cartService.agregarArticulo(ramo.id, cantidad);
  }

  incrementarCantidad(ramoId: number) {
    if (!this.cantidades[ramoId]) {
      this.cantidades[ramoId] = 1;
    }
    this.cantidades[ramoId]++;
  }

  decrementarCantidad(ramoId: number) {
    if (this.cantidades[ramoId] && this.cantidades[ramoId] > 1) {
      this.cantidades[ramoId]--;
    }
  }

  getCantidad(ramoId: number): number {
    return this.cantidades[ramoId] || 1;
  }

  irALogin(): void {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }
}
