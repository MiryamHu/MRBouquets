import { Component, Inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule }   from '@angular/material/button';

@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [
        CommonModule,
    MatDialogModule, 
    MatButtonModule
  ],
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrl: './dialogo-confirmacion.component.css'
})
export class DialogoConfirmacionComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogoConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ){}
}
