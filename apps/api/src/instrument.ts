import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry for API

Sentry.init({
  dsn: process.env["SENTRY_API_DSN"],
  environment: process.env["VITE_ENV"],
  // 🎯 CRUCIAL: Même release que le marketplace pour lier les erreurs
  release: process.env["SENTRY_RELEASE"] || "unknown",
  sendDefaultPii: false,
  integrations: [nodeProfilingIntegration()],
  maxBreadcrumbs: 50,
  attachStacktrace: true,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  beforeSend(event) {
    // Log les détails pour debugging
    if (event.level === "error") {
      // Only log minimal information in production
      console.error(`Sentry API Error: ${event.event_id}`);
    }
    return event;
  },
});
