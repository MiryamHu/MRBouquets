import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, PedidoDetalle, ItemDetalle, EstadoPedido } from '../../admin.service';

import { MatCardModule }    from '@angular/material/card';
import { MatTableModule }   from '@angular/material/table';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatSelectModule }  from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.css'
})
export class DetallePedidoComponent implements OnInit {
  pedido!: PedidoDetalle;
  displayedColumns = ['id_producto', 'producto', 'cantidad', 'precio_unitario', 'subtotal'];

  estados: EstadoPedido[] = [];
  estadoSeleccionado!: number;
  cargandoEstados = true;
  errorEstados = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin/pedidos']);
      return;
    }
    const idPedido = Number(idParam);

    // 1) Cargar detalle de pedido
    this.adminService.obtenerPedidoPorId(idPedido).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.pedido = resp.data;
          this.estadoSeleccionado = this.pedido.id_estado;
          this.cargarEstados(); // luego de tener pedido, cargamos lista de todos los estados
        } else {
          this.router.navigate(['/admin/pedidos']);
        }
      },
      error: () => {
        this.router.navigate(['/admin/pedidos']);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/admin/pedidos']);
  }

  /** 2) Cargar la lista de estados para el <select> **/
private cargarEstados(): void {
  this.cargandoEstados = true;
  this.errorEstados = '';
  console.log('Comenzando cargarEstados(): cargandoEstados =', this.cargandoEstados);

  this.adminService.getEstadosPedidos().subscribe({
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



  /** 3) Manejar cambio de estado desde el <select> **/
  onCambioEstado(nuevoIdEstado: number): void {
    const idPedido = this.pedido.id;
    this.adminService.updateEstadoPedido(idPedido, nuevoIdEstado).subscribe({
      next: resp => {
        if (resp.success) {
          // Actualizar localmente para reflejar el cambio
          this.pedido.id_estado = nuevoIdEstado;
          const est = this.estados.find(e => e.id === nuevoIdEstado);
          this.pedido.estado_nombre = est ? est.nombre : this.pedido.estado_nombre;
        } else {
          alert('No se pudo actualizar el estado: ' + (resp as any).error || '');
          // revertir selección al valor anterior
          this.estadoSeleccionado = this.pedido.id_estado;
        }
      },
      error: () => {
        alert('Error de red al actualizar el estado.');
        // revertir selección al valor anterior
        this.estadoSeleccionado = this.pedido.id_estado;
      }
    });
  }
}
