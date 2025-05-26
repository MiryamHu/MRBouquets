import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { MenuComponent } from '../home/menu/menu.component';

@Component({
  selector: 'app-garantia',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, MenuComponent],
  template: `
    <app-menu></app-menu>
    <div class="garantia-container">
      <div class="garantia-header">
        <h1>Nuestra Garantía</h1>
        <p class="descripcion">Compromiso con la calidad y satisfacción de nuestros clientes</p>
      </div>

      <div class="garantia-content">
        <div class="garantia-section">
          <h2><i class="bi bi-shield-check"></i> Garantía de Calidad</h2>
          
          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(0)">
              <h3>¿Qué garantizamos?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[0]" [class.bi-chevron-up]="seccionesAbiertas[0]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[0]">
              <p>En MRbouquets garantizamos:</p>
              <ul>
                <li>Flores 100% frescas y de la mejor calidad</li>
                <li>Diseño y composición según especificaciones</li>
                <li>Entrega puntual en la fecha y hora acordada</li>
                <li>Presentación impecable de cada bouquet</li>
              </ul>
            </div>
          </div>

          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(1)">
              <h3>¿Cómo mantenemos la calidad?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[1]" [class.bi-chevron-up]="seccionesAbiertas[1]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[1]">
              <p>Nuestro proceso de calidad incluye:</p>
              <ul>
                <li>Selección rigurosa de proveedores</li>
                <li>Control de temperatura en almacenamiento</li>
                <li>Inspección visual de cada flor</li>
                <li>Manejo cuidadoso durante el transporte</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="garantia-section">
          <h2><i class="bi bi-arrow-repeat"></i> Política de Devoluciones</h2>
          
          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(2)">
              <h3>¿Cuándo puedo solicitar una devolución?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[2]" [class.bi-chevron-up]="seccionesAbiertas[2]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[2]">
              <p>Puedes solicitar una devolución en los siguientes casos:</p>
              <ul>
                <li>Flores marchitas o en mal estado al recibirlas</li>
                <li>Error en el diseño o composición del bouquet</li>
                <li>Entrega fuera del horario acordado</li>
                <li>Daños durante el transporte</li>
              </ul>
            </div>
          </div>

          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(3)">
              <h3>¿Cómo funciona el proceso de devolución?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[3]" [class.bi-chevron-up]="seccionesAbiertas[3]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[3]">
              <p>El proceso de devolución es simple:</p>
              <ol>
                <li>Contacta con nuestro servicio al cliente dentro de las 24 horas posteriores a la entrega</li>
                <li>Proporciona fotos del producto y el número de pedido</li>
                <li>Nuestro equipo evaluará tu caso</li>
                <li>Si procede, te ofreceremos una reposición o reembolso completo</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="garantia-section">
          <h2><i class="bi bi-heart"></i> Compromiso con el Cliente</h2>
          
          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(4)">
              <h3>¿Qué nos hace diferentes?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[4]" [class.bi-chevron-up]="seccionesAbiertas[4]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[4]">
              <p>Nuestro compromiso se basa en:</p>
              <ul>
                <li>Atención personalizada 24/7</li>
                <li>Diseños únicos y creativos</li>
                <li>Materias primas de primera calidad</li>
                <li>Entrega puntual y cuidadosa</li>
                <li>Satisfacción garantizada</li>
              </ul>
            </div>
          </div>

          <div class="garantia-item">
            <div class="pregunta" (click)="toggleSeccion(5)">
              <h3>¿Cómo nos aseguramos de tu satisfacción?</h3>
              <i class="bi" [class.bi-chevron-down]="!seccionesAbiertas[5]" [class.bi-chevron-up]="seccionesAbiertas[5]"></i>
            </div>
            <div class="respuesta" [class.activa]="seccionesAbiertas[5]">
              <p>Para garantizar tu satisfacción:</p>
              <ul>
                <li>Realizamos seguimiento post-venta</li>
                <li>Ofrecemos asesoramiento personalizado</li>
                <li>Mantenemos comunicación constante</li>
                <li>Escuchamos y valoramos tus opiniones</li>
                <li>Mejoramos continuamente nuestros servicios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .garantia-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f8, #ffffff);
      padding: 4rem 2rem;
    }

    .garantia-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 4rem;
    }

    .garantia-header h1 {
      color: #333;
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .garantia-header .descripcion {
      color: #666;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    .garantia-content {
      max-width: 1000px;
      margin: 0 auto;
    }

    .garantia-section {
      margin-bottom: 3rem;
    }

    .garantia-section h2 {
      color: #ff4081;
      font-size: 1.8rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .garantia-section h2 i {
      font-size: 2rem;
    }

    .garantia-item {
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

    @media (max-width: 768px) {
      .garantia-container {
        padding: 3rem 1rem;
      }

      .garantia-header h1 {
        font-size: 2rem;
      }

      .garantia-section h2 {
        font-size: 1.5rem;
      }

      .pregunta h3 {
        font-size: 1rem;
      }
    }
  `]
})
export class GarantiaComponent {
  seccionesAbiertas: boolean[] = Array(6).fill(false);

  toggleSeccion(index: number) {
    this.seccionesAbiertas[index] = !this.seccionesAbiertas[index];
  }
} 