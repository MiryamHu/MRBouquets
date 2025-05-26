import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { MenuComponent } from '../home/menu/menu.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MenuComponent],
  template: `
    <app-menu></app-menu>
    <div class="faq-container">
      <div class="faq-header">
        <h1>Preguntas Frecuentes</h1>
        <p class="descripcion">Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios</p>
      </div>

      <div class="faq-content">
        <div class="faq-section">
          <h2><i class="bi bi-flower1"></i> Sobre Nuestros Productos</h2>
          
          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(0)">
              <h3>¿Qué tipo de flores utilizan en sus bouquets?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[0]" [class.bi-chevron-up]="preguntasAbiertas[0]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[0]">
              <p>Utilizamos flores 100% frescas y de la mejor calidad. Nuestros bouquets incluyen una selección de rosas, tulipanes, liliums, girasoles y flores de temporada, todas cuidadosamente seleccionadas para garantizar su frescura y durabilidad.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(1)">
              <h3>¿Cuánto tiempo duran los bouquets?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[1]" [class.bi-chevron-up]="preguntasAbiertas[1]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[1]">
              <p>Nuestros bouquets están diseñados para durar entre 7-10 días con los cuidados adecuados. Incluimos instrucciones de cuidado con cada entrega para ayudarte a mantener tus flores frescas por más tiempo.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(2)">
              <h3>¿Puedo personalizar mi bouquet?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[2]" [class.bi-chevron-up]="preguntasAbiertas[2]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[2]">
              <p>Sí, ofrecemos opciones de personalización para nuestros bouquets. Puedes elegir los colores, tipos de flores y agregar elementos adicionales como tarjetas personalizadas o chocolates. Contacta con nuestro servicio al cliente para más detalles.</p>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <h2><i class="bi bi-truck"></i> Envíos y Entregas</h2>
          
          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(3)">
              <h3>¿En qué zonas realizan entregas?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[3]" [class.bi-chevron-up]="preguntasAbiertas[3]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[3]">
              <p>Realizamos entregas en toda España peninsular. Las entregas en Madrid se realizan el mismo día, mientras que para el resto de la península el plazo es de 24-48 horas. Para más detalles sobre zonas específicas, consulta nuestra sección de envíos.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(4)">
              <h3>¿Puedo programar una entrega para una fecha específica?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[4]" [class.bi-chevron-up]="preguntasAbiertas[4]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[4]">
              <p>Sí, puedes programar tu entrega hasta con 30 días de anticipación. Durante el proceso de compra, podrás seleccionar la fecha y franja horaria de entrega que mejor te convenga.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(5)">
              <h3>¿Qué pasa si no hay nadie en casa para recibir el pedido?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[5]" [class.bi-chevron-up]="preguntasAbiertas[5]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[5]">
              <p>Si no hay nadie en casa, intentaremos contactarte para reprogramar la entrega. También puedes dejar instrucciones especiales durante el proceso de compra, como dejar el pedido con un vecino o en un lugar seguro.</p>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <h2><i class="bi bi-credit-card"></i> Pagos y Devoluciones</h2>
          
          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(6)">
              <h3>¿Qué métodos de pago aceptan?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[6]" [class.bi-chevron-up]="preguntasAbiertas[6]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[6]">
              <p>Aceptamos todas las tarjetas de crédito y débito principales (Visa, MasterCard, American Express), PayPal, y transferencia bancaria. Todos los pagos son procesados de forma segura.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(7)">
              <h3>¿Cuál es la política de devoluciones?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[7]" [class.bi-chevron-up]="preguntasAbiertas[7]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[7]">
              <p>Si no estás satisfecho con tu compra, puedes solicitar una devolución dentro de las 24 horas posteriores a la entrega. Para más detalles, consulta nuestra política de garantía y devoluciones.</p>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <h2><i class="bi bi-person"></i> Cuenta y Pedidos</h2>
          
          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(8)">
              <h3>¿Cómo puedo crear una cuenta?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[8]" [class.bi-chevron-up]="preguntasAbiertas[8]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[8]">
              <p>Puedes crear una cuenta haciendo clic en "Iniciar Sesión" en la parte superior de la página y seleccionando "Registrarse". El proceso es rápido y te permitirá realizar compras más rápidamente, guardar direcciones y hacer seguimiento de tus pedidos.</p>
            </div>
          </div>

          <div class="faq-item">
            <div class="pregunta" (click)="togglePregunta(9)">
              <h3>¿Cómo puedo hacer seguimiento de mi pedido?</h3>
              <i class="bi" [class.bi-chevron-down]="!preguntasAbiertas[9]" [class.bi-chevron-up]="preguntasAbiertas[9]"></i>
            </div>
            <div class="respuesta" [class.activa]="preguntasAbiertas[9]">
              <p>Una vez que tu pedido sea confirmado, recibirás un email con un número de seguimiento. También puedes hacer seguimiento de tu pedido desde tu cuenta en la sección "Mis Pedidos".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .faq-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f8, #ffffff);
      padding: 4rem 2rem;
    }

    .faq-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 4rem;
    }

    .faq-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .faq-header .descripcion {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .faq-content {
      max-width: 1000px;
      margin: 0 auto;
    }

    .faq-section {
      margin-bottom: 3rem;
    }

    .faq-section h2 {
      color: #ff4081;
      font-size: 1.8rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .faq-section h2 i {
      font-size: 2rem;
    }

    .faq-item {
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
      margin: 0;
    }

    @media (max-width: 768px) {
      .faq-container {
        padding: 3rem 1rem;
      }

      .faq-header h1 {
        font-size: 2rem;
      }

      .faq-section h2 {
        font-size: 1.5rem;
      }

      .pregunta h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class FaqComponent {
  preguntasAbiertas: boolean[] = Array(10).fill(false);

  togglePregunta(index: number) {
    this.preguntasAbiertas[index] = !this.preguntasAbiertas[index];
  }
} 