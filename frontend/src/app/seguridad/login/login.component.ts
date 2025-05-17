// src/app/seguridad/login/login.component.ts

import {
  Component,
  NgZone,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService, LoginData, GoogleLoginResponse } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error = '';
  googleClientId = environment.googleClientId;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Definimos callback de Google
      window['handleCredentialResponse'] = (resp: any) => {
        try {
          this.ngZone.run(() => this.onGoogleSignIn(resp.credential));
        } catch (e) {
          console.error('Error interno en handleCredentialResponse:', e);
          this.error = 'Error interno al procesar respuesta de Google';
        }
      };
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const data: LoginData = {
      correo: this.loginForm.value.correo,
      contrasena: this.loginForm.value.contrasena
    };

    this.auth.login(data).subscribe({
      next: (res: any) => {
        console.log('Login exitoso:', res);
        localStorage.setItem('auth_user', JSON.stringify(res.usuario));
        this.router.navigate(['/']);
      },
      error: err => {
        // Logging detallado en consola
        console.error('Error en login tradicional:', err);
        // Mensaje simplificado para UI
        const serverMsg = err.error?.error || err.message || 'desconocido';
        this.error = `Error al iniciar sesión (${err.status}): ${serverMsg}`;
      }
    });
  }

  private onGoogleSignIn(id_token: string): void {
    console.log('Google ID token recibido:', id_token);

    this.auth.googleLogin(id_token).subscribe({
      next: (res: GoogleLoginResponse) => {
        console.log('Google login OK:', res);
        localStorage.setItem('auth_user', JSON.stringify(res.usuario));
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('===== Error en Google Login =====');
        console.error('Status          :', err.status, err.statusText);
        console.error('URL             :', err.url);
        console.error('Headers         :', err.headers.keys().map(k => `${k}: ${err.headers.get(k)}`));
        console.error('Response body   :', err.error);
        console.error('Client message  :', err.message);
        console.error('==================================');

        // Muéstralo en la UI si quieres:
        const body = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
        this.error = `Google Login falló (${err.status}): ${body}`;
      }
    });
  }
}
