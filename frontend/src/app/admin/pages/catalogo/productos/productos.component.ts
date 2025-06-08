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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DialogoEliminarProductoComponent } from '../dialogo-eliminar-producto/dialogo-eliminar-producto.component';

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
    MatSelectModule,
    MatDialogModule,
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

  productosTodos: Producto[] = [];
  ocasiones: Ocasion[] = [];
  filtros = {
    busqueda: '',
    esEspecial: false,
    nombreOcasion: null as string|null
  };

  constructor(
    private productosSvc: ProductosService,
    private ramosSvc: RamosService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // cargar ocasiones
    this.ramosSvc.getOcasiones().subscribe({
      next: oc => this.ocasiones = oc,
      error: () => this.ocasiones = []
    });
    // cargar productos
    this.loadProductos();
  }

  private loadProductos() {
    this.loading = true;
    this.productosSvc.getProductos().subscribe({
      next: resp => {
        if (resp.success) {
          this.productosTodos = resp.data;
          this.dataSource.data = this.productosTodos;

          setTimeout(() => this.dataSource.paginator = this.paginator);
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

  applyFilter(value: string) {
    this.filtros.busqueda = value.trim().toLowerCase();
    this.aplicarFiltros();
  }

  private aplicarFiltros() {
    this.dataSource.data = this.productosTodos.filter(prod => {
      const b = !this.filtros.busqueda
        || prod.id.toString().includes(this.filtros.busqueda)
        || prod.nombre.toLowerCase().includes(this.filtros.busqueda);
      if (!this.filtros.esEspecial) return b;
      if (!prod.es_ocasion_especial) return false;
      if (!this.filtros.nombreOcasion) return true;
      return prod.nombre_ocasion === this.filtros.nombreOcasion;
    });
  }

  editarProducto(p: Producto) {
    this.router.navigate(['/admin/catalogo/productos/editar', p.id]);
  }

  eliminarProducto(producto: Producto) {
    const dialogRef = this.dialog.open(DialogoEliminarProductoComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Seguro que quieres eliminar "${producto.nombre}"?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.productosSvc.deleteProducto(producto.id).subscribe({
          next: () => this.loadProductos(),
          error: () => alert('Error al eliminar el producto')
        });
      }
    });
  }
}
