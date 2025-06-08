import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { FormsModule }            from '@angular/forms';
import { MatTableModule }         from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule }     from '@angular/material/form-field';
import { MatInputModule }         from '@angular/material/input';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatTableDataSource }     from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatSelectModule }        from '@angular/material/select';

import { ProductosService, Producto } from '../../../services-admin/productos.service';
import { RamosService, Ocasion }      from '../../../../services/ramos.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  displayedColumns = [
    'id','nombre','descripcion','precio','stock',
    'tipo_flor','color','disponible','activo',
    'es_ocasion_especial','nombre_ocasion','acciones'
  ];
  dataSource = new MatTableDataSource<Producto>([]);
  loading   = true;
  errorMsg: string | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ✨ Array local para los filtros
  productosTodos: Producto[] = [];

  // ✨ Opciones de ocasión
  ocasiones: Ocasion[] = [];

  // ✨ Modelo de filtros
  filtros = {
    busqueda: '',
    esEspecial: false,
    nombreOcasion: null as string|null   // ← cambia aquí
  };

  constructor(
    private productosSvc: ProductosService,
    private ramosSvc: RamosService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar ocasiones
    this.ramosSvc.getOcasiones().subscribe({
      next: oc => this.ocasiones = oc,
      error: () => this.ocasiones = []
    });

    // Cargar productos
    this.productosSvc.getProductos().subscribe({
      next: resp => {
        if (resp.success) {
          this.productosTodos = resp.data;
          this.dataSource.data = this.productosTodos;
          this.dataSource.paginator = this.paginator;
        } else {
          this.errorMsg = 'No se pudieron cargar los productos.';
        }
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMsg = 'Error de red al cargar los productos.';
        this.loading = false;
      }
    });
  }

  /** Filtro global de texto */
  applyFilter(value: string) {
    this.filtros.busqueda = value.trim().toLowerCase();
    this.aplicarFiltros();
  }

  /** Aquí se combinan todos los filtros */
  aplicarFiltros() {
    this.dataSource.data = this.productosTodos.filter(prod => {
      // Búsqueda de texto
      const b = !this.filtros.busqueda
        || prod.id.toString().includes(this.filtros.busqueda)
        || prod.nombre.toLowerCase().includes(this.filtros.busqueda);

      // Si no está activado “solo especiales”, pasamos
      if (!this.filtros.esEspecial) {
        return b;
      }

      // Aquí ya sabemos que esEspecial === true, así que filtro por flag
      const esp = prod.es_ocasion_especial;

      if (!esp) {
        // Si no es una ocasión especial, lo descartamos
        return false;
      }

      // Si aún no se ha elegido ninguna ocasión concreta, lo dejamos pasar
      if (!this.filtros.nombreOcasion) {
        return true;
      }

      // Si eligió una ocasión, filtramos por nombre
      return prod.nombre_ocasion === this.filtros.nombreOcasion;
    });
  }


  editarProducto(p: Producto) {
    // this.router.navigate(['/admin/productos/editar', p.id]);
  }

  eliminarProducto(p: Producto) {
    // tu lógica de eliminación…
  }
}
