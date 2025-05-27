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

export interface ChangePasswordData {
  password_actual: string;
  password_nueva: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
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

  verificarPasswordActual(password_actual: string): Observable<{ valido: boolean }> {
  return this.http.post<{ valido: boolean }>(
    `${this.base}/verificar-password-actual.php`,
    { password_actual },
    { withCredentials: true }
  );
}

  cambiarContrasena(data: ChangePasswordData): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(
      `${this.base}/actualizar-password.php`,
      data,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true // importante para enviar cookies de sesión
      }
    );
  }
}
