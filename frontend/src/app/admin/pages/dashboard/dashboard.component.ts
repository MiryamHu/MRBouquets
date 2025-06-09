
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PedidoService, PedidoResumen } from '../../services-admin/pedido.service';
import { ProductosService, Producto } from '../../services-admin/productos.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    // Angular y Material que uses
    CommonModule,
    MatCardModule,
    MatIconModule,
    // …
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalPedidos = 0;
  confirmados   = 0;
  ventasTotal   = 0;  // acumulado de precio_total
  stockBajo     = 0;  // número de productos con stock < 20

  constructor(
    private pedidoSvc: PedidoService,
    private productoSvc: ProductosService
  ) {}

  ngOnInit() {
  this.pedidoSvc.getAllPedidos().subscribe(pedidos => {
    this.totalPedidos = pedidos.length;
    this.confirmados   = pedidos.filter(p=> p.id_estado===1).length;
    this.ventasTotal   = pedidos.reduce((s,p)=> s + parseFloat(p.precio_total), 0);

    // ➡️ Ahora que la sesión ya está «caliente», cargamos productos:
    this.productoSvc.getProductos().subscribe({
      next: resp => {
        if (resp.success) {
          this.stockBajo = resp.data.filter(p=> p.stock < 20).length;
        } else {
          console.error('No recibí datos de productos válidos');
          this.stockBajo = 0;
        }
      },
      error: err => {
        console.error('Error al obtener productos:', err);
        this.stockBajo = 0;
      }
    });
  });
}

}
