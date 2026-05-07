import { yousignHookEventSchema } from "@optee/constants";
import { formatZodError } from "@optee/utils";
import { YouSignProvider } from "@optee/yousign-server";
import type { Request, Response } from "express";
import crypto from "node:crypto";
import { HttpError } from "./helpers/http-error";

const secret = process.env["YOUSIGN_WEBHOOK_SECRET_KEY"];

if (!secret) {
  throw new Error(
    "Missing required environment variable: YOUSIGN_WEBHOOK_SECRET_KEY",
  );
}

/**
 * Resource used by Yousign (only) to transmit signature's events that triggers internal workflows.
 * @see doc - https://developers.yousign.com/docs/use-webhooks-in-your-app
 * @see events - https://developers.yousign.com/docs/webhooks#signature-request-events
 * @see config - https://yousign.app/auth/workspace/integrations/webhooks/8c2e612b-2d5f-462e-b79c-7b402d51f17e
 */
export const yousignController = async (req: Request, res: Response) => {
  try {
    const body = await verifySignatureAndParseBody(req);

    const {
      data: parsedBody,
      success: validSchema,
      error,
    } = yousignHookEventSchema.safeParse(body);

    if (!validSchema || error || !parsedBody) {
      const errors = formatZodError(error).errors;

      console.error(
        "Failed to receive YS event: invalid input...",
        errors?.join(", ") ?? body,
      );
      res.json({ received: true });
      return;
    }

    const entity = await YouSignProvider.getRelatedEntity(
      parsedBody.data.signature_request.id,
    );

    const entityUuid = entity?.data ? entity.data.uuid : null;

    if (!entity || !entityUuid || !entity.data) {
      console.error(
        "Un évènement Yousign a été reçu, mais il ne correspond à aucune entité de notre application..",
        parsedBody,
      );
      res.json({ received: true });
      return;
    }

    if (
      [
        "signature_request.canceled",
        "signature_request.expired",
        "signature_request.deleted",
      ].includes(parsedBody.event_name)
    ) {
      res.json({ received: true });
      return;
    }

    try {
      await YouSignProvider.handleYousignEvent(parsedBody.event_name, entity);
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing failed", error);
      res.status(500).json({
        received: false,
        error: "Webhook processing failed. Check console for more information.",
      });
    }
  } catch (error: unknown) {
    console.error("Yousign webhook error:", error);

    // Handle HttpError with proper status code
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({
        received: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        received: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
};

async function verifySignatureAndParseBody(req: Request) {
  /* 1️⃣  Récupération du corps brut — body-parser.raw() fournit automatiquement un Buffer */
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;

  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    throw HttpError.badRequest("Empty or invalid body");
  }

  /* 2️⃣  Signature envoyée par Yousign (en-tête X-Yousign-Signature-256) */
  const signatureHeader = req.headers["x-yousign-signature-256"];
  if (!signatureHeader || typeof signatureHeader !== "string") {
    throw HttpError.badRequest("Invalid header");
  }
  const signature = Buffer.from(signatureHeader, "utf8");

  if (!secret) {
    throw new Error("Missing YOUSIGN_WEBHOOK_SECRET_KEY environment variable.");
  }

  /* 3️⃣  Calcul de la signature HMAC SHA-256 sur le corps brut */
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const computedSignature = Buffer.from(`sha256=${digest}`, "utf8");

  /* 4️⃣  Comparaison sans faille de temps */
  if (
    signature.length !== computedSignature.length ||
    !crypto.timingSafeEqual(signature, computedSignature)
  ) {
    throw HttpError.unauthorized("Invalid signature");
  }

  /* 5️⃣  Signature OK : on peut transformer le corps en JSON et traiter l'évènement */
  return JSON.parse(rawBody.toString("utf8"));
}
