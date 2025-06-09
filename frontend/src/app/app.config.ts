// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1) Todos los providers de BrowserModule
    importProvidersFrom(BrowserModule),

    // 2) Configuración del router con tus rutas
    provideRouter(routes),

    // 3) HttpClient con interceptores
    provideHttpClient(
      withInterceptorsFromDi()
    )
  ]
};
