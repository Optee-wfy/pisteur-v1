import { isDevMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { environment } from "@optee/env";
import { POSTHOG_HOST, POSTHOG_KEY, SENTRY_SHOWCASE_DSN } from "@optee/utils";
import * as Sentry from "@sentry/angular";
import posthog from "posthog-js";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

if (!isDevMode()) {
  // Source: https://docs.sentry.io/platforms/javascript/guides/angular/
  Sentry.init({
    dsn: SENTRY_SHOWCASE_DSN,
    environment: environment.slug,
    release: environment.sentryRelease,

    // Sentry plugins: https://docs.sentry.io/platforms/javascript/guides/angular/configuration/integrations/
    integrations: [
      Sentry.browserSessionIntegration(), // Release Health feature; track user adoption and your application's crash-free rate.
      Sentry.browserTracingIntegration(), // With tracing, Sentry tracks your software performance, measuring metrics like throughput and latency, and displaying the impact of errors across multiple systems.
      Sentry.browserProfilingIntegration(),
      Sentry.captureConsoleIntegration({ levels: ["error"] }), // send all console.error messages to Sentry
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    // We recommend adjusting this value in production. Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,

    tracePropagationTargets: [
      // Production principale
      /^https:\/\/www\.optee\.io/,
      /^https:\/\/optee\.io/,

      // 🔧 Firebase preview deployments (PR previews) Ex: https://optee-showcase--preview-pr-686-qi7a8ewx.web.app
      /^https:\/\/.*optee.*\.web\.app/,
    ],

    sendDefaultPii: true,
    attachStacktrace: true,
    maxBreadcrumbs: 100,

    // Enable logs to be sent to Sentry
    _experiments: { enableLogs: true },
  });

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "always",
  });
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
