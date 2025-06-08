import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from '../../../../utilidades/dialogo-confirmacion/dialogo-confirmacion.component'; 
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatSelectModule }        from '@angular/material/select';

import { RamosService, Ocasion } from '../../../../services/ramos.service';
import { ProductosService } from '../../../services-admin/productos.service';


@Component({
  selector: 'app-formulario-crear-producto',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './formulario-crear-producto.component.html',
  styleUrl: './formulario-crear-producto.component.css'
})
export class FormularioCrearProductoComponent implements OnInit {

  crearProductoForm!: FormGroup;
  ocasiones: Ocasion[] = [];
  mensaje = '';
  error   = '';

  constructor(
    private fb: FormBuilder,
    private ramosSvc: RamosService,
    private productosSvc: ProductosService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1) Inicializar el FormGroup
    this.crearProductoForm = this.fb.group({
      nombre:              ['', Validators.required],
      precio:              [null, Validators.required],
      stock:               [null, Validators.required],
      tipo_flor:           ['', Validators.required],
      color:               ['', Validators.required],
      descripcion:         ['', Validators.required],
      es_ocasion_especial: [false],
      nombre_ocasion:      [null],
      activo:              [true]
    });

    // 2) Cargar las ocasiones para el select
    this.ramosSvc.getOcasiones().subscribe({
      next: oc => this.ocasiones = oc,
      error:  () => this.ocasiones = []
    });

    // 3) Si el usuario desmarca el checkbox de ocasión,
    //    limpiamos el campo nombre_ocasion para que no quede invalid
    this.crearProductoForm.get('es_ocasion_especial')!
      .valueChanges.subscribe(es => {
        if (!es) {
          this.crearProductoForm.get('nombre_ocasion')!.setValue(null);
        }
      });
  }

  onCrearProductoSubmit() {
    if (this.crearProductoForm.invalid) {
      this.crearProductoForm.markAllAsTouched();
      return;
    }

    const payload = this.crearProductoForm.value;
    // Llamada al servicio que crea el producto en el backend
    // this.productosSvc.createProducto(payload).subscribe({
    //   next: resp => {
    //     if (resp.success) {
    //       this.mensaje = 'Producto creado con éxito';
    //       setTimeout(() => this.router.navigate(['/admin/productos']), 1500);
    //     } else {
    //       this.error = resp.message || 'Error al crear';
    //     }
    //   },
    //   error: err => {
    //     this.error = 'Error de red al crear producto';
    //     console.error(err);
    //   }
    // });
  }

  volver() {
    this.router.navigate(['/admin/catalogo/productos']);
  }

}
