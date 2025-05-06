import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define la interfaz de producto tal como la usas en PrincipalComponent
export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  img: string;
  price: number; 
}

// Interfaz para items en el carrito, con cantidad
export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Lista interna de items
  private items: CartItem[] = [];
  // Observable para suscribirse a cambios en el carrito
  private itemsSubject: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();

  constructor() {}

  /**
   * Añade un producto al carrito. Si ya existe, incrementa la cantidad.
   */
  add(product: Product): void {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.itemsSubject.next([...this.items]);
  }

  /**
   * Elimina un producto completo del carrito (por id).
   */
  remove(productId: number): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.itemsSubject.next([...this.items]);
  }

  /**
   * Vacía todo el carrito.
   */
  clearCart(): void {
    this.items = [];
    this.itemsSubject.next([]);
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
