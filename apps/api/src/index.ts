import { API_TRPC_BASE_ROUTE } from "@optee/constants";
import { appRouter, createContext } from "@optee/trpc-server";
import * as Sentry from "@sentry/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import type { Request as ExpressRequest } from "express";
import express from "express";
import { fullEnrichController } from "./functions/fullenrich";
import {
  googleMailCallbackController,
  googleMailConnectController,
  googleMailDisconnectController,
  googleMailSendTestController,
  googleMailStatusController,
} from "./functions/google-mail";
import { helloController } from "./functions/hello";
import {
  microsoftMailCallbackController,
  microsoftMailConnectController,
  microsoftMailDisconnectController,
  microsoftMailSendTestController,
  microsoftMailStatusController,
} from "./functions/microsoft-mail";
import { stripeController } from "./functions/stripe";
import { yousignController } from "./functions/yousign";

import pino from "pino";
import { LeadsMailController } from "./functions/lead-mail";
import { mailController } from "./functions/mail";

const logger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  redact: {
    paths: ["input.email", "input.phone", "input.password", "input.token"],
    remove: true,
  },
});

interface RequestWithRawBody extends ExpressRequest {
  rawBody?: Buffer;
}

const app = express();
const RAW_BODY_LIMIT = "10mb";

// CORS configuration
app.use(
  cors({
    origin:
      process.env["VITE_ENV"] === "production"
        ? ["https://app.optee.io"]
        : true,
    credentials: true,
  }),
);

// Stripe webhook endpoint requires the raw body for signature verification
app.post(
  "/api/v1/stripe",
  express.raw({ type: "*/*", limit: RAW_BODY_LIMIT }),
  stripeController,
);

const captureRawBody: express.RequestHandler = (req, _res, next) => {
  (req as RequestWithRawBody).rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : undefined;
  next();
};

// Hello endpoint for testing - connected to functions/hello.ts
app.get("/api/v1/hello", helloController);

// Mail endpoint for testing - connected to functions/mail.ts
app.get("/api/v1/mail", mailController);

// BDNB endpoint - connected to functions/bdnb.ts
// app.options("/api/v1/bdnb", bdnbController); // CORS preflight
// app.get("/api/v1/bdnb", bdnbController);

app.get("/api/v1/test-error", () => {
  throw new Error("Sentry test error");
});

// Yousign webhook endpoint - connected to functions/yousign.ts
app.post(
  "/api/v1/yousign",
  express.raw({ type: "application/json", limit: RAW_BODY_LIMIT }),
  captureRawBody,
  yousignController,
);
// FullEnrich webhook endpoint - connected to functions/fullenrich.ts
app.post("/api/v1/fullenrich", fullEnrichController);

// JSON middleware for other routes
app.use(express.json({ limit: RAW_BODY_LIMIT }));

app.post("/api/v1/prospect/sendMail", LeadsMailController);

app.post("/api/v1/integrations/google/connect", googleMailConnectController);
app.get("/api/v1/integrations/google/callback", googleMailCallbackController);
app.get("/api/v1/integrations/google/status", googleMailStatusController);
app.delete(
  "/api/v1/integrations/google/disconnect",
  googleMailDisconnectController,
);
app.post("/api/v1/integrations/google/test", googleMailSendTestController);
app.post(
  "/api/v1/integrations/microsoft/connect",
  microsoftMailConnectController,
);
app.get(
  "/api/v1/integrations/microsoft/callback",
  microsoftMailCallbackController,
);
app.get("/api/v1/integrations/microsoft/status", microsoftMailStatusController);
app.delete(
  "/api/v1/integrations/microsoft/disconnect",
  microsoftMailDisconnectController,
);
app.post(
  "/api/v1/integrations/microsoft/test",
  microsoftMailSendTestController,
);

// tRPC middleware
app.use(
  API_TRPC_BASE_ROUTE,
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => createContext({ req }),
    onError({ error, path, type, input, req, ctx }) {
      logger.error(
        {
          path,
          type,
          input,
          err: {
            name: error.name,
            message: error.message,
            stack:
              process.env["VITE_ENV"] !== "production"
                ? error.stack
                : undefined,
            code: error.code,
          },
          trace: req.headers["x-cloud-trace-context"],
          userId: ctx?.user?.id,
        },
        "tRPC error",
      );
    },
  }),
);

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

export default app;
