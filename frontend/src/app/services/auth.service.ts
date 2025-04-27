import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/mrbouquets/backend/api/auth';

  constructor(private http: HttpClient) {}

  login(data: LoginData): Observable<any> {
    return this.http.post(`${this.apiUrl}/login.php`, data).pipe(
      tap((res: any) => {
        if (res.user) {
          localStorage.setItem('auth_user', JSON.stringify(res.user));
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

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register.php`, data);
  }
  
}
