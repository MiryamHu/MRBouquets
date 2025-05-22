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
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos/get-pedidos-usuario.php`, { withCredentials: true }).pipe(
      map(response => {
        // Si la respuesta es directamente un array de pedidos, sólo retorna response
        // Si tu backend devuelve otro formato, ajusta esta lógica
        if (Array.isArray(response)) {
          return response;
        }
        // Si el backend devuelve { success: boolean, data: Pedido[] }
        if ((response as any).success) {
          return (response as any).data;
        }
        throw new Error('Error al obtener los pedidos');
      })
    );
  }
}
