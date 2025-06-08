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
  es_ocasion_especial: boolean;
  nombre_ocasion: string | null;
}

export interface Ocasion {
  id: number;
  nombre: string;
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

}
