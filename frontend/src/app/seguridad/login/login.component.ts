import {
  Component,
  NgZone,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService, LoginData, GoogleLoginResponse, RegisterData } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

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
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registroForm!: FormGroup;
  error = '';
  mensaje = '';
  googleClientId = environment.googleClientId;
  isLoginMode = true;
  hideLoginPassword: boolean = true;
  hideRegisterPassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
    this.registroForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['']
    });
  }

  ngOnInit(): void {
    // Detectar el parámetro 'register' en la URL
    this.route.queryParams.subscribe(params => {
      if (params['register']) {
        this.isLoginMode = false;
      } else {
        this.isLoginMode = true;
      }
    });

    // if (isPlatformBrowser(this.platformId)) {
    //   window['handleCredentialResponse'] = (resp: any) => {
    //     this.ngZone.run(() => this.onGoogleSignIn(resp.credential));
    //   };

    //   setTimeout(() => {
    //     google.accounts.id.initialize({
    //       client_id: this.googleClientId,
    //       callback: (response: any) => window['handleCredentialResponse'](response)
    //     });
    //     google.accounts.id.renderButton(
    //       document.getElementById('googleButton'),
    //       { theme: 'outline', size: 'large' }
    //     );
    //   }, 0);
    // }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window['handleCredentialResponse'] = (resp: any) => {
        this.ngZone.run(() => this.onGoogleSignIn(resp.credential));
      };

      google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => window['handleCredentialResponse'](response)
      });
      google.accounts.id.renderButton(
        document.getElementById('googleButton'),
        { theme: 'outline', size: 'large' }
      );
    }
  }

  handleCredentialResponse(response: any) {
    console.log('ID Token recibido:', response.credential);
    this.onGoogleSignIn(response.credential);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) return;

    const data: LoginData = {
      correo: this.loginForm.value.correo,
      contrasena: this.loginForm.value.contrasena
    };

    this.auth.login(data).subscribe({
      next: () => {
        const role = this.auth.getRol();
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
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

   toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
  
  onRegisterSubmit(): void {
      if (this.registroForm.invalid) return;
  
      const data: RegisterData = this.registroForm.value;
      this.auth.register(data).subscribe({
        next: res => {
          this.mensaje = res.mensaje;
          this.error = '';
          setTimeout(() => this.router.navigate(['/login']), 1000);
        },
        error: err => {
          this.error = err.error?.error || 'Error en el registro';
          this.mensaje = '';
        }
      });
    }

  toggleLoginPasswordVisibility() {
    this.hideLoginPassword = !this.hideLoginPassword;
  }

  toggleRegisterPasswordVisibility() {
    this.hideRegisterPassword = !this.hideRegisterPassword;
  }
}
