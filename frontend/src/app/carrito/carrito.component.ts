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
    // Si estamos en la vista full (ruta /carrito), CARGAMOS EL BACKEND
    if (!this.showMinimalView) {
      // Protegido por AuthGuard, pero doble chequeo
      if (!this.auth.isLoggedIn()) {
        this.router.navigate(['/login']);
      } else {
        this.loadCart();
      }
    }
    // En vista minimal NO hacemos ninguna llamada al servidor
  }

  private loadCart(): void {
    this.carritoSvc.listarArticulos().subscribe({
      next: items => {
        this.items = Array.isArray(items) ? items : [];
        this.calculateSubtotal();
      },
      error: err => {
        console.error('Falló carga de carrito', err);
        this.items = [];
        this.subtotal = 0;
      }
    });
  }

  private calculateSubtotal(): void {
    this.subtotal = this.items.reduce(
      (sum, i) => sum + i.cantidad * (i.precio ?? 0),
      0
    );
  }

  increment(item: ArticuloCarrito): void {
    this.carritoSvc
      .actualizarCantidad(item.id, item.cantidad + 1)
      .subscribe({
        next: resp => {
          if (resp.success) this.loadCart();
          else alert(resp.error);
        },
        error: () => alert('Error de red al actualizar'),
      });
  }

  decrement(item: ArticuloCarrito): void {
    if (item.cantidad > 1) {
      this.carritoSvc
        .actualizarCantidad(item.id, item.cantidad - 1)
        .subscribe({
          next: resp => {
            if (resp.success) this.loadCart();
            else alert(resp.error);
          },
          error: () => alert('Error de red al actualizar'),
        });
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(id: number): void {
    this.carritoSvc.eliminarArticulo(id).subscribe({
      next: resp => {
        if (resp.success) {
          this.loadCart();       // recarga lista tras borrar
        } else {
          alert(resp.error);
        }
      },
      error: err => {
        console.error('HTTP Error al eliminar:', err);
        // aunque haya error JSON (parseo, warnings PHP...) recargamos
        this.loadCart();
      }
    });
  }


  close(): void {
    if (this.isDialog) this.dialogRef!.close();
    else this.router.navigate(['/']);
  }

  goToPage(): void {
    if (this.minimal || this.isDialog) this.close();
    this.router.navigate(['/carrito']);
  }

  proceedToCheckout(): void {
    if (!this.items.length) return;
    this.loadDirecciones();
  }

  private loadDirecciones(): void {
    this.direccionesSvc.getDirecciones().subscribe({
      next: ds => {
        this.direcciones = ds;
        this.selectedDireccionId = ds.length ? ds[0].id : null;
        this.showAddressModal = true;
      },
      error: () => alert('No se pudieron cargar las direcciones')
    });
  }

  confirmarDireccion(): void {
    if (this.selectedDireccionId == null) return;
    this.pedidoService
      .confirmOrder(this.subtotal, this.items, this.selectedDireccionId)
      .subscribe({
        next: () => {
          this.showAddressModal = false;
          this.showSuccessModal = true;
          this.clearCart();
        },
        error: () => alert('Error al confirmar tu pedido')
      });
  }

  clearCart(): void {
    this.carritoSvc.vaciarCarrito().subscribe({
      next: resp => {
        if (resp.success) {
          this.loadCart();
        } else {
          alert(resp.error);
        }
      },
      error: err => {
        console.error('HTTP Error al eliminar:', err);
        this.loadCart();
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
    if (this.minimal) this.close();
    else this.router.navigate(['/']);
  }

  openConfirmClearCart() {
    this.showConfirmClearCart = true;
  }
  closeConfirmClearCart() {
    this.showConfirmClearCart = false;
  }
  confirmClearCart() {
    this.showConfirmClearCart = false;
    this.clearCart();
  }

  goToCatalogo() {
    this.router.navigate(['/catalogo']);
  }
}
