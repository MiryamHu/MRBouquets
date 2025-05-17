import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { PedidosService, Pedido } from '../services/pedidos.service';

interface PedidoItem {
  cantidad: number;
  nombre: string;
  precio: string;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit {
  isBrowser: boolean;
  userData: any = null;
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  loadingPedidos = true;
  errorPedidos = '';

  // Filtros y ordenamiento
  filtroEstado = '';
  ordenFecha = 'desc';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 0;

  constructor(
    private auth: AuthService,
    private pedidosService: PedidosService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.userData = this.auth.getUser();
      this.cargarPedidos();
    }
  }

  cargarPedidos(): void {
    this.loadingPedidos = true;
    this.pedidosService.getPedidosUsuario().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltros();
        this.loadingPedidos = false;
      },
      error: (err) => {
        console.error('Error al cargar los pedidos:', err);
        this.errorPedidos = 'No se pudieron cargar los pedidos. Por favor, intente más tarde.';
        this.loadingPedidos = false;
      }
    });
  }

  aplicarFiltros(): void {
    let pedidosFiltrados = [...this.pedidos];

    // Aplicar filtro por estado
    if (this.filtroEstado) {
      pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === this.filtroEstado);
    }

    // Aplicar ordenamiento por fecha
    pedidosFiltrados.sort((a, b) => {
      const fechaA = new Date(this.parseFecha(a.fecha_pedido)).getTime();
      const fechaB = new Date(this.parseFecha(b.fecha_pedido)).getTime();
      return this.ordenFecha === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });

    this.pedidosFiltrados = pedidosFiltrados;
    this.totalPaginas = Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina);
    this.paginaActual = 1; // Reset a la primera página al aplicar filtros
  }

  parseFecha(fecha: string): string {
    // Convertir formato dd/mm/yyyy HH:mm a yyyy-mm-dd HH:mm
    const [dia, mes, resto] = fecha.split('/');
    const [anio, hora] = resto.split(' ');
    return `${anio}-${mes}-${dia} ${hora}`;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  getPedidoItems(detalles: string): PedidoItem[] {
    return detalles.split('; ').map(item => {
      const match = item.match(/(\d+)x (.+) \((.+)€\)/);
      if (match) {
        return {
          cantidad: parseInt(match[1]),
          nombre: match[2],
          precio: match[3]
        };
      }
      return {
        cantidad: 0,
        nombre: item,
        precio: '0'
      };
    });
  }

  getEstadoClase(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'confirmado': return 'estado-confirmado';
      case 'en_proceso': return 'estado-proceso';
      case 'entregado': return 'estado-entregado';
      case 'cancelado': return 'estado-cancelado';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmado': return 'Confirmado';
      case 'en_proceso': return 'En Proceso';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  }
}
