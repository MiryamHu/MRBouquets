import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/carrito`;

  constructor(private http: HttpClient) {}

  listarArticulos(): Observable<ArticuloCarrito[]> {
    return this.http.get<ArticuloCarrito[]>(`${this.apiUrl}/obtener-articulos-carrito.php` ,{ withCredentials: true });
  }
}
