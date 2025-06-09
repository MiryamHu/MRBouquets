import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  
  getClientes(): Observable<{ success: boolean; data: Cliente[] }> {
      return this.http.get<{ success: boolean; data: Cliente[] }>(
        `${this.baseUrl}/cliente/obtener-clientes-admin.php`,
        { withCredentials: true }
      );
  }




}
