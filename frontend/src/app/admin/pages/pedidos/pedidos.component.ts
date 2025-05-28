import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Pedido } from '../../admin.service';
import  { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule,
    MatIconModule
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {
  pedidos: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute, 
  ) {}

ngOnInit() {
  this.adminService.getPedidos().subscribe(data => {
    this.pedidos = data.data; 
  });
}

  verDetalle(p: Pedido) {
    this.router.navigate(['/admin/pedidos', p.id]);
  }
}
