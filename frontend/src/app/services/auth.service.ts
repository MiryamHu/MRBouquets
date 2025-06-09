import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface User {
  id: number;
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  rol: 'cliente' | 'admin';
  loginProvider?: 'google' | 'local'; 
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
  private apiUrl = environment.apiUrl;
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any,
    private toastService: ToastService
  ) {
    this.userSubject = new BehaviorSubject<User | null>(
      this.isBrowser() ? this.getStoredUser() : null
    );
    this.user$ = this.userSubject.asObservable();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private setStoredUser(user: User | null): void {
    if (user) {
      // si viene sin loginProvider asumimos 'local'
      if (!user.loginProvider) user.loginProvider = 'local';
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
    this.userSubject.next(user);
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  login(data: LoginData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login.php`,
      data,
      this.getHttpOptions()
    ).pipe(
      tap((response: any) => {
        if (response.usuario) {
          response.usuario.loginProvider = 'local';
          this.setStoredUser(response.usuario);
          this.toastService.success(`¡Bienvenido/a ${response.usuario.nombre}!`);
        }
      })
    );
  }

  logout(): void {
    const currentUser = this.getUser();
    this.http.post(
      `${this.apiUrl}/auth/logout.php`,
      {},
      this.getHttpOptions()
    ).subscribe({
      complete: () => {
        this.setStoredUser(null);
        if (currentUser) {
          this.toastService.info(`¡Hasta pronto ${currentUser.nombre}!`);
        }
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
          res.usuario.loginProvider = 'google';
          this.setStoredUser(res.usuario);
          this.toastService.success(`¡Bienvenido/a ${res.usuario.nombre}!`);
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
          this.toastService.success(`¡Bienvenido/a ${res.usuario.nombre}! Tu cuenta ha sido creada exitosamente.`);
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
