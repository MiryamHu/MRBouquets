import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { PedidosService, Pedido } from '../services/pedidos.service';
import { DireccionesService, Direccion } from '../services/direcciones.service';

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
  /* ---------- GENERAL ---------- */
  isBrowser: boolean;
  userData: any = null;

  /* ---------- PEDIDOS ---------- */
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  loadingPedidos = true;
  errorPedidos = '';

  // Filtros y orden
  filtroEstado = '';
  ordenFecha = 'desc';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 0;

  /* ---------- DIRECCIONES ---------- */
  direcciones: Direccion[] = [];
  loadingDirecciones = true;
  errorDirecciones = '';
  mostrarFormDireccion = false;
  nuevaDireccion: Partial<Direccion> = { pais: 'España' };

  constructor(
    private auth: AuthService,
    private pedidosService: PedidosService,
    private direccionesService: DireccionesService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /* =====================================
   *  Ciclo de vida
   * ===================================== */
  ngOnInit(): void {
    if (this.isBrowser) {
      this.userData = this.auth.getUser();
      this.cargarPedidos();
      this.cargarDirecciones();
    }
  }

  /* =====================================
   *  PEDIDOS
   * ===================================== */
  cargarPedidos(): void {
    this.loadingPedidos = true;
    this.pedidosService.getPedidosUsuario().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.aplicarFiltros();
        this.loadingPedidos = false;
      },
      error: () => {
        this.errorPedidos = 'No se pudieron cargar los pedidos. Por favor, intente más tarde.';
        this.loadingPedidos = false;
      }
    });
  }

  aplicarFiltros(): void {
    let pedidosFiltrados = [...this.pedidos];

    if (this.filtroEstado) {
      pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === this.filtroEstado);
    }

    pedidosFiltrados.sort((a, b) => {
      const fechaA = new Date(this.parseFecha(a.fecha_pedido)).getTime();
      const fechaB = new Date(this.parseFecha(b.fecha_pedido)).getTime();
      return this.ordenFecha === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });

    this.pedidosFiltrados = pedidosFiltrados;
    this.totalPaginas = Math.ceil(this.pedidosFiltrados.length / this.itemsPorPagina);
    this.paginaActual = 1;
  }

  parseFecha(fecha: string): string {
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
      return match
        ? { cantidad: +match[1], nombre: match[2], precio: match[3] }
        : { cantidad: 0, nombre: item, precio: '0' };
    });
  }

  getEstadoClase(estado: string): string {
    switch (estado) {
      case 'pendiente':   return 'estado-pendiente';
      case 'confirmado':  return 'estado-confirmado';
      case 'en_proceso':  return 'estado-proceso';
      case 'entregado':   return 'estado-entregado';
      case 'cancelado':   return 'estado-cancelado';
      default:            return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':   return 'Pendiente';
      case 'confirmado':  return 'Confirmado';
      case 'en_proceso':  return 'En Proceso';
      case 'entregado':   return 'Entregado';
      case 'cancelado':   return 'Cancelado';
      default:            return estado;
    }
  }

  /* =====================================
   *  DIRECCIONES
   * ===================================== */
  cargarDirecciones(): void {
    this.loadingDirecciones = true;
    this.direccionesService.getDirecciones().subscribe({
      next: ds => {
        this.direcciones = ds;
        this.loadingDirecciones = false;
      },
      error: () => {
        this.errorDirecciones = 'No se pudieron cargar las direcciones.';
        this.loadingDirecciones = false;
      }
    });
  }

guardarDireccion(): void {
  if (Object.values(this.nuevaDireccion).some(v => !v)) { return; }

  this.direccionesService.addDireccion(this.nuevaDireccion as any).subscribe({
    next: dir => {
      this.direcciones.push(dir);
      this.nuevaDireccion = { pais: 'España' };
      this.mostrarFormDireccion = false;
    },
    error: (err) => {
      console.error('Error al guardar dirección:', err);        // ⬅️  LOG DETALLADO
      alert(err?.error?.error || 'No se pudo guardar la dirección');
    }
  });
}


  eliminarDireccion(id: number): void {
    if (!confirm('¿Eliminar dirección?')) { return; }

    this.direccionesService.deleteDireccion(id).subscribe({
      next: () => {
        this.direcciones = this.direcciones.filter(d => d.id !== id);
      },
      error: () => alert('No se pudo eliminar')
    });
  }
}
