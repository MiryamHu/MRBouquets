import { Component, OnInit }        from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { FormsModule }              from '@angular/forms';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { Router }                   from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerfilUsuarioService, UpdateUserData } from '../../services/perfil.usuario.service';
import { AuthService, User }        from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../utilidades/dialogo-confirmacion/dialogo-confirmacion.component';
import { validarPasswordActual } from '../../utilidades/password-validators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cambiar-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.css'
})
export class CambiarPasswordComponent {
  actualizarPasswordForm: FormGroup;
  mensaje = '';
  error = '';
  loading = false;
  hideActual: boolean = true;
  hideNueva: boolean = true;

    constructor(
    private fb: FormBuilder,
    private service: PerfilUsuarioService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.actualizarPasswordForm = this.fb.group({
    passwordActual: ['', {
        validators: [Validators.required],
        asyncValidators: [validarPasswordActual(this.service)],
        updateOn: 'blur'  // valida cuando el usuario sale del input
      }],
      passwordNueva: ['', [Validators.required, Validators.minLength(6)]]
      });
  }

  volver(){
    this.router.navigate(['/perfil','datos']);
  }

   onActualizarPasswordSubmit() {
    if (this.actualizarPasswordForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    const data = {
      password_actual: this.actualizarPasswordForm.value.passwordActual,
      password_nueva: this.actualizarPasswordForm.value.passwordNueva
    };

    this.service.cambiarContrasena(data).subscribe({
      next: res => {
        if (res.success) {
          this.dialog.open(DialogoConfirmacionComponent, {
          data: 'La contraseña ha sido cambiada con éxito.',
          disableClose: true
          }).afterClosed().subscribe(() => {
            this.router.navigate(['/perfil','datos']);
          });
        } else {
          this.error = res.error || 'Error al cambiar la contraseña.';
        }
        this.loading = false;
      },
      error: err => {
        this.error = 'Error del servidor, inténtalo más tarde.';
        this.loading = false;
      }
    });
  }

  toggleHideActual() {
    this.hideActual = !this.hideActual;
  }

  toggleHideNueva() {
    this.hideNueva = !this.hideNueva;
  }

}
