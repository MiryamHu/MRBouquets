import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  error = '';
  mensaje = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['']
    });
  }

  onSubmit(): void {
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
}
