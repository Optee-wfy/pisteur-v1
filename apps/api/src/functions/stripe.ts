import { StripeProvider } from "@optee/stripe-server";
import type { Request, Response } from "express";
import Stripe from "stripe";

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"] ?? "";
if (!stripeSecretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY not set — Stripe routes disabled.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" }) : null;

const webHookSecret = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";
if (!webHookSecret) {
  console.warn("⚠️ STRIPE_WEBHOOK_SECRET not set — Stripe webhooks disabled.");
}

export const stripeController = async (req: Request, res: Response) => {
  if (!stripe || !webHookSecret) {
    return res.status(503).send("Stripe not configured");
  }

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
    if (stripe && err instanceof stripe.errors.StripeSignatureVerificationError) {
      console.error("[Stripe] Signature verification failed:", (err as Error).message);
      return res.status(400).send("Invalid signature");
    }
    console.error("[Stripe] Webhook error:", err);
    return res.status(500).send("Webhook handler failed");
  }
};
