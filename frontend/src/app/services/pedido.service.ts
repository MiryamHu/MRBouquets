// src/app/services/pedido.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { CartItem } from './cart.service';

export interface PedidoResponse {
  mensaje: string;
  id_pedido: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedido.php`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  confirmOrder(total: number, items: CartItem[]): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(
      this.apiUrl, 
      { total, items },
      { withCredentials: true }
    ).pipe(
      tap(res => {
        // si quieres guardar el último pedido en localStorage
        if (this.isBrowser()) {
          localStorage.setItem('last_order', JSON.stringify(res));
        }
      })
    );
  }
}
