import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="pie-pagina">
      <div class="pie-pagina-contenido">
        <div class="columna-footer">
          <h4>Sobre MRbouquets</h4>
          <p class="descripcion-footer">
            Creamos bouquets únicos que transmiten emociones. Nuestros arreglos florales son diseñados con amor y cuidado, 
            utilizando las flores más frescas para entregar belleza y alegría directamente a tu puerta.
          </p>
          <div class="redes-sociales">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener" aria-label="TikTok">
              <i class="bi bi-tiktok"></i>
            </a>
            <a href="https://pinterest.com/" target="_blank" rel="noopener" aria-label="Pinterest">
              <i class="bi bi-pinterest"></i>
            </a>
          </div>
        </div>

        <div class="columna-footer">
          <h4>Servicio al Cliente</h4>
          <div class="info-contacto">
            <p><i class="bi bi-headset"></i> +34 912 345 678</p>
            <p><i class="bi bi-envelope"></i> info&#64;mrbouquets.com</p>
            <p><i class="bi bi-clock"></i> Lun-Sáb: 9:00-20:00</p>
            <p><i class="bi bi-truck"></i> Entrega en 24h</p>
            <p><i class="bi bi-flower1"></i> Flores 100% frescas</p>
          </div>
        </div>

        <div class="columna-footer enlaces-rapidos">
          <h4>Enlaces Útiles</h4>
          <div class="grid-enlaces">
            <a href="/catalogo"><i class="bi bi-flower3"></i> Catálogo</a>
            <a href="/ocasiones"><i class="bi bi-gift"></i> Ocasiones</a>
            <a href="/cuidados"><i class="bi bi-droplet"></i> Cuidado Floral</a>
            <a href="/envios"><i class="bi bi-box-seam"></i> Envíos</a>
            <a href="/garantia"><i class="bi bi-shield-check"></i> Garantía</a>
            <a href="/faq"><i class="bi bi-question-circle"></i> FAQ</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2024 MRbouquets. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .pie-pagina {
      background: linear-gradient(135deg, #fff0f3, #ffe4e9);
      color: #333;
      padding: 2rem 2rem 1rem;
      position: relative;
      overflow: hidden;
      width: 100%;
    }

    .pie-pagina::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(to right, #ff4081, #ff6b9c);
    }

    .pie-pagina-contenido {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 2rem;
    }

    .columna-footer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .columna-footer h4 {
      color: #ff4081;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .descripcion-footer {
      line-height: 1.5;
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .redes-sociales {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .redes-sociales a {
      color: #ff4081;
      font-size: 1.4rem;
      transition: all 0.3s ease;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 64, 129, 0.1);
    }

    .redes-sociales a:hover {
      color: white;
      background: #ff4081;
      transform: translateY(-3px);
    }

    .info-contacto {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .info-contacto p {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .info-contacto i {
      color: #ff4081;
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }

    .grid-enlaces {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem;
    }

    .grid-enlaces a {
      color: #666;
      text-decoration: none;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .grid-enlaces a:hover {
      color: #ff4081;
      transform: translateX(3px);
    }

    .grid-enlaces i {
      font-size: 0.9rem;
      color: #ff4081;
    }

    .footer-bottom {
      max-width: 1200px;
      margin: 1.5rem auto 0;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 64, 129, 0.2);
      text-align: center;
    }

    .footer-bottom p {
      color: #666;
      font-size: 0.85rem;
      margin: 0;
      width: 100%;
    }

    @media (max-width: 768px) {
      .pie-pagina {
        padding: 2rem 1rem 1rem;
      }

      .pie-pagina-contenido {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .grid-enlaces {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class FooterComponent {} 