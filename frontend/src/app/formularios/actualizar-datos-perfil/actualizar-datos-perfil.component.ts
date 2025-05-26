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

@Component({
  selector: 'app-actualizar-datos-perfil',
  standalone: true, 
  imports: [    
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './actualizar-datos-perfil.component.html',
  styleUrl: './actualizar-datos-perfil.component.css'
})
export class ActualizarDatosPerfilComponent implements OnInit {
  actualizarDatosForm: FormGroup;
  error = '';
  mensaje = '';

  userData: User | null = null;

  constructor(
    private fb: FormBuilder,
    private service: PerfilUsuarioService,
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.actualizarDatosForm = this.fb.group({
      nombre_usuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.userData = this.auth.getUser();
    if (this.userData) {
      this.actualizarDatosForm.patchValue(this.userData);
    }
  }

  onActualizarDatosSubmit(): void {
    if (this.actualizarDatosForm.invalid) return;

    const data: UpdateUserData = this.actualizarDatosForm.value;
    this.service.actualizarDatos(data).subscribe({
      next: res => {
        // 1) Actualizamos el BehaviorSubject y localStorage
        this.auth.updateLocalUserData(data);

        // 2) Abrimos el diálogo de confirmación
        const ref = this.dialog.open(DialogoConfirmacionComponent, {
          data: 'Tus datos se han guardado correctamente.',
          disableClose: true
        });

        // 3) Al cerrar el modal, navegamos de vuelta a "Mis Datos"
        ref.afterClosed().subscribe(() => {
          this.router.navigate(['/perfil','datos']);
        });
      },
      error: err => {
        this.error = err.error?.error || 'Error al actualizar datos';
      }
    });
  }
}
