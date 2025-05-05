import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginResponse {
  mensaje: string;
  usuario: any;
}

export interface RegisterData {
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  telefono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: LoginData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, data).pipe(
      tap(res => {
        if (res.user || res.usuario) {
          // backend puede devolver "user" o "usuario"
          const u = res.user ?? res.usuario;
          localStorage.setItem('auth_user', JSON.stringify(u));
        }
      })
    );
  }

  googleLogin(id_token: string): Observable<GoogleLoginResponse> {
    return this.http
      .post<GoogleLoginResponse>(`${this.apiUrl}/google-login.php`, { id_token })
      .pipe(
        tap(res => {
          if (res.usuario) {
            localStorage.setItem('auth_user', JSON.stringify(res.usuario));
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_user');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('auth_user') !== null;
  }

  getUser(): any {
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, data).pipe(
      tap(res => {
        if (res.usuario) {
          localStorage.setItem('auth_user', JSON.stringify(res.usuario));
        }
      })
    );
  }


}
