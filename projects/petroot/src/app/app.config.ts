import { ApplicationConfig, ErrorHandler, Injector, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ExtendHttpInterceptor } from './extend-http.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { GlobalErrorHandler } from './error-handler.component';
import { LocalStorageService, ServiceMeta } from 'jconsumer-shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideHttpClient(withInterceptorsFromDi()), // Include interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ExtendHttpInterceptor,
      multi: true
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler, deps: [ServiceMeta, LocalStorageService, Injector] },
    provideRouter(routes)]
};
