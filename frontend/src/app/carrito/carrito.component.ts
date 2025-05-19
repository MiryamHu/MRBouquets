import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PedidoService } from '../services/pedido.service';
import { CartService, CartItem } from '../services/cart.service';
import { DireccionesService, Direccion } from '../services/direcciones.service';
import { Ramo } from '../services/ramos.service';
import { FormsModule }        from '@angular/forms'; 

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
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
    private router: Router
  ) {}

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
        this.selectedDireccionId = ds.length ? ds[0].id : null;
        this.showAddressModal = true;
      },
      error: () => alert('No se pudieron cargar las direcciones')
    });
  }

  confirmarDireccion(): void {
  console.log('ID elegido =', this.selectedDireccionId);   // ⬅️ línea de debug
  if (this.selectedDireccionId == null) { return; }

  const idDir = Number(this.selectedDireccionId);

  this.pedidoService.confirmOrder(this.subtotal, this.items, idDir).subscribe({
    next: () => {
      console.log('Pedido confirmado ✓');                  // ⬅️ línea de debug
      this.cartService.clearCart();
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
    this.router.navigate(['/']);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']);
  }
}
