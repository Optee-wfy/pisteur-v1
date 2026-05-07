import {
  fullEnrichErrorResponseSchema,
  fullEnrichWebhookEventSchema,
} from "@optee/constants";
import { FullEnrichProvider } from "@optee/fullenrich-server";
import { formatZodError } from "@optee/utils";
import type { Request, Response } from "express";

/**
 * Webhook endpoint used by FullEnrich to notify us of bulk enrichment lifecycle events.
 * The handler validates the payload, acknowledges intermediate notifications, and
 * retrieves the final enrichment payload once the job is completed.
 */
export const fullEnrichController = async (req: Request, res: Response) => {
  // TODO: when FullEnrich will expose a signature header, verify it against the raw body

  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("[FullEnrich] Received empty request body");
      throw new Error("[FullEnrich] Empty request body");
    }

    const eventParse = fullEnrichWebhookEventSchema.safeParse(req.body);

    if (!eventParse.success || !eventParse.data) {
      // Check if it's an error payload
      const errorParse = fullEnrichErrorResponseSchema.safeParse(req.body);

      if (errorParse.success && errorParse.data) {
        console.error(
          "[FullEnrich] Received webhook error payload",
          JSON.stringify(errorParse.data),
        );
        res.status(400).json({
          received: false,
          error: "Received error payload from FullEnrich",
          details: errorParse.data,
        });
        return;
      }

      const formattedErrors = eventParse.error
        ? formatZodError(eventParse.error).errors
        : null;
      console.error(
        "[FullEnrich] Received webhook with invalid payload",
        JSON.stringify({
          formattedErrors,
          input: req.body,
          contentType: req.headers["content-type"],
        }),
      );

      res.status(400).json({
        received: false,
        error: "Invalid payload format",
        details: formattedErrors,
      });
      return;
    }

    const enrichmentId = eventParse.data.id;

    if (!enrichmentId) {
      console.error(
        "[FullEnrich] Received webhook with invalid or missing enrichment ID",
        JSON.stringify(eventParse.data),
      );
      res.status(404).json({
        received: false,
        error: "Missing enrichment identifier in webhook payload",
      });
      return;
    }

    try {
      await FullEnrichProvider.handleFullEnrichEvent(
        eventParse.data,
        enrichmentId,
      );
      res.json({ received: true });
    } catch (fetchError) {
      console.error(
        `[FullEnrich] Failed to retrieve enrichment result (${enrichmentId})`,
        fetchError,
      );
      res.status(500).json({
        received: false,
        error: "Echec lors de la récupération des résultats d'enrichissement",
      });
    }
  } catch (err) {
    console.error(
      "[FullEnrich] Failed to parse webhook body:",
      (err as Error).message,
    );
    res.status(400).json({
      received: false,
      error: "Invalid JSON payload",
    });
    return;
  }
};
