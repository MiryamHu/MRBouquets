import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ArticuloCarrito {
  id: number;
  id_ramo: number;
  id_usuario?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  img: string;
  fecha_agregado?: string;
}

export interface CartResponse {
  success: boolean;
  data: ArticuloCarrito[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private base = `${environment.apiUrl}/carrito`;

  // Estado compartido del carrito
  private _cartItems = new BehaviorSubject<ArticuloCarrito[]>([]);
  cartItems$ = this._cartItems.asObservable();
  
  private _showMinimal = new BehaviorSubject<boolean>(false);
  showMinimal$ = this._showMinimal.asObservable();
  
  private toggleSidenav$ = new Subject<'open'|'close'>();
  toggleSidenav = this.toggleSidenav$.asObservable();

  constructor(private http: HttpClient) {
    // Cargar items iniciales
    this.refreshCartItems();
  }

  private refreshCartItems(): void {
    this.http.get<CartResponse>(`${this.base}/obtener-articulos-carrito.php`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this._cartItems.next(response.data);
          } else {
            this._cartItems.next([]);
            console.error('Error loading cart:', response.error);
          }
        },
        error: (error) => {
          this._cartItems.next([]);
          console.error('Error loading cart items:', error);
        }
      });
  }

  getCartItems(): Observable<ArticuloCarrito[]> {
    return this.cartItems$;
  }

  agregarArticulo(id_ramo: number, cantidad: number): Observable<any> {
    return this.http.post(`${this.base}/agregar-articulos-carrito.php`, 
      { id_ramo, cantidad }, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Refrescar items después de agregar
        this.refreshCartItems();
      })
    );
  }

  actualizarCantidad(id: number, cantidad: number): Observable<any> {
    return this.http.put(`${this.base}/actualizar-articulos-carrito.php?id=${id}`, 
      { cantidad }, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Refrescar items después de actualizar
        this.refreshCartItems();
      })
    );
  }

  eliminarArticulo(id: number): Observable<any> {
    return this.http.delete(`${this.base}/eliminar-articulos-carrito.php?id=${id}`, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Refrescar items después de eliminar
        this.refreshCartItems();
      })
    );
  }

  vaciarCarrito(): Observable<any> {
    return this.http.delete(`${this.base}/vaciar-carrito.php`, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        // Refrescar items después de vaciar
        this.refreshCartItems();
      })
    );
  }

  open(): void {
    this.toggleSidenav$.next('open');
  }

  close(): void {
    this.toggleSidenav$.next('close');
  }
}
