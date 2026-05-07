import { DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData } from "@angular/common";
import { provideHttpClient, withFetch } from "@angular/common/http";
import localeFr from "@angular/common/locales/fr";
import type { ApplicationConfig } from "@angular/core";
import {
  ErrorHandler,
  inject,
  LOCALE_ID,
  provideAppInitializer,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withInMemoryScrolling,
} from "@angular/router";
import { Loader } from "@googlemaps/js-api-loader";
import { PRIME_NG_CONFIG } from "@optee/config/primeng.config";
import { GOOGLE_MAPS_API_KEY } from "@optee/utils";
import * as Sentry from "@sentry/angular";
import { TraceService } from "@sentry/angular";
import { MessageService } from "primeng/api";
import { providePrimeNG } from "primeng/config";
import { appRoutes } from "./app.routes";

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: "enabled",
      }),
    ),
    provideAnimationsAsync(),
    providePrimeNG(PRIME_NG_CONFIG),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
      inject(TraceService);
    }),
    { provide: LOCALE_ID, useValue: "fr-FR" },
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: "dd MMMM yyyy" },
    },
    {
      provide: Loader,
      useValue: new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
      }),
    },
    MessageService,
  ],
};
