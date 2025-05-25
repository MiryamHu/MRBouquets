import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: 'cliente' | 'admin';
}

export interface LoginData {
  correo: string;
  contrasena: string;
}

export interface RegisterData {
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
}

export interface GoogleLoginResponse {
  mensaje: string;
  usuario: User;
  session_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_STORAGE_KEY = 'auth_user';
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
  private apiUrl = environment.apiUrl;
  private userSubject: BehaviorSubject<User | null>;
  private sessionCheckTimer: any;
  public user$: Observable<User | null>;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.userSubject = new BehaviorSubject<User | null>(
      this.isBrowser() ? this.getStoredUser() : null
    );
    
    this.user$ = this.userSubject.asObservable();
    
    if (this.isBrowser() && this.isLoggedIn()) {
      this.startSessionCheck();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private setStoredUser(user: User | null): void {
    if (this.isBrowser()) {
      if (user) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      }
      this.userSubject.next(user);
    }
  }

  private getHttpOptions() {
  return {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true
  };
}

  private startSessionCheck(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }
    
    this.sessionCheckTimer = setInterval(() => {
      this.checkSession().subscribe({
        error: () => {
          console.error('Sesión expirada o inválida');
          this.handleSessionExpired();
        }
      });
    }, this.SESSION_CHECK_INTERVAL);
  }

  private checkSession(): Observable<any> {
    console.log('Verificando estado de sesión...');
    return this.http.get(
      `${this.apiUrl}/auth/check-session.php`,
      this.getHttpOptions()
    ).pipe(
      tap(response => {
        console.log('Respuesta de verificación de sesión:', response);
      })
    );
  }

  private handleSessionExpired(): void {
    console.log('Manejando sesión expirada');
    this.setStoredUser(null);
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }
    window.dispatchEvent(new CustomEvent('session-expired'));
  }

  login(data: LoginData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login.php`,
      data,
      this.getHttpOptions()
    ).pipe(
      tap((response: any) => {
        if (response.usuario) {
          this.setStoredUser(response.usuario);
          this.checkSession().subscribe({
            next: () => {
              console.log('Sesión verificada después del login');
              this.startSessionCheck();
            },
            error: (err) => {
              console.error('Error al verificar sesión después del login:', err);
              this.handleSessionExpired();
            }
          });
        }
      })
    );
  }

  logout(): void {
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }
    
    this.http.post(
      `${this.apiUrl}/auth/logout.php`,
      {},
      this.getHttpOptions()
    ).subscribe({
      complete: () => {
        this.setStoredUser(null);
      }
    });
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getRol(): 'cliente' | 'admin' | null {
    return this.getUser()?.rol ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  googleLogin(id_token: string): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(
      `${this.apiUrl}/auth/google-login.php`,
      { id_token },
      this.getHttpOptions()
    ).pipe(
      tap(res => {
        if (res.usuario) {
          this.setStoredUser(res.usuario);
        }
      })
    );
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/auth/register.php`,
      data,
      this.getHttpOptions()
    ).pipe(
      tap(res => {
        if (res.usuario) {
          this.setStoredUser(res.usuario);
        }
      })
    );
  }

  /** Exponemos un método para sobrescribir el usuario actual en memoria + localStorage */
  public updateLocalUserData(partial: Partial<User>) {
    const current = this.getUser();
    if (!current) return;
    const updated: User = { ...current, ...partial };
    // re-aplica al BehaviorSubject y localStorage
    this.setStoredUser(updated);
  }
}
