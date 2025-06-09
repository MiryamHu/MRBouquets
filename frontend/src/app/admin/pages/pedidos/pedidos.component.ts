// src/app/admin/pages/pedidos/pedidos.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, PedidoResumen, EstadoPedido } from '../../services-admin/pedido.service';
import { Router } from '@angular/router';

import { MatTableModule }       from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatButtonModule }      from '@angular/material/button';
import { MatIconModule }        from '@angular/material/icon';
import { MatTableDataSource }   from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule }  from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'cliente',
    'fecha_pedido',
    'precio_total',
    'estado_nombre',
    'acciones'
  ];

  dataSource = new MatTableDataSource<PedidoResumen>([]);

  loading = true;
  errorMsg: string | null = null;

    // valores para tu filtro de texto y de estado
  filterValue  = '';
  filterEstado = '';

  estados: EstadoPedido[] = [];
  cargandoEstados = true;
  errorEstados = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Mapa de prioridad: estadoId más bajo = mayor prioridad
  private estadoPriority: Record<number, number> = {
    1: 1,   // confirmado
    2: 2,   // enviado
    3: 3,   // entregado
    4: 4,   // cancelado
    // …ajusta según tus ids reales
  };

  // Convierte tu campo fecha_pedido en timestamp para comparar
  private parseFecha(fecha: string): number {
    // asumiendo formato YYYY-MM-DD o ISO
    return new Date(fecha).getTime();
  }

  constructor(
    private pedidoSvc: PedidoService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.dataSource.filterPredicate = (data: PedidoResumen, filter: string) => {
    const { text, estadoId } = JSON.parse(filter) as {
      text: string;
      estadoId: string;
    };

    const textMatch =
      data.id.toString().includes(text) ||
      data.cliente.toLowerCase().includes(text);

    const estadoMatch =
      !estadoId || data.id_estado.toString() === estadoId;

    return textMatch && estadoMatch;
  };

    this.pedidoSvc.getPedidos().subscribe({
      next: resp => {
        if (resp.success) {
          const ordenados = resp.data.sort((a, b) => {
          const pa = this.estadoPriority[a.id_estado]  || 99;
          const pb = this.estadoPriority[b.id_estado]  || 99;
          if (pa !== pb) return pa - pb;

          const fa = this.parseFecha(a.fecha_pedido);
          const fb = this.parseFecha(b.fecha_pedido);
          return fa - fb;
        });
        this.dataSource.data = ordenados;
          this.loading = false;
          this.cargarEstados();
        } else {
          this.errorMsg = 'No se pudieron cargar los productos.';
          this.loading = false;
        }
      },
      error: err => {
        console.error('Error al obtener pedidos:', err);
        this.errorMsg = 'Error de red al cargar los productos.';
        this.loading = false;
      }
    });

    // this.cargarEstados();

    
  }

  getRowClass(p: PedidoResumen): string {
  switch (p.id_estado) {
    case 1: return 'row-confirmado';
    case 2: return 'row-enviado';
    case 3: return 'row-entregado';
    case 4: return 'row-cancelado';
    default: return '';
  }
}

  private cargarEstados(): void {
  this.cargandoEstados = true;
  this.errorEstados = '';
  console.log('Comenzando cargarEstados(): cargandoEstados =', this.cargandoEstados);

  this.pedidoSvc.getEstadosPedidos().subscribe({
    next: resp => {
      console.log('getEstadosPedidos.next', resp);
      if (resp.success) {
        this.estados = resp.data;
        this.errorEstados = '';
      } else {
        this.errorEstados = 'No se pudieron cargar los estados.';
      }
      this.cargandoEstados = false;
      console.log('Al terminar: cargandoEstados =', this.cargandoEstados, ', errorEstados =', this.errorEstados);
    },
    error: err => {
      console.error('getEstadosPedidos.error', err);
      this.errorEstados = 'Error al cargar estados.';
      this.cargandoEstados = false;
      console.log('Al error: cargandoEstados =', this.cargandoEstados, ', errorEstados =', this.errorEstados);
    }
  });
}


  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

applyFilter(texto: string = this.filterValue): void {
  this.filterValue = texto.trim().toLowerCase();
  const f = {
    text: this.filterValue,
    estadoId: this.filterEstado  // ya viene como string
  };
  this.dataSource.filter = JSON.stringify(f);
  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}


  verDetalle(pedido: PedidoResumen): void {
    this.router.navigate(['/admin/pedidos', pedido.id]);
  }
}


