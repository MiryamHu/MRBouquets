import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pedido {
  id: number;
  cliente: string;
  fecha_pedido: string;
  estado: string;
  precio_total: number;
}

export interface PedidosResponse {
  success: boolean;
  data: Pedido[];
}


@Injectable({
  providedIn: 'root'
})
export class AdminService {

private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<PedidosResponse> {
    return this.http.get<PedidosResponse>(
      `${this.base}/obtener-pedidos-admin.php`,
      { withCredentials: true }
    );
  }
}
