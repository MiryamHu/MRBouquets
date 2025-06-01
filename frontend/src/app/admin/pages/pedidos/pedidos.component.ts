// src/app/admin/pages/pedidos/pedidos.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, PedidoResumen } from '../../admin.service';
import { Router } from '@angular/router';

import { MatTableModule }       from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatButtonModule }      from '@angular/material/button';
import { MatIconModule }        from '@angular/material/icon';
import { MatTableDataSource }   from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.adminService.getPedidos().subscribe({
      next: resp => {
        if (resp.success) {
          this.dataSource.data = resp.data;
          this.loading = false;
        } else {
          this.errorMsg = 'No se pudieron cargar los pedidos.';
          this.loading = false;
        }
      },
      error: err => {
        console.error('Error al obtener pedidos:', err);
        this.errorMsg = 'Error de red al cargar los pedidos.';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    const filtro = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: PedidoResumen, filter: string) => {
      const textoData = data.id.toString() + ' ' + data.cliente.toLowerCase();
      return textoData.includes(filter);
    };
    this.dataSource.filter = filtro;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalle(pedido: PedidoResumen): void {
    this.router.navigate(['/admin/pedidos', pedido.id]);
  }
}


