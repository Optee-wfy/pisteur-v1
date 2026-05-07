import { StripeProvider } from "@optee/stripe-server";
import type { Request, Response } from "express";
import Stripe from "stripe";

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
if (!stripeSecretKey) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

const webHookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
if (!webHookSecret) {
  throw new Error(
    "Missing required environment variable: STRIPE_WEBHOOK_SECRET",
  );
}

/**
 * Controller used by Stripe (only) to transmit webhook events to our server.
 */
export const stripeController = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    return res.status(400).send("Missing Stripe signature");
  }

  try {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      return res.status(400).send("Raw body is required for Stripe webhooks");
    }

    const event = stripe.webhooks.constructEvent(rawBody, sig, webHookSecret);
    await StripeProvider.handleStripeEvent(event);

    return res.json({ received: true });
  } catch (err) {
    if (err instanceof stripe.errors.StripeSignatureVerificationError) {
      console.error("[Stripe] Signature verification failed:", err.message);
      return res.status(400).send("Invalid signature");
    }
    console.error("[Stripe] Webhook error:", err);
    return res.status(500).send("Webhook handler failed");
  }
};
