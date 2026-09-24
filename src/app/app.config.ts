import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { ContentStore } from './services/content-store.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),

    // Content is loaded before the first render so every public component can
    // keep reading it synchronously — no loading states, no template churn, and
    // no flash of empty copy. ContentStore.load() never rejects: if the API is
    // unreachable it falls back to the data bundled in the build.
    provideAppInitializer(() => inject(ContentStore).load())
  ]
};
