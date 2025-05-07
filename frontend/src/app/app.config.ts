// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1) Todos los providers de BrowserModule (renderer, sanitizers, etc.)
    importProvidersFrom(BrowserModule),

    // 2) Optimización de change detection
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 3) Soporte a hydration (SSR) si lo usas
    provideClientHydration(withEventReplay()),

    // 4) HttpClient basado en fetch + tus interceptores
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),

    // 5) Configuración del router con tus rutas
    provideRouter(routes),
  ]
};
