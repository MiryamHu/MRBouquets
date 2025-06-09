import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Ramo } from './ramos.service';
import { ToastService } from './toast.service';

// Interfaz para items en el carrito, con cantidad
export interface CartItem extends Omit<Ramo, 'precio'> {
  price: number;
  quantity: number;
  img: string;  // Asegurarnos de que img esté definido explícitamente
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private toggleSidenav$ = new Subject<'open'|'close'>();
  toggleSidenav: Observable<'open'|'close'> = this.toggleSidenav$.asObservable();

  // Lista interna de items
  private items: CartItem[] = [];
  // Observable para suscribirse a cambios en el carrito
  private itemsSubject: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor(private toastService: ToastService) {}

  /**
   * Añade un producto al carrito. Si ya existe, incrementa la cantidad.
   */
  add(ramo: Ramo): void {
    const existing = this.items.find(item => item.id === ramo.id);
    if (existing) {
      existing.quantity++;
      this.toastService.success(`Se agregó una unidad más de ${ramo.nombre} al carrito (Total: ${existing.quantity} unidades)`);
    } else {
      // Convertir precio a price al agregar al carrito y mantener img
      const cartItem: CartItem = {
        ...ramo,
        price: ramo.precio,
        quantity: 1,
        img: ramo.img
      };
      delete (cartItem as any).precio;
      this.items.push(cartItem);
      this.toastService.success(`${ramo.nombre} agregado al carrito (1 unidad)`);
    }
    this.itemsSubject.next([...this.items]);
  }

  /**
   * Elimina un producto completo del carrito (por id).
   */
  remove(productId: number): void {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      this.toastService.info(`${item.nombre} eliminado del carrito`);
    }
    this.items = this.items.filter(item => item.id !== productId);
    this.itemsSubject.next([...this.items]);
  }

  /**
   * Vacía todo el carrito.
   */
  clearCart(): void {
    if (this.items.length > 0) {
      this.toastService.warning('Carrito vaciado');
    }
    this.items = [];
    this.itemsSubject.next([]);
  }

    open() {
    this.toggleSidenav$.next('open');
  }

  close() {
    this.toggleSidenav$.next('close');
  }
  /**
   * Obtiene una copia de los items actuales en el carrito.
   */
  getItems(): CartItem[] {
    return [...this.items];
  }

  /**
   * Obtiene el número total de unidades en el carrito.
   */
  getTotalCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Obtiene el total de diferentes productos en el carrito.
   */
  getDistinctCount(): number {
    return this.items.length;
  }
}
