import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
import { Pedido } from '../../admin.service';

import { MatCardModule }    from '@angular/material/card';
import { MatTableModule }   from '@angular/material/table';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';

export interface PedidoItem {
  cantidad: number;
  nombre: string;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-detalle-pedido',
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.css'
})
export class DetallePedidoComponent implements OnInit {

  pedido!: Pedido & { detalles: string; nombre_completo: string };
  items: PedidoItem[] = [];
  displayedColumns = ['nombre', 'cantidad', 'precioUnitario', 'subtotal'];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    const nav: Navigation | null = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { pedido?: any };
    if (state?.pedido) {
      this.pedido = state.pedido;
      this.parseDetalles();
    } else {
      // Si recargan sin state, redirigir a la lista
      this.router.navigate(['/admin/pedidos']);
    }
  }

  private parseDetalles() {
    // detalles: "2x Rosa (15,00€); 1x Tulipán (10,50€)"
    const parts = this.pedido.detalles.split('; ');
    for (const part of parts) {
      const m = part.match(/^(\d+)x (.+) \(([\d\.,]+)€\)$/);
      if (m) {
        const cantidad = parseInt(m[1], 10);
        const nombre = m[2];
        // Convertir "15,00" a número 15.00
        const precioUnitario = parseFloat(
          m[3].replace(/\./g, '').replace(',', '.')
        );
        this.items.push({
          cantidad,
          nombre,
          precioUnitario,
          subtotal: cantidad * precioUnitario
        });
      }
    }
  }

  volver(): void {
    this.router.navigate(['/admin/pedidos']);
  }
}
