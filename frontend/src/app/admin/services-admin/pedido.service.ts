import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface PedidoResumen {
  id: number;
  id_usuario: number;
  cliente: string;
  fecha_pedido: string;
  precio_total: string;
  id_estado: number;
  estado_nombre: string;
}

export interface ItemDetalle {
  id_producto: number;
  cantidad: number;
  producto: string;
  precio_unitario: string;
  subtotal: string;
}

export interface PedidoDetalle {
  id: number;
  id_usuario: number;
  cliente: string;
  fecha_pedido: string;
  precio_total: string;
  id_estado: number;
  estado_nombre: string;
  items: ItemDetalle[];
}

export interface EstadoPedido {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  /** Obtener la lista de pedidos **/
  getPedidos(): Observable<{ success: boolean; data: PedidoResumen[] }> {
    return this.http.get<{ success: boolean; data: PedidoResumen[] }>(
      `${this.baseUrl}/pedido/obtener-pedidos-admin.php`,
      { withCredentials: true }
    );
  }

  /** Obtener detalle de un pedido **/
  obtenerPedidoPorId(id: number): Observable<{ success: boolean; data: PedidoDetalle }> {
    return this.http.get<{ success: boolean; data: PedidoDetalle }>(
      `${this.baseUrl}/pedido/obtener-pedido-por-id.php?id=${id}`,
      { withCredentials: true }
    );
  }

  /** Obtener todos los estados (id + nombre) **/
  getEstadosPedidos(): Observable<{ success: boolean; data: EstadoPedido[] }> {
    return this.http.get<{ success: boolean; data: EstadoPedido[] }>(
      `${this.baseUrl}/pedido/obtener-estados-pedidos.php`,
      { withCredentials: true }
    );
  }

  /** Actualizar el estado de un pedido **/
  updateEstadoPedido(id: number, idEstado: number): Observable<{ success: boolean; message: string }> {
    const payload = { id: id, id_estado: idEstado };
    return this.http.put<{ success: boolean; message: string }>(
      `${this.baseUrl}/pedido/actualizar-estado-pedido.php`,
      payload,
      { withCredentials: true }
    );
  }

  
}
