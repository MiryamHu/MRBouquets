import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Ramo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  img: string;
  tipo_flor: string;
  color: string;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RamosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRamos(): Observable<Ramo[]> {
    return this.http.get<{success: boolean, data: Ramo[]}>(`${this.apiUrl}/ramos/get-ramos.php`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Error al obtener los ramos');
      })
    );
  }
} 