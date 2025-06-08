// dialogo-eliminar-producto.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialogo-eliminar-producto',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './dialogo-eliminar-producto.component.html',
  styleUrl: './dialogo-eliminar-producto.component.css'
})
export class DialogoEliminarProductoComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogoEliminarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}
}
