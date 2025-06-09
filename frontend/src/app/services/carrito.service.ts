import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface ArticuloCarrito {
  id: number;
  id_usuario: number;
  id_ramo: number;
  cantidad: number;
  fecha_agregado: string;
  nombre?: string;
  precio?: number;
  img?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {


private base = `${environment.apiUrl}/carrito`;

private _showMinimal = new BehaviorSubject<boolean>(false);
  showMinimal$ = this._showMinimal.asObservable();
  
  private toggleSidenav$ = new Subject<'open'|'close'>();
  toggleSidenav = this.toggleSidenav$.asObservable();



  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /** Obtener todos los ítems del carrito */
  listarArticulos(): Observable<ArticuloCarrito[]> {
    return this.http.get<{ success: boolean, data: ArticuloCarrito[] }>(
      `${this.base}/obtener-articulos-carrito.php`,
      { withCredentials: true }
    ).pipe(
      map(resp => {
        if (!resp.success) {
          throw new Error('No autenticado o sin datos');
        }
        return resp.data;
      })
    );
}
  /** Agregar un ítem (o sumar cantidad si ya existe) */
  agregarArticulo(id_ramo: number, cantidad: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.base}/agregar-articulos-carrito.php`,
      { id_ramo, cantidad },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        const mensajeConCantidad = `${response.mensaje} (${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`;
        this.toastService.success(mensajeConCantidad);
      })
    );
  }

  /** Actualizar la cantidad de un ítem existente */
  actualizarCantidad(id: number, cantidad: number) {
    return this.http.put<{ success: boolean, message?: string, error?: string }>(
      `${this.base}/actualizar-articulos-carrito.php?id=${id}`,
      { cantidad },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.message) {
          const mensajeConCantidad = `${response.message} (${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'})`;
          this.toastService.success(mensajeConCantidad);
        } else if (response.error) {
          this.toastService.error(response.error);
        }
      })
    );
  }

  /** Eliminar un ítem del carrito */
  eliminarArticulo(id: number) {
    return this.http.delete<{ success: boolean; mensaje?: string; error?: string }>(
      `${this.base}/eliminar-articulos-carrito.php?id=${id}`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.mensaje) {
          this.toastService.info(response.mensaje);
        } else if (response.error) {
          this.toastService.error(response.error);
        }
      })
    );
  }

  vaciarCarrito() {
    return this.http.delete<{ success: boolean; mensaje?: string; error?: string }>(
      `${this.base}/vaciar-carrito.php?id`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success && response.mensaje) {
          this.toastService.warning(response.mensaje);
        } else if (response.error) {
          this.toastService.error(response.error);
        }
      })
    );
  }

  open() {
    this.toggleSidenav$.next('open');
  }

  close() {
    this.toggleSidenav$.next('close');
  }

}
