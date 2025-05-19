import { Component, Input, OnInit, Optional } from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterModule, Router }   from '@angular/router';
import { PedidoService }          from '../services/pedido.service';
import { CartService, CartItem }  from '../services/cart.service';
import { MatDialogRef,  MatDialogModule}from '@angular/material/dialog';
import { MatStepperModule }    from '@angular/material/stepper';
import { Ramo } from '../services/ramos.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatStepperModule
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
  showModal = false;

  constructor(
    private cartService: CartService,
    private pedidoService: PedidoService,
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
    // Convertir CartItem a Ramo
    const ramo: Ramo = {
      ...item,
      precio: item.price
    };
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

  proceedToCheckout(): void {
    this.pedidoService.confirmOrder(this.subtotal, this.items).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.calculateSubtotal();
        this.showModal = true;
      },
      error: (error) => {
        console.error('Error al procesar el pedido:', error);
        alert('Hubo un error al confirmar tu pedido. Intenta de nuevo.');
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
    this.showModal = false;
    this.router.navigate(['/']);
  }
}
