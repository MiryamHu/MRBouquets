import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatCheckboxModule }  from '@angular/material/checkbox';
import { MatSelectModule }    from '@angular/material/select';

import { RamosService, Ocasion }       from '../../../../services/ramos.service';
import { ProductosService, Producto } from '../../../services-admin/productos.service';

@Component({
  selector: 'app-formulario-editar-producto',
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
  templateUrl: './formulario-editar-producto.component.html',
  styleUrl:   './formulario-editar-producto.component.css'
})
export class FormularioEditarProductoComponent implements OnInit {
  editarProductoForm!: FormGroup;
  ocasiones: Ocasion[] = [];
  mensaje = '';
  error   = '';
  imagenError = false;
  productoId!: number;

  imagenUrl: string | null = null;
  previewUrl: string | null = null;  

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ramosSvc: RamosService,
    private productosSvc: ProductosService
  ) {
    this.editarProductoForm = this.fb.group({
      nombre:              ['', Validators.required],
      precio:              [null, Validators.required],
      stock:               [null, Validators.required],
      tipo_flor:           ['', Validators.required],
      color:               ['', Validators.required],
      descripcion:         ['', Validators.required],
      // omitimos imagen al principio
      imagen:              [null],
      es_ocasion_especial: [false],
      nombre_ocasion:      [null],
      activo:              [true]
    });
  }

  ngOnInit(): void {
    // 1) cargar ocasiones para el select
      this.ramosSvc.getOcasiones().subscribe({
        next: oc => this.ocasiones = oc,
        error:  () => this.ocasiones = []
      });


    // 2) si cambian es_ocasion, ajustamos validadores
    this.editarProductoForm.get('es_ocasion_especial')!
      .valueChanges.subscribe(es => {
        const ctrl = this.editarProductoForm.get('nombre_ocasion')!;
        if (es) {
          ctrl.setValidators([Validators.required]);
        } else {
          ctrl.clearValidators();
          ctrl.setValue(null);
        }
        ctrl.updateValueAndValidity();
      });

    // 3) sacamos el ID de la URL y pedimos el producto
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.productosSvc.obtenerProductoPorId(this.productoId).subscribe({
      next: resp => {
        const p: Producto = resp.data;
        const precioNum = parseFloat(p.precio.replace(',', '.'));
        this.imagenUrl = '/img'+p.img;
        // 4) parchear el form
        this.editarProductoForm.patchValue({
          nombre:              p.nombre,
          precio: isNaN(precioNum) ? null : precioNum,
          stock:               p.stock,
          tipo_flor:           p.tipo_flor,
          color:               p.color,
          descripcion:         p.descripcion,
          // la imagen no la pinchamos aquí, el usuario la puede cambiar si quiere
          es_ocasion_especial: p.es_ocasion_especial,
          nombre_ocasion:      p.nombre_ocasion,
          activo:              p.activo
        });
      },
      error: err => {
        console.error('No se pudo cargar producto:', err);
        this.error = 'Error al cargar el producto';
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && file.type.startsWith('image/')) {
      this.imagenError = false;
      // parchea el form
      this.editarProductoForm.patchValue({ imagen: file });

      // genera una URL de objeto para mostrar el preview
      this.previewUrl = URL.createObjectURL(file);
    } else {
      this.imagenError = true;
      this.editarProductoForm.patchValue({ imagen: null });
      this.previewUrl = null;
    }
  }

  onEditarProductoSubmit() {
    if (this.editarProductoForm.invalid) {
      this.editarProductoForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    // 5) metemos todos los campos en formData
    Object.entries(this.editarProductoForm.value).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        formData.append(key, val as any);
      }
    });
    formData.append('id', String(this.productoId));

    this.productosSvc.editarProducto(formData).subscribe({
      next: resp => {
        this.mensaje = 'Producto actualizado con éxito';
        setTimeout(() => this.router.navigate(['/admin/catalogo/productos']), 1200);
      },
      error: err => {
        console.error(err);
        this.error = err.error?.error || 'Error al actualizar';
      }
    });
  }

  volver() {
    this.router.navigate(['/admin/catalogo/productos']);
  }
}
