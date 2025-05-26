import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  template: `
    <div class="contacto-container">
      <div class="contacto-contenido">
        <h1>Contacta con Nosotros</h1>
        <p class="descripcion">¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.</p>
        
        <div class="contacto-grid">
          <div class="info-contacto">
            <div class="info-item">
              <i class="bi bi-telephone"></i>
              <div>
                <h3>Teléfono</h3>
                <p>+34 912 345 678</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="bi bi-envelope"></i>
              <div>
                <h3>Email</h3>
                <p>info&#64;mrbouquets.com</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="bi bi-clock"></i>
              <div>
                <h3>Horario</h3>
                <p>Lunes - Sábado: 9:00 - 20:00</p>
              </div>
            </div>
            
            <div class="info-item">
              <i class="bi bi-geo-alt"></i>
              <div>
                <h3>Ubicación</h3>
                <p>Calle Principal 123, Madrid</p>
              </div>
            </div>
          </div>
          
          <form class="formulario-contacto" (ngSubmit)="enviarMensaje()">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" [(ngModel)]="mensaje.nombre" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" [(ngModel)]="mensaje.email" required>
            </div>
            
            <div class="form-group">
              <label for="asunto">Asunto</label>
              <input type="text" id="asunto" name="asunto" [(ngModel)]="mensaje.asunto" required>
            </div>
            
            <div class="form-group">
              <label for="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" rows="5" [(ngModel)]="mensaje.contenido" required></textarea>
            </div>
            
            <button type="submit" class="btn-enviar">Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .contacto-container {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 4rem 0;
    }

    .contacto-contenido {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 1rem;
      font-size: 2.5rem;
    }

    .descripcion {
      text-align: center;
      color: #666;
      margin-bottom: 3rem;
      font-size: 1.1rem;
    }

    .contacto-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 3rem;
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .info-contacto {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .info-item i {
      font-size: 1.5rem;
      color: #ff4081;
      background: #fff5f8;
      padding: 1rem;
      border-radius: 50%;
    }

    .info-item h3 {
      color: #333;
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
    }

    .info-item p {
      color: #666;
      margin: 0;
    }

    .formulario-contacto {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: #333;
      font-weight: 500;
    }

    .form-group input,
    .form-group textarea {
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      border-color: #ff4081;
      box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
      outline: none;
    }

    .btn-enviar {
      background: linear-gradient(145deg, #ff4081, #e91e63);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }

    .btn-enviar:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(233, 30, 99, 0.2);
    }

    @media (max-width: 768px) {
      .contacto-container {
        padding: 2rem 0;
      }

      .contacto-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 1.5rem;
      }

      .info-contacto {
        gap: 1.5rem;
      }
    }
  `]
})
export class ContactoComponent {
  mensaje = {
    nombre: '',
    email: '',
    asunto: '',
    contenido: ''
  };

  enviarMensaje() {
    // Implementar lógica de envío
    console.log('Mensaje enviado:', this.mensaje);
  }
} 