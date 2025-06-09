import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule }        from '@angular/material/button';
import { MatIconModule }          from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule }      from '@angular/material/checkbox';
import { MatSelectModule }        from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Cliente, ClientesService } from '../../services-admin/clientes.service';

@Component({
  selector: 'app-cliente',
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
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  displayedColumns = ['id','nombre','apellido','correo','telefono'/*,'acciones'*/];
  dataSource = new MatTableDataSource<Cliente>([]);
  loading   = true;
  errorMsg: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clientesSvc: ClientesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // opcional: personalizar filtro (por id, nombre, apellido…)
    this.dataSource.filterPredicate = (data: Cliente, filter: string) => {
      const f = filter.trim().toLowerCase();
      return data.id.toString().includes(f)
          || data.nombre.toLowerCase().includes(f)
          || data.apellido.toLowerCase().includes(f);
    };
    this.loadClientes();
    setTimeout(() => this.dataSource.paginator = this.paginator);
  }

  private loadClientes() {
    this.loading = true;
    this.errorMsg = null;

    this.clientesSvc.getClientes().subscribe({
      next: res => {
        if (res.success) {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
        } else {
          this.errorMsg = 'Error en la respuesta del servidor';
        }
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando clientes', err);
        this.errorMsg = 'No se pudieron cargar los clientes';
        this.loading = false;
      }
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
