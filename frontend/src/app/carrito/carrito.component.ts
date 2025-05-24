import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../services/pedido.service';
import { CartService, CartItem } from '../services/cart.service';
import { DireccionesService, Direccion } from '../services/direcciones.service';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef,  MatDialogModule}from '@angular/material/dialog';
import { Ramo } from '../services/ramos.service';
import { FormsModule }        from '@angular/forms'; 

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
    /** Si viene true desde fuera forzamos la vista minimal */
  @Input() minimal = false;

/** mezcla isDialog (dialogRef presente) o minimal forzado */
get showMinimalView(): boolean {
  return this.minimal || this.isDialog;
}

  isDialog: boolean;
  items: CartItem[] = [];
  subtotal = 0;

  /* ---------- Dirección ---------- */
  direcciones: Direccion[] = [];
  selectedDireccionId: number | null = null;
  showAddressModal = false;
  showSuccessModal = false;

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
    private direccionesService: DireccionesService,
    private router: Router,
    @Optional() private dialogRef: MatDialogRef<CarritoComponent>
  ) {
    this.isDialog = !!dialogRef;
  }

  close() {
    if (this.isDialog) {
      this.dialogRef!.close();
    } else {
      this.router.navigate(['/']);  // o donde quieras volver
    }
  }

 goToPage(): void {
    // Si estamos en el panel lateral (minimal), cerramos el sidenav
    if (this.minimal) {
      this.cartService.close();
    }
    // Si estuviera abierto como diálogo, lo cerramos
    else if (this.isDialog) {
      this.dialogRef!.close();
    }
    // Y siempre navegamos a /carrito
    this.router.navigate(['/carrito']);
  }


  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.calculateSubtotal();
    });
  }

  calculateSubtotal(): void {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  }

  increment(item: CartItem): void {
    const ramo: Ramo = { ...item, precio: item.price };
    this.cartService.add(ramo);
  }

  decrement(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.cartService['itemsSubject'].next([...this.items]);
      this.calculateSubtotal();
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(id: number): void {
    this.cartService.remove(id);
    this.calculateSubtotal();
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.calculateSubtotal();
  }

  /* ====== Checkout ====== */
  proceedToCheckout(): void {
    if (!this.items.length) { return; }
    this.loadDirecciones();
  }

  private loadDirecciones(): void {
    this.direccionesService.getDirecciones().subscribe({
      next: ds => {
        this.direcciones = ds;
        if (ds.length === 0) {
          // Si no hay direcciones, mostrar mensaje y opción para agregar
          this.showAddressModal = true;
          this.selectedDireccionId = null;
        } else {
          this.selectedDireccionId = ds[0].id;
          this.showAddressModal = true;
        }
      },
      error: () => {
        alert('No se pudieron cargar las direcciones');
        this.showAddressModal = false;
      }
    });
  }

  confirmarDireccion(): void {
  console.log('ID elegido =', this.selectedDireccionId);
  if (this.selectedDireccionId == null) { return; }

  const idDir = Number(this.selectedDireccionId);

  this.pedidoService.confirmOrder(this.subtotal, this.items, idDir).subscribe({
    next: () => {
      console.log('Pedido confirmado ✓'); 
      this.calculateSubtotal();
      this.showAddressModal = false;
      this.showSuccessModal = true;
    },
    error: (err) => {
      console.error('Error HTTP', err);                    // ⬅️ log completo
      alert('Hubo un error al confirmar tu pedido');
    }
  });
}



continueShopping(): void {
    // En minimal cerramos el sidenav
    if (this.minimal) {
      this.cartService.close();
    } 
    // En vista completa navegamos a home
    else {
      this.router.navigate(['/']);
    }
  }


  closeModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.cartService.clearCart(); // Vaciar el carrito
    this.router.navigate(['/']); // Redirigir al inicio
  }
}
