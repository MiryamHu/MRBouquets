import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { MenuComponent } from '../home/menu/menu.component';

@Component({
  selector: 'app-envios',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MenuComponent],
  template: `
    <app-menu></app-menu>
    <div class="envios-container">
      <div class="envios-header">
        <h1>Información de Envíos</h1>
        <p class="descripcion">Entregamos tus bouquets con el máximo cuidado y puntualidad</p>
      </div>

      <div class="envios-content">
        <div class="envios-section">
          <h2><i class="bi bi-truck"></i> Zonas de Entrega</h2>
          
          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(0)">
              <h3>¿En qué zonas realizan entregas?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[0]" [class.bi-chevron-up]="seccionesAbiertas[0]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[0]">
              <p>Nuestras zonas de entrega incluyen:</p>
              <ul>
                <li>Madrid Capital (entrega el mismo día)</li>
                <li>Área Metropolitana de Madrid (24 horas)</li>
                <li>Resto de España peninsular (24-48 horas)</li>
                <li>Islas Baleares (48-72 horas)</li>
                <li>Islas Canarias (72-96 horas)</li>
              </ul>
            </div>
          </div>

          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(1)">
              <h3>¿Cuáles son los horarios de entrega?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[1]" [class.bi-chevron-up]="seccionesAbiertas[1]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[1]">
              <p>Nuestros horarios de entrega son:</p>
              <ul>
                <li>Lunes a Viernes: 9:00 - 21:00</li>
                <li>Sábados: 10:00 - 20:00</li>
                <li>Domingos: 10:00 - 14:00 (solo en Madrid Capital)</li>
                <li>Festivos: Consultar disponibilidad</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="envios-section">
          <h2><i class="bi bi-calendar-check"></i> Programación de Envíos</h2>
          
          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(2)">
              <h3>¿Cómo puedo programar una entrega?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[2]" [class.bi-chevron-up]="seccionesAbiertas[2]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[2]">
              <p>Para programar una entrega:</p>
              <ol>
                <li>Selecciona el producto deseado</li>
                <li>En el carrito, elige la fecha de entrega</li>
                <li>Selecciona la franja horaria preferida</li>
                <li>Proporciona la dirección de entrega</li>
                <li>Realiza el pago</li>
              </ol>
              <p class="nota">Puedes programar entregas hasta con 30 días de anticipación.</p>
            </div>
          </div>

          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(3)">
              <h3>¿Puedo modificar una entrega programada?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[3]" [class.bi-chevron-up]="seccionesAbiertas[3]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[3]">
              <p>Sí, puedes modificar tu entrega:</p>
              <ul>
                <li>Hasta 24 horas antes de la entrega programada</li>
                <li>Contactando con nuestro servicio al cliente</li>
                <li>Proporcionando el número de pedido</li>
                <li>Indicando los nuevos detalles de entrega</li>
              </ul>
              <p class="nota">Las modificaciones están sujetas a disponibilidad.</p>
            </div>
          </div>
        </div>

        <div class="envios-section">
          <h2><i class="bi bi-box-seam"></i> Cuidado y Embalaje</h2>
          
          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(4)">
              <h3>¿Cómo protegen los bouquets durante el envío?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[4]" [class.bi-chevron-up]="seccionesAbiertas[4]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[4]">
              <p>Nuestro proceso de embalaje incluye:</p>
              <ul>
                <li>Cajas especiales con control de temperatura</li>
                <li>Material de protección para cada flor</li>
                <li>Sistema de hidratación para mantener la frescura</li>
                <li>Etiquetas de manejo especial</li>
                <li>Instrucciones de cuidado incluidas</li>
              </ul>
            </div>
          </div>

          <div class="envios-item">
            <div class="pregunta" (click)="toggleSeccion(5)">
              <h3>¿Qué cuidados debo tener al recibir el bouquet?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[5]" [class.bi-chevron-up]="seccionesAbiertas[5]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[5]">
              <p>Recomendaciones para el cuidado:</p>
              <ol>
                <li>Retirar el embalaje con cuidado</li>
                <li>Colocar en un jarrón con agua fresca</li>
                <li>Mantener en un lugar fresco y alejado del sol directo</li>
                <li>Cambiar el agua cada 2-3 días</li>
                <li>Recortar los tallos ligeramente cada 3 días</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .envios-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f8, #ffffff);
      padding: 4rem 2rem;
    }

    .envios-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 4rem;
    }

    .envios-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .envios-header .descripcion {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .envios-content {
      max-width: 1000px;
      margin: 0 auto;
    }

    .envios-section {
      margin-bottom: 3rem;
    }

    .envios-section h2 {
      color: #ff4081;
      font-size: 1.8rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .envios-section h2 i {
      font-size: 2rem;
    }

    .envios-item {
      background: white;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .pregunta {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .pregunta:hover {
      background: #fff5f8;
    }

    .pregunta h3 {
      color: #333;
      font-size: 1.1rem;
      margin: 0;
      font-weight: 600;
    }

    .pregunta i {
      color: #ff4081;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .respuesta {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
      background: #fff5f8;
    }

    .respuesta.activa {
      padding: 1.5rem;
      max-height: 500px;
    }

    .respuesta p {
      color: #666;
      line-height: 1.6;
      margin: 0 0 1rem 0;
    }

    .respuesta ul, .respuesta ol {
      color: #666;
      padding-left: 1.5rem;
      margin: 0;
    }

    .respuesta li {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .nota {
      font-style: italic;
      color: #ff4081;
      margin-top: 1rem !important;
    }

    @media (max-width: 768px) {
      .envios-container {
        padding: 3rem 1rem;
      }

      .envios-header h1 {
        font-size: 2rem;
      }

      .envios-section h2 {
        font-size: 1.5rem;
      }

      .pregunta h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class EnviosComponent {
  seccionesAbiertas: boolean[] = Array(6).fill(false);

  toggleSeccion(index: number) {
    this.seccionesAbiertas[index] = !this.seccionesAbiertas[index];
  }
} 