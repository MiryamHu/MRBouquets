import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Pedido {
  id: number;
  fecha_pedido: string;
  precio_total: string;
  estado: 'pendiente' | 'confirmado' | 'en_proceso' | 'entregado' | 'cancelado';
  detalles: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPedidosUsuario(): Observable<Pedido[]> {
    return this.http.get<{success: boolean, data: Pedido[]}>(`${this.apiUrl}/pedidos/get-pedidos-usuario.php`, {
      withCredentials: true
    }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Error al obtener los pedidos');
      })
    );
  }
} 