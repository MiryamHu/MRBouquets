import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  stock: number;
  tipo_flor: string;
  color: string;
  disponible: boolean;
  activo: boolean;
  img: string;
  es_ocasion_especial: boolean;
  nombre_ocasion: string | null;
}

export interface Ocasion {
  id: number;
  nombre: string;
}

export interface CrearProductoResp {
  success: boolean;
  message: string;
  data?: any;
}


@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getProductos(): Observable<{ success: boolean; data: Producto[] }> {
      return this.http.get<{ success: boolean; data: Producto[] }>(
        `${this.baseUrl}/catalogo/obtener-productos-admin.php`,
        { withCredentials: true }
      );
  }

  /** Crea un producto. Recibe un FormData que incluye la imagen */
  crearProducto(formData: FormData): Observable<CrearProductoResp> {
      return this.http.post<CrearProductoResp>(
        `${this.baseUrl}/catalogo/crear-producto-admin.php`,
        formData,
        { withCredentials: true }
      );
  }

  /** Obtener detalle de un pedido **/
  obtenerProductoPorId(id: number): Observable<{ success: boolean; data: Producto }> {
    return this.http.get<{ success: boolean; data: Producto }>(
      `${this.baseUrl}/catalogo/obtener-producto-por-id.php?id=${id}`,
      { withCredentials: true }
    );
  }

  editarProducto(formData: FormData): Observable<CrearProductoResp> {
    return this.http.post<CrearProductoResp>(
      `${this.baseUrl}/catalogo/editar-producto-admin.php`,
      formData,
      { withCredentials: true }
    );
  }

  deleteProducto(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/catalogo/eliminar-producto-admin.php?id=${id}`,
      { withCredentials: true }
    );
  }

}
