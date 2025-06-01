// src/app/components/pedidos-usuario/pedidos-usuario.component.ts

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
export class PedidosUsuarioComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  filtroEstado = '';              // Ahora será un string que representa el nombre del estado
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

    // 1) Filtrar por id_estado (usamos filtroEstado como el nombre del estado, y comparamos con estado_nombre)
    if (this.filtroEstado) {
      temp = temp.filter(p => p.estado_nombre === this.filtroEstado);
    }

    // 2) Ordenar por fecha
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
    // Convierte "DD/MM/YYYY HH:mm" a "YYYY-MM-DD HH:mm" para JS
    const [dia, mes, resto] = fecha.split('/');
    const [año, hora] = resto.split(' ');
    return `${año}-${mes}-${dia} ${hora}`;
  }

  cambiarPagina(pag: number): void {
    if (pag >= 1 && pag <= this.totalPaginas) {
      this.paginaActual = pag;
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

  // getEstadoClase y getEstadoTexto usan 'estado_nombre' (texto legible) para asignar clases o mostrar texto
  getEstadoClase(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'pendiente':   return 'estado-pendiente';
      case 'confirmado':  return 'estado-confirmado';
      case 'en_proceso':  return 'estado-proceso';
      case 'entregado':   return 'estado-entregado';
      case 'cancelado':   return 'estado-cancelado';
      case 'completado':  return 'estado-completado';
      default:            return '';
    }
  }

  getEstadoTexto(estadoNombre: string): string {
    switch (estadoNombre) {
      case 'pendiente':   return 'Pendiente';
      case 'confirmado':  return 'Confirmado';
      case 'en_proceso':  return 'En Proceso';
      case 'entregado':   return 'Entregado';
      case 'cancelado':   return 'Cancelado';
      case 'completado':  return 'Completado';
      default:            return estadoNombre;
    }
  }
}
