// src/app/services/pedido.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ArticuloCarrito } from './carrito.service';

export interface PedidoResponse {
  mensaje: string;
  id_pedido: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedido.php`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  confirmOrder(
    total: number,
    items: ArticuloCarrito[],
    id_direccion: number
  ): Observable<PedidoResponse> {
    // Mapeamos ArticuloCarrito[] a lo que espera el backend
    const payload = {
      total,
      items: items.map(item => ({
        id: item.id_ramo,
        quantity: item.cantidad,
        price: item.precio
      })),
      id_direccion
    };

    return this.http
      .post<PedidoResponse>(this.apiUrl, payload, { withCredentials: true })
      .pipe(
        tap(res => {
          if (this.isBrowser()) {
            localStorage.setItem('last_order', JSON.stringify(res));
          }
        })
      );
  }
}
