import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(data: LoginData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, data).pipe(
      tap(res => {
        if (this.isBrowser() && (res.user || res.usuario)) {
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
          if (this.isBrowser() && res.usuario) {
            localStorage.setItem('auth_user', JSON.stringify(res.usuario));
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_user');
    }
  }

  isLoggedIn(): boolean {
    return this.isBrowser() && localStorage.getItem('auth_user') !== null;
  }

  getUser(): any {
    if (!this.isBrowser()) {
      return null;
    }
    const data = localStorage.getItem('auth_user');
    return data ? JSON.parse(data) : null;
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, data).pipe(
      tap(res => {
        if (this.isBrowser() && res.usuario) {
          localStorage.setItem('auth_user', JSON.stringify(res.usuario));
        }
      })
    );
  }
}
