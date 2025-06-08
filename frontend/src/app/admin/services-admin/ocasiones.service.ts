import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Ocasion {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class OcasionesService {

  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

    getOcasiones(): Observable<Ocasion[]> {
      return this.http.get<{success: boolean, data: Ocasion[]}>(
        `${this.baseUrl}/ramos/get-ocasion.php`,
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


  createOcasion(nombre: string): Observable<{ success: boolean; data: Ocasion }> {
    return this.http.post<{ success: boolean; data: Ocasion }>(
      `${this.baseUrl}/admin/catalogo/crear-ocasion-admin.php`,
      { nombre },
      { withCredentials: true }
    ); 
  }

    deleteOcasion(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/admin/ocasion/eliminar-ocasion.php?id=${id}`,
      { withCredentials: true }
    );
  }

}
