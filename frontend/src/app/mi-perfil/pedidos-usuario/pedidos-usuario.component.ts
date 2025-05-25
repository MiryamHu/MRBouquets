import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido } from '../../services/pedidos.service';

interface PedidoItem {
  cantidad: number;
  nombre:   string;
  precio:   string;
}

@Component({
  selector: 'app-pedidos-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos-usuario.component.html',
  styleUrl: './pedidos-usuario.component.css'
})
export class PedidosUsuarioComponent implements OnInit{
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  filtroEstado = '';
  ordenFecha: 'asc' | 'desc' = 'desc';
  itemsPorPagina = 5;
  paginaActual = 1;
  totalPaginas = 0;
  loadingPedidos = false;
  errorPedidos: string | null = null;
  isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private pedidosService: PedidosService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.cargarPedidos();
    }
  }

  cargarPedidos(): void {
    this.loadingPedidos = true;
    this.pedidosService.getPedidosUsuario().subscribe({
      next: pedidos => {
        this.pedidos = pedidos;
        this.aplicarFiltros();
        this.loadingPedidos = false;
      },
      error: () => {
        this.errorPedidos = 'No se pudieron cargar los pedidos.';
        this.loadingPedidos = false;
      }
    });
  }

  aplicarFiltros(): void {
    let temp = [...this.pedidos];
    if (this.filtroEstado) {
      temp = temp.filter(p => p.estado === this.filtroEstado);
    }
    temp.sort((a, b) => {
      const tA = new Date(this.parseFecha(a.fecha_pedido)).getTime();
      const tB = new Date(this.parseFecha(b.fecha_pedido)).getTime();
      return this.ordenFecha === 'desc' ? tB - tA : tA - tB;
    });
    this.pedidosFiltrados = temp;
    this.totalPaginas = Math.ceil(temp.length / this.itemsPorPagina);
    this.paginaActual = 1;
  }

  parseFecha(fecha: string): string {
    const [dia, mes, resto] = fecha.split('/');
    const [anio, hora] = resto.split(' ');
    return `${anio}-${mes}-${dia} ${hora}`;
  }

  cambiarPagina(pag: number): void {
    if (pag >= 1 && pag <= this.totalPaginas) {
      this.paginaActual = pag;
    }
  }

  getPedidoItems(detalles: string): PedidoItem[] {
    return detalles.split('; ').map(item => {
      const m = item.match(/(\d+)x (.+) \((.+)€\)/)!;
      return { cantidad: +m[1], nombre: m[2], precio: m[3] };
    });
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

  getEstadoClase(estado: string): string {
    return `estado-${estado}`;
  }
}
