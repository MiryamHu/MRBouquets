
import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // optimiza detección de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),

    // rutas
    provideRouter(routes),

    // habilitamos cliente-SSR
    provideClientHydration(withEventReplay()),

    // HttpClient usando fetch() + carga tus interceptores
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    )
  ]
};
