import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

import { RamosService, Ocasion } from '../../../../services/ramos.service';
import { ProductosService } from '../../../services-admin/productos.service';

@Component({
  selector: 'app-formulario-crear-producto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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
  imagenError = false;

  constructor(
    private fb: FormBuilder,
    private ramosSvc: RamosService,
    private productosSvc: ProductosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.crearProductoForm = this.fb.group({
      nombre: ['', Validators.required],
      precio: [null, Validators.required],
      stock: [null, Validators.required],
      tipo_flor: ['', Validators.required],
      color: ['', Validators.required],
      descripcion: ['', Validators.required],
      imagen: [null, Validators.required],
      es_ocasion_especial: [false],
      nombre_ocasion:[null],
      activo: [true]
    });

    // Carga de ocasiones
    this.ramosSvc.getOcasiones().subscribe({
      next: oc => this.ocasiones = oc,
      error:  () => this.ocasiones = []
    });

    // Ajuste dinámico de validadores sobre nombre_ocasion
    this.crearProductoForm.get('es_ocasion_especial')!
      .valueChanges.subscribe(es => {
        const ctrl = this.crearProductoForm.get('nombre_ocasion')!;
        if (es) {
          ctrl.setValidators([Validators.required]);
        } else {
          ctrl.clearValidators();
          ctrl.setValue(null);
        }
        ctrl.updateValueAndValidity();
      });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (file && file.type.startsWith('image/')) {
      this.imagenError = false;
      this.crearProductoForm.patchValue({ imagen: file });
    } else {
      this.imagenError = true;
      this.crearProductoForm.patchValue({ imagen: null });
    }
  }

  onCrearProductoSubmit() {
    if (this.crearProductoForm.invalid) {
      this.crearProductoForm.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    Object.entries(this.crearProductoForm.value).forEach(([key, val]) => {
      formData.append(key, val as any);
    });

    this.productosSvc.crearProducto(formData).subscribe({
      next: resp => {
        if (resp.success) {
          this.mensaje = 'Producto creado con éxito';
          setTimeout(() => this.router.navigate(['/admin/catalogo/productos']), 1500);
        } else {
          this.error = resp.message || 'Error al crear el producto';
        }
      },
      error: err => {
        console.error(err);
        this.error = 'Error de red al crear el producto';
      }
    });
  }

  volver() {
    this.router.navigate(['/admin/catalogo/productos']);
  }
}
