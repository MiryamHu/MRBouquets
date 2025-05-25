import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {
  formData = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  };

  horarioAtencion = {
    dias: 'Lunes a Viernes',
    horas: '9:00 - 18:00',
    sabado: 'Sábados: 10:00 - 14:00',
    domingo: 'Domingos: Cerrado'
  };

  ubicacion = {
    direccion: 'Calle Principal 123, Madrid',
    telefono: '+34 912 345 678',
    email: 'info@mrbouquets.com'
  };

  redesSociales = [
    { icon: 'bi-facebook', url: 'https://facebook.com/mrbouquets' },
    { icon: 'bi-instagram', url: 'https://instagram.com/mrbouquets' },
    { icon: 'bi-twitter', url: 'https://twitter.com/mrbouquets' },
    { icon: 'bi-whatsapp', url: 'https://wa.me/34912345678' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit() {
    // Aquí iría la lógica para enviar el formulario
    console.log('Formulario enviado:', this.formData);
    // Resetear el formulario
    this.formData = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    };
  }
} 