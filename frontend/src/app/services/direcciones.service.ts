import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Direccion {
  id: number;
  usuario_id: number;
  nombre: string;
  calle: string;
  numero: string;
  piso?: string;
  puerta?: string;
  codigo_postal: string;
  localidad: string;
  provincia: string;
  pais: string;
}

@Injectable({ providedIn: 'root' })
export class DireccionesService {
  private apiUrl = environment.apiUrl + '/direcciones';

  constructor(private http: HttpClient) {}

  getDirecciones(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${this.apiUrl}/listar.php`, { withCredentials: true });
  }

  addDireccion(dir: Omit<Direccion, 'id' | 'usuario_id'>): Observable<Direccion> {
    return this.http.post<Direccion>(`${this.apiUrl}/crear.php`, dir, { withCredentials: true });
  }

  deleteDireccion(id: number) {
    return this.http.delete(`${this.apiUrl}/eliminar.php?id=${id}`, { withCredentials: true });
  }
}
