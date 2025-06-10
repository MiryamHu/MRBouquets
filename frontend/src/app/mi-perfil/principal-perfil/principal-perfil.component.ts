import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterOutlet, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PedidosService, Pedido } from '../../services/pedidos.service';
import { DireccionesService, Direccion } from '../../services/direcciones.service';

interface PedidoItem {
  cantidad: number;
  nombre:   string;
  precio:   string;
}

@Component({
  selector: 'app-principal-perfil',
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet],
  templateUrl: './principal-perfil.component.html',
  styleUrl: './principal-perfil.component.css'
})
export class PrincipalPerfilComponent implements OnInit {
  /* ---------- GENERAL ---------- */
  isBrowser: boolean;
  userData: any = null;

  /* ---------- PEDIDOS ---------- */
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  loadingPedidos = true;
  errorPedidos = '';

  // Filtros y orden
  filtroEstado = '';         // Ahora contendrá el "id" del estado en forma de cadena (p.ej. "1", "2", etc.)
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
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /* =====================================
   *  Ciclo de vida
   * ===================================== */
  ngOnInit(): void {
    if (this.isBrowser) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(['/login']);
      } else {
        this.userData = this.auth.getUser();
        this.cargarPedidos();
        this.cargarDirecciones();
      }
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

    // 1) FILTRAR POR ID_ESTADO (ya no existe 'estado' textual)
    if (this.filtroEstado) {
      // filtroEstado contiene el ID del estado como string ("1", "2", etc.)
      const idSel = Number(this.filtroEstado);
      pedidosFiltrados = pedidosFiltrados.filter(p => p.id_estado === idSel);
    }

    // 2) ORDENAR POR FECHA
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
    // Convierte "DD/MM/YYYY HH:mm" a "YYYY-MM-DD HH:mm" para que JS lo interprete correctamente
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

  /**
   * Ahora getEstadoClase recibe el valor textual 'estado_nombre'.
   */
  getEstadoClase(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'pendiente':    return 'estado-pendiente';
      case 'confirmado':   return 'estado-confirmado';
      case 'en_proceso':   return 'estado-proceso';
      case 'entregado':    return 'estado-entregado';
      case 'cancelado':    return 'estado-cancelado';
      case 'completado':   return 'estado-completado';
      default:             return '';
    }
  }

  /**
   * getEstadoTexto también recibe 'estado_nombre' para mostrar un texto amigable.
   */
  getEstadoTexto(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'pendiente':    return 'Pendiente';
      case 'confirmado':   return 'Confirmado';
      case 'en_proceso':   return 'En Proceso';
      case 'entregado':    return 'Entregado';
      case 'cancelado':    return 'Cancelado';
      case 'completado':   return 'Completado';
      default:             return estadoNombre;
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
        console.error('Error al guardar dirección:', err);
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
