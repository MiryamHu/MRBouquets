import { Component, OnInit } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterModule, Router }   from '@angular/router';
import { PedidoService }          from '../services/pedido.service';
import { CartService, CartItem }  from '../services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: CartItem[] = [];
  subtotal = 0;
  showModal = false;

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Siempre nos suscribimos al servicio; no hace falta isBrowser
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
    this.cartService.add(item);
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

  proceedToCheckout(): void {
    this.pedidoService.confirmOrder(this.subtotal).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.calculateSubtotal();
        this.showModal = true;
      },
      error: () => {
        alert('Hubo un error al confirmar tu pedido. Intenta de nuevo.');
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  closeModal(): void {
    this.showModal = false;
    this.router.navigate(['/']);
  }
}
