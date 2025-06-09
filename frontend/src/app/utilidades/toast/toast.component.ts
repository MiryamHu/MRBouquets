import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div class="toast" [class]="type" [class.visible]="isVisible">
        <div class="toast-icon">
          <i class="bi" [class]="iconClass"></i>
        </div>
        <span class="toast-message">{{ message }}</span>
        <button class="close-button" (click)="close()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 120px;
      right: 80px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      background: white;
      border-radius: 8px;
      padding: 16px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 4px solid;
      transform: translateX(120%);
      transition: all 0.3s ease-in-out;
      opacity: 0;
    }

    .toast.visible {
      transform: translateX(0);
      opacity: 1;
    }

    .toast.success {
      border-left-color: #4CAF50;
    }

    .toast.error {
      border-left-color: #f44336;
    }

    .toast.info {
      border-left-color: #2196F3;
    }

    .toast.warning {
      border-left-color: #ff9800;
    }

    .toast-icon {
      margin-right: 12px;
      font-size: 1.2rem;
    }

    .toast.success .toast-icon {
      color: #4CAF50;
    }

    .toast.error .toast-icon {
      color: #f44336;
    }

    .toast.info .toast-icon {
      color: #2196F3;
    }

    .toast.warning .toast-icon {
      color: #ff9800;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      color: #333;
    }

    .close-button {
      margin-left: 8px;
      color: #666;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: #333;
    }

    @media (max-width: 480px) {
      .toast-container {
        right: 30px;
        left: 30px;
      }

      .toast {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class ToastComponent implements OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  @Input() duration: number = 3000;
  @Input() onClose: () => void = () => {};

  isVisible = false;
  iconClass = 'bi-info-circle';
  private timeoutId: any;

  ngOnInit() {
    // Configurar el ícono según el tipo
    switch (this.type) {
      case 'success':
        this.iconClass = 'bi-check-circle-fill';
        break;
      case 'error':
        this.iconClass = 'bi-exclamation-circle-fill';
        break;
      case 'warning':
        this.iconClass = 'bi-exclamation-triangle-fill';
        break;
      default:
        this.iconClass = 'bi-info-circle-fill';
    }

    // Mostrar el toast
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Configurar el temporizador para cerrar
    if (this.duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  close() {
    this.isVisible = false;
    setTimeout(() => {
      this.onClose();
    }, 300); // Esperar a que termine la transición
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
} 