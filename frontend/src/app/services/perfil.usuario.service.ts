import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface UpdateUserData {
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  telefono: string;
}


@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {
  private base = `${environment.apiUrl}/usuario`;

  constructor(
    private http: HttpClient,
  ) { }

    actualizarDatos(data: UpdateUserData): Observable<any> {
    return this.http.put<any>(
      `${this.base}/actualizar-datos.php`,
      data,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
        withCredentials: true      // ← aquí le dices que envíe la cookie de sesión
      }
    );
  }
}
