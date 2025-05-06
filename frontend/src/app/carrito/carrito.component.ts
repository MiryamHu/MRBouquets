import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  items: CartItem[] = [];
  subtotal: number = 0;
  isBrowser: boolean;

  constructor(
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
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
      // para forzar el next()
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
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/catalogo']);
  }
}
