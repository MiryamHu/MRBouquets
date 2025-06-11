import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  activo?: boolean;
  es_ocasion_especial?: boolean;
  id_ocasion?: number;
  nombre_ocasion?: string;
}

export interface Ocasion {
  id: number;
  nombre: string;
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

  getRamosRegulares(): Observable<Ramo[]> {
    return this.getRamos().pipe(
      map(ramos => ramos.filter(ramo => !ramo.es_ocasion_especial))
    );
  }

  getRamosOcasiones(): Observable<Ramo[]> {
    return this.getRamos().pipe(
      map(ramos => ramos.filter(ramo => ramo.es_ocasion_especial))
    );
  }

  getOcasiones(): Observable<Ocasion[]> {
    return this.http.get<{success: boolean, data: Ocasion[]}>(
      `${this.apiUrl}/ramos/get-ocasion.php`,
      { responseType: 'json' }
    ).pipe(
      map(resp => {
        if (!resp.success) throw new Error('Error API');
        return resp.data;
      }),
      catchError(err => {
        console.error('getOcasiones error', err);
        return of([] as Ocasion[]);
      })
    );
  }
} 