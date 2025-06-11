import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, ArticuloCarrito } from '../services/carrito.service';
import { DireccionesService, Direccion } from '../services/direcciones.service';
import { PedidoService } from '../services/pedido.service';
import { AuthService } from '../services/auth.service';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  @Input() minimal = false;
  get showMinimalView(): boolean {
    return this.minimal || this.isDialog;
  }

  isDialog: boolean;
  items: ArticuloCarrito[] = [];
  subtotal = 0;

  // Dirección
  direcciones: Direccion[] = [];
  selectedDireccionId: number | null = null;
  showAddressModal = false;
  showSuccessModal = false;
  showConfirmClearCart = false;

  constructor(
    private carritoSvc: CarritoService,
    private pedidoService: PedidoService,
    private direccionesSvc: DireccionesService,
    private auth: AuthService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<CarritoComponent>
  ) {
    this.isDialog = !!dialogRef;
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del carrito
    this.carritoSvc.cartItems$.subscribe(items => {
      this.items = items;
      this.calculateSubtotal();
    });
  }

  private calculateSubtotal(): void {
    this.subtotal = this.items.reduce((total, item) => 
      total + (item.precio * item.cantidad), 0);
  }

  increment(item: ArticuloCarrito): void {
    this.carritoSvc.actualizarCantidad(item.id, item.cantidad + 1)
      .subscribe({
        error: () => alert('Error al actualizar la cantidad')
      });
  }

  decrement(item: ArticuloCarrito): void {
    if (item.cantidad > 1) {
      this.carritoSvc.actualizarCantidad(item.id, item.cantidad - 1)
        .subscribe({
          error: () => alert('Error al actualizar la cantidad')
        });
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(id: number): void {
    this.carritoSvc.eliminarArticulo(id).subscribe({
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar el artículo');
      }
    });
  }

  close(): void {
    if (this.minimal) {
      this.carritoSvc.close();
    } else if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  goToPage(): void {
    if (this.minimal || this.isDialog) {
      this.close();
    }
    this.router.navigate(['/carrito']);
  }

  proceedToCheckout(): void {
    if (!this.items.length) return;
    this.cargarDirecciones();
    this.showAddressModal = true;
  }

  procesarPedido(): void {
    if (!this.selectedDireccionId) {
      alert('Por favor selecciona una dirección de envío');
      return;
    }

    this.pedidoService
      .confirmOrder(this.subtotal, this.items, this.selectedDireccionId)
      .subscribe({
        next: () => {
          this.showSuccessModal = true;
          this.showAddressModal = false;
        },
        error: err => {
          console.error('Error al procesar pedido:', err);
          alert('Error al procesar el pedido');
        }
      });
  }

  seleccionarDireccion(id: number): void {
    this.selectedDireccionId = id;
  }

  cargarDirecciones(): void {
    this.direccionesSvc.getDirecciones().subscribe({
      next: direcciones => {
        this.direcciones = direcciones;
        if (direcciones.length > 0) {
          this.selectedDireccionId = direcciones[0].id;
        }
        this.showAddressModal = true;
      },
      error: err => {
        console.error('Error al cargar direcciones:', err);
        alert('Error al cargar las direcciones');
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']);
  }

  closeModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']);
  }

  continueShopping(): void {
    if (this.minimal || this.isDialog) {
      this.close();
    } else {
      this.router.navigate(['/']);
    }
  }

  openConfirmClearCart(): void {
    this.showConfirmClearCart = true;
  }

  closeConfirmClearCart(): void {
    this.showConfirmClearCart = false;
  }

  confirmClearCart(): void {
    this.showConfirmClearCart = false;
    this.carritoSvc.vaciarCarrito().subscribe({
      error: (err) => {
        console.error('Error al vaciar el carrito:', err);
        alert('Error al vaciar el carrito');
      }
    });
  }

  goToCatalogo(): void {
    if (this.minimal) {
      this.close();
    }
    this.router.navigate(['/catalogo']);
  }
}
