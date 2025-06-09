import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { OcasionesService, Ocasion } from '../../../services-admin/ocasiones.service';
import { DialogoCrearOcasionComponent } from '../dialogo-crear-ocasion/dialogo-crear-ocasion.component';

@Component({
  selector: 'app-ocasiones',
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
    MatDialogModule
  ],
  templateUrl: './ocasiones.component.html',
  styleUrl: './ocasiones.component.css'
})
export class OcasionesComponent implements OnInit {
  displayedColumns = ['id','nombre','acciones'];
  dataSource = new MatTableDataSource<Ocasion>([]);
  loading = true;
  errorMsg  = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ocasionSvc: OcasionesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource.filterPredicate = (data: Ocasion, filter: string) => {
      const f = filter.trim().toLowerCase();
      return data.id.toString().includes(f)
          || data.nombre.toLowerCase().includes(f);
    };

    this.loadOcasiones();
  }

  private loadOcasiones() {
    this.loading = true;
    this.ocasionSvc.getOcasiones().subscribe({
      next: data => {
        this.dataSource.data      = data;
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando ocasiones', err);
        this.errorMsg = 'No se pudieron cargar las ocasiones';
        this.loading  = false;
      }
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addOcasion() {
    const ref = this.dialog.open(DialogoCrearOcasionComponent, { width: '300px' });
    ref.afterClosed().subscribe(nombre => {
      if (!nombre) return;
      this.ocasionSvc.createOcasion(nombre).subscribe({
        next: () => this.loadOcasiones(),
        error: () => alert('Error al crear ocasión')
      });
    });
  }

  deleteOcasion(o: Ocasion) {
    if (!confirm(`¿Eliminar "${o.nombre}"?`)) return;
    this.ocasionSvc.eliminarOcasion(o.id).subscribe({
      next: () => this.loadOcasiones(),
      error: () => alert('Error al eliminar ocasión')
    });
  }
}
