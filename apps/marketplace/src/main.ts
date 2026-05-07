import * as amplitude from "@amplitude/unified";
import { isDevMode } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { environment } from "@optee/env";
import {
  AMPLITUDE_API_KEY,
  POSTHOG_HOST,
  POSTHOG_KEY,
  SENTRY_MARKETPLACE_DSN,
} from "@optee/utils";
import * as Sentry from "@sentry/angular";
import posthog from "posthog-js";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

const MODULE_SCRIPT_ERROR_RE =
  /Failed to load module script|Importing a module script failed|Expected a JavaScript-or-Wasm module script|Failed to fetch dynamically imported module/i;
const MODULE_SCRIPT_RELOAD_KEY = "optee:marketplace:module-script-reload";
const MODULE_SCRIPT_RELOAD_WINDOW_MS = 5 * 60 * 1000;

const shouldReloadForModuleScriptError = (event: Event): boolean => {
  if (event instanceof ErrorEvent) {
    const errorMessage = event.message || event.error?.message;
    return Boolean(errorMessage && MODULE_SCRIPT_ERROR_RE.test(errorMessage));
  }

  if (event.target instanceof HTMLScriptElement) {
    const isModule = event.target.type === "module";
    return isModule;
  }

  return false;
};

const shouldReloadForRejectedModuleImport = (
  event: PromiseRejectionEvent,
): boolean => {
  const reason = event.reason;
  if (typeof reason === "string") {
    return MODULE_SCRIPT_ERROR_RE.test(reason);
  }

  if (reason && typeof reason === "object" && "message" in reason) {
    const message = String((reason as { message?: string }).message || "");
    return MODULE_SCRIPT_ERROR_RE.test(message);
  }

  return false;
};

const reloadAfterModuleScriptError = (): void => {
  const lastReload = Number(
    sessionStorage.getItem(MODULE_SCRIPT_RELOAD_KEY) || 0,
  );
  const now = Date.now();

  if (lastReload && now - lastReload < MODULE_SCRIPT_RELOAD_WINDOW_MS) {
    return;
  }

  sessionStorage.setItem(MODULE_SCRIPT_RELOAD_KEY, String(now));
  window.location.reload();
};

const registerModuleScriptReloadHandlers = (): void => {
  window.addEventListener(
    "error",
    (event) => {
      if (shouldReloadForModuleScriptError(event)) {
        reloadAfterModuleScriptError();
      }
    },
    true,
  );

  window.addEventListener("unhandledrejection", (event) => {
    if (shouldReloadForRejectedModuleImport(event)) {
      reloadAfterModuleScriptError();
    }
  });
};

const initAmplitude = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  const windowWithAmplitude = window as typeof window & {
    __opteeAmplitudeInitialized?: boolean;
  };
  if (windowWithAmplitude.__opteeAmplitudeInitialized) {
    return;
  }
  try {
    amplitude.initAll(AMPLITUDE_API_KEY, {
      serverZone: "EU",
      analytics: {
        autocapture: true,
      },
      sessionReplay: {
        sampleRate: 0.1,
      },
    });
    windowWithAmplitude.__opteeAmplitudeInitialized = true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation d'Amplitude :", error);
  }
};

initAmplitude();

if (!isDevMode()) {
  registerModuleScriptReloadHandlers();

  // Source: https://docs.sentry.io/platforms/javascript/guides/angular/
  Sentry.init({
    dsn: SENTRY_MARKETPLACE_DSN,
    environment: environment.slug,
    release: environment.sentryRelease,

    // Sentry plugins: https://docs.sentry.io/platforms/javascript/guides/angular/configuration/integrations/
    integrations: [
      Sentry.replayIntegration(), // Automatically captures Session Replays
      Sentry.browserSessionIntegration(), // Release Health feature; track user adoption and your application's crash-free rate.
      Sentry.browserTracingIntegration(), // With tracing, Sentry tracks your software performance, measuring metrics like throughput and latency, and displaying the impact of errors across multiple systems.
      Sentry.captureConsoleIntegration({ levels: ["error"] }), // send all console.error messages to Sentry
      Sentry.browserProfilingIntegration(),
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
    // We recommend adjusting this value in production. Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,

    tracePropagationTargets: [
      // Production principale
      /^https:\/\/app\.optee\.io/,

      // 🔧 Firebase preview deployments (PR previews)
      /^https:\/\/.*optee.*\.web\.app/,

      // 🔧 Paths relatifs pour Firebase Hosting rewrites (même domaine)
      // Techniquement pas nécessaire vu que c'est même domaine, mais explicite
      /^\/api\//,
    ],

    // Capture Replay for 10% of all sessions, plus for 100% of sessions with an error: https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // 🎯 Contexte de debugging
    sendDefaultPii: false, // Garde false pour la privacy, on va setter user manuellement
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
