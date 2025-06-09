import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type } from '@angular/core';
import { ToastComponent } from '../utilidades/toast/toast.component';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: ComponentRef<ToastComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  show(config: ToastConfig) {
    // Crear el componente toast
    const toastComponent = createComponent(ToastComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    // Configurar el toast
    const toast = toastComponent.instance;
    toast.message = config.message;
    toast.type = config.type || 'info';
    toast.duration = config.duration || 3000;
    toast.onClose = () => this.removeToast(toastComponent);

    // Agregar el toast al DOM
    document.body.appendChild(toastComponent.location.nativeElement);
    this.appRef.attachView(toastComponent.hostView);
    this.toasts.push(toastComponent);

    // Limpiar toasts antiguos si hay más de 3
    if (this.toasts.length > 3) {
      const oldToast = this.toasts.shift();
      if (oldToast) {
        this.removeToast(oldToast);
      }
    }
  }

  private removeToast(toast: ComponentRef<ToastComponent>) {
    const index = this.toasts.indexOf(toast);
    if (index > -1) {
      this.toasts.splice(index, 1);
      this.appRef.detachView(toast.hostView);
      toast.destroy();
    }
  }

  success(message: string, duration?: number) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number) {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number) {
    this.show({ message, type: 'warning', duration });
  }
} 