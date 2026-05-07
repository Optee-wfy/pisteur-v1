import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

import type { ProStatus, StripeProPlan } from "@optee/constants";
import {
  getProPlan,
  MARKETPLACE_UI_URL,
  PRO_PLANS,
  ProSubscription,
} from "@optee/constants";
import type { ProUuid, UserUuid } from "@optee/models";
import { ProRepository } from "@optee/pro-server";
import { logError } from "@optee/utils";

const stripeSecretKey = process.env["STRIPE_SECRET_KEY"];
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" })
  : null;

const isProduction = process.env["VITE_ENV"] === "production";

if (!stripe) {
  console.warn(
    "⚠️ Stripe secret key is not set. Stripe functionality will be disabled.",
  );
  if (isProduction) {
    throw new Error("Stripe secret key is required in production environment.");
  }
}

const stripeBaseUrl = isProduction
  ? MARKETPLACE_UI_URL
  : "http://localhost:4200"; // or preview env URL
const STRIPE_SUCCESS_URL = `${stripeBaseUrl}/billing/success`;
const STRIPE_CANCEL_URL = `${stripeBaseUrl}/billing/cancel`;

const SUBSCRIPTION_PRICE_IDS: Record<string, string | undefined> = {
  [ProSubscription.ESSENTIAL]: process.env["STRIPE_PRICE_ESSENTIAL"],
  [ProSubscription.PRO]: process.env["STRIPE_PRICE_PRO"],
  [ProSubscription.PRO_PLUS]: process.env["STRIPE_PRICE_BUSINESS"],
} as const;

const ACTIVE_OR_PAST_DUE_STATUSES = new Set(["trialing", "active", "past_due"]);
const ACTIVE_STATUSES = new Set(["trialing", "active"]);
const UNPAID_STATUSES = new Set(["past_due", "unpaid"]);

type StripeCustomerLike =
  | string
  | Stripe.Customer
  | Stripe.DeletedCustomer
  | null
  | undefined;

function getCustomerId(customer: StripeCustomerLike): string | null {
  if (!customer) {
    return null;
  }
  return typeof customer === "string" ? customer : customer.id;
}

type StripeCustomerBillingDetails = Partial<
  Pick<Stripe.CustomerCreateParams, "name" | "address">
>;

function getStripeBillingDetailsFromPro(pro: {
  name: string | null;
  street: string | null;
  zipcode: string | null;
  city: string | null;
}): StripeCustomerBillingDetails {
  const name = pro.name?.trim();
  const street = pro.street?.trim();
  const zipcode = pro.zipcode?.trim();
  const city = pro.city?.trim();

  const address =
    street && street.length > 0
      ? ({
          line1: street,
          postal_code: zipcode || undefined,
          city: city || undefined,
        } satisfies Stripe.AddressParam)
      : undefined;

  return {
    ...(name ? { name } : {}),
    ...(address ? { address } : {}),
  };
}

async function getProFromCustomerId(
  customerId: string | null,
  context: string,
) {
  if (!customerId) {
    console.error(`[Stripe] Missing customer ID in ${context}`);
    return null;
  }

  const pro = await ProRepository.getByStripeCustomerId(customerId);
  if (!pro) {
    console.error("[Stripe] Pro not found for customer:", customerId);
  }

  return pro;
}

function getPriceIdFromSubscription(
  subscription: Stripe.Subscription,
): string | null {
  const price = subscription.items.data[0]?.price;
  if (!price) {
    return null;
  }
  return typeof price === "string" ? price : price.id;
}

function getPlanFromSubscription(
  subscription: Stripe.Subscription,
): StripeProPlan | null {
  return getProPlanByPriceId(getPriceIdFromSubscription(subscription));
}

function getPriceIdFromInvoiceLines(invoice: Stripe.Invoice): string | null {
  const linePrice = (
    invoice.lines?.data?.[0] as Stripe.InvoiceLineItem & {
      price?: string | Stripe.Price | null;
    }
  )?.price;
  if (!linePrice) {
    return null;
  }
  return typeof linePrice === "string" ? linePrice : linePrice.id;
}

function getStripeSubscriptionIdFromInvoice(
  invoice: Stripe.Invoice,
): string | null {
  const invoiceSubscription = (
    invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
    }
  ).subscription;

  if (typeof invoiceSubscription === "string") {
    return invoiceSubscription;
  }

  return invoiceSubscription?.id ?? null;
}

async function resolvePlanFromInvoice(
  invoice: Stripe.Invoice,
  currentSubscription: ProSubscription | null | undefined,
): Promise<StripeProPlan | null> {
  if (currentSubscription) {
    const plan = getProPlan(currentSubscription);
    if (plan?.buyable) {
      return plan;
    }
  }

  const planFromInvoiceLine = getProPlanByPriceId(
    getPriceIdFromInvoiceLines(invoice),
  );
  if (planFromInvoiceLine) {
    return planFromInvoiceLine;
  }

  const stripeSubId = getStripeSubscriptionIdFromInvoice(invoice);
  if (stripeSubId && stripe) {
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    return getPlanFromSubscription(stripeSub);
  }

  return null;
}

function getPriceId(subscription: ProSubscription): string | undefined {
  return SUBSCRIPTION_PRICE_IDS[subscription];
}

function getProPlanByPriceId(priceId: string | null): StripeProPlan | null {
  if (!priceId) {
    return null;
  }
  const plan = PRO_PLANS.filter((p) => p.buyable).find(
    (p): p is StripeProPlan => getPriceId(p.subscription) === priceId,
  );
  return plan ?? null;
}

function isStripeStatusActiveOrPastDue(
  status: string | null | undefined,
): boolean {
  return status ? ACTIVE_OR_PAST_DUE_STATUSES.has(status) : false;
}

function isStripeStatusActive(status: string | null | undefined): boolean {
  return status ? ACTIVE_STATUSES.has(status) : false;
}

function isStripeStatusUnpaid(status: string | null | undefined): boolean {
  return status ? UNPAID_STATUSES.has(status) : false;
}

function mapInvoice(invoice: Stripe.Invoice) {
  return {
    id: invoice.id,
    number: invoice.number ?? null,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
    status: invoice.status ?? null,
    total: invoice.total ?? null,
    currency: invoice.currency ?? null,
    createdAt: invoice.created
      ? new Date(invoice.created * 1000).toISOString()
      : null,
  } as const;
}

type AdminStripePrice = {
  priceId: string;
  active: boolean;
  currency: string | null;
  unitAmount: number | null;
  type: Stripe.Price.Type;
  recurringInterval: Stripe.Price.Recurring.Interval | null;
  recurringIntervalCount: number | null;
};

type AdminStripeProductClient = {
  customerId: string;
  customerEmail: string | null;
  customerName: string | null;
  subscriptionId: string;
  subscriptionStatus: Stripe.Subscription.Status;
  priceIds: Array<string>;
};

type AdminStripeProduct = {
  productId: string;
  name: string;
  description: string | null;
  active: boolean;
  defaultPriceId: string | null;
  prices: Array<AdminStripePrice>;
  clients: Array<AdminStripeProductClient>;
};

// Subscription status reference:
// trialing	L’abonnement est actuellement en période d’essai et vous pouvez fournir votre produit à votre client en toute sécurité. L’abonnement passe automatiquement à l’état active lorsqu’un client effectue son premier paiement.
// active	L’abonnement est en règle. Pour les abonnements past_due, le paiement de la dernière facture associée ou sa mise en impayé fait passer l’abonnement à l’état active. Notez que active n’indique pas que toutes les factures en cours ont été réglées. Vous pouvez laisser d’autres factures ouvertes, les mettre en impayé ou les annuler.
// incomplete	Le client doit effectuer un paiement dans les 23 heures suivant la création de l’abonnement pour l’activer. Ou une action est requise pour le paiement, telle que l’authentification du client. Les abonnements peuvent également être à l’état incomplete si un paiement est en attente et que l’état du PaymentIntent est défini sur processing.
// incomplete_expired	Le paiement initial de l’abonnement a échoué et le client n’a pas effectué de paiement dans les 23 heures suivant la création de l’abonnement. Ces abonnements ne facturent pas les clients. Cet état vous permet de suivre les clients qui n’ont pas réussi à activer leur abonnement.
// past_due	Payment on the latest finalized invoice either failed or wasn’t attempted. The subscription continues to create invoices. Your Dashboard subscription settings determine the subscription’s next status. If the invoice is still unpaid after all attempted smart retries, you can configure the subscription to move to canceled, unpaid, or leave it as past_due. To reactivate the subscription, have your customer pay the most recent invoice. The subscription status becomes active regardless of whether the payment is done before or after the latest invoice due date.
// canceled	L’abonnement a été annulé. Lors de l’annulation, l’encaissement automatique de toutes les factures impayées est désactivé (auto_advance=false). Cet état est définitif et ne peut pas être mis à jour.
// unpaid	La dernière facture n’a pas été réglée, mais l’abonnement reste actif. La dernière facture reste ouverte et les factures continuent d’être générées, mais aucune tentative de paiement n’est effectuée. Révoquez l’accès à votre produit lorsque l’abonnement passe à l’état unpaid, car des tentatives de paiement ont déjà été effectués à plusieurs reprises lorsque qu’il était à l’état past_due. Pour passer l’abonnement à l’état active, la facture la plus récente doit être réglée avant sa date d’échéance.
// paused	L’abonnement a terminé sa période d’essai sans moyen de paiement par défaut et le paramètre trial_settings.end_behavior.missing_payment_method est défini sur pause. Aucune facture n’est plus créée pour l’abonnement. Après avoir associé un moyen de paiement par défaut au client, vous pouvez reprendre l’abonnement.

export const StripeProvider = {
  async createCheckoutSession({
    subscription,
    proUuid,
    user,
  }: {
    subscription: ProSubscription;
    proUuid: ProUuid;
    user: { id: UserUuid; email: string | undefined };
  }) {
    try {
      if (!stripe) {
        throw new Error(
          "Stripe n'est pas configuré côté serveur. Merci de contacter l'administrateur.",
        );
      }

      if (!user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Email utilisateur manquant : impossible de créer une session de paiement.",
        });
      }

      const pro = await ProRepository.get(proUuid);
      if (!pro) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compte introuvable",
        });
      }

      const billingDetails = getStripeBillingDetailsFromPro({
        name: pro.name,
        street: pro.street,
        zipcode: pro.zipcode,
        city: pro.city,
      });

      const plan = getPriceId(subscription);

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Plan d'abonnement introuvable pour ${subscription ?? "inconnu"}.`,
        });
      }

      // 1. Récupérer / créer le customer Stripe
      let customerId = pro.stripeCustomerId ?? null;
      let shouldPersistCustomerId = false;

      if (customerId) {
        try {
          // Met à jour les infos si le client existe déjà
          if (billingDetails.name || billingDetails.address) {
            await stripe.customers.update(customerId, billingDetails);
          } else {
            await stripe.customers.retrieve(customerId);
          }
        } catch (err) {
          console.warn(
            "[Stripe] Stored customerId not found, will re-create:",
            customerId,
            err instanceof Error ? err.message : err,
          );
          customerId = null;
        }
      }

      if (!customerId) {
        const existingCustomers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        });
        customerId = existingCustomers.data[0]?.id ?? null;
        if (customerId && (billingDetails.name || billingDetails.address)) {
          await stripe.customers.update(customerId, billingDetails);
        }
        shouldPersistCustomerId = !!customerId;
      }

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          ...billingDetails,
          metadata: {
            userId: user.id,
            proId: pro.uuid,
          },
        });
        customerId = customer.id;
        shouldPersistCustomerId = true;
      }

      if (shouldPersistCustomerId && pro.stripeCustomerId !== customerId) {
        await ProRepository.update(pro.uuid, {
          stripeCustomerId: customerId,
        });
      }

      // 2. Créer la session Checkout
      const cancelUrl = `${STRIPE_CANCEL_URL}?subscription=${encodeURIComponent(
        subscription,
      )}`;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price: plan,
            quantity: 1,
          },
        ],
        success_url: `${STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        // Pour restreindre la possibilité de changer de prix, etc.
        // allow_promotion_codes: true,
        metadata: {
          userId: user.id,
          proId: pro.uuid,
          subscription: subscription,
          ...(pro.stripeSubscriptionId && {
            previousSubscriptionId: pro.stripeSubscriptionId,
          }),
        },
      });

      if (!session.url) {
        throw new Error("La session Stripe n'a pas retourné d'URL de paiement");
      }

      return { url: session.url };
    } catch (err) {
      console.error("[Stripe] Failed to create checkout session:", err);

      if (err instanceof TRPCError) {
        throw err;
      }

      if (err instanceof Stripe.errors.StripeInvalidRequestError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Demande de paiement invalide. Merci de vérifier vos informations et de réessayer.",
          cause: err,
        });
      }

      if (err instanceof Stripe.errors.StripeAPIError) {
        throw new TRPCError({
          code: "TIMEOUT",
          message:
            "Le service de paiement Stripe est momentanément indisponible. Merci de réessayer.",
          cause: err,
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "La création de la session de paiement a échoué; Si le problème persiste, merci de contacter le support.",
        cause: err,
      });
    }
  },

  async getCheckoutSession({
    sessionId,
    proUuid,
    userUuid,
  }: {
    sessionId: string;
    proUuid: ProUuid;
    userUuid: UserUuid;
  }) {
    if (!stripe) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Stripe n'est pas configuré côté serveur. Merci de contacter l'administrateur.",
      });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "subscription"],
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session Stripe introuvable.",
        });
      }

      if (
        session.metadata?.["proId"] &&
        session.metadata?.["proId"] !== proUuid
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cette session de paiement n'appartient pas à votre compte.",
        });
      }

      if (
        session.metadata?.["userId"] &&
        session.metadata?.["userId"] !== userUuid
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Cette session de paiement n'est pas liée à l'utilisateur connecté.",
        });
      }

      const subscription =
        session.subscription &&
        typeof session.subscription === "object" &&
        "status" in session.subscription
          ? (session.subscription as Stripe.Subscription)
          : null;

      const lineItem = session.line_items?.data?.[0];
      const priceIdFromLineItem = (() => {
        if (!lineItem?.price) {
          return null;
        }
        if (typeof lineItem.price === "string") {
          return lineItem.price;
        }
        return lineItem.price.id;
      })();

      const priceIdFromSubscription = (() => {
        if (!subscription?.items?.data?.length) {
          return null;
        }
        const price = subscription.items.data[0]?.price;
        if (!price) {
          return null;
        }
        if (typeof price === "string") {
          return price;
        }
        return price.id;
      })();

      const priceId = priceIdFromLineItem ?? priceIdFromSubscription ?? null;

      const plan = getProPlanByPriceId(priceId);

      const subscriptionStatus = subscription?.status ?? null;
      const isSubscriptionActive =
        subscriptionStatus && isStripeStatusActiveOrPastDue(subscriptionStatus);

      const isPaymentComplete =
        isSubscriptionActive ||
        (session.status === "complete" &&
          (session.payment_status === "paid" ||
            session.payment_status === "no_payment_required"));

      const status: "success" | "pending" | "requires_payment" =
        isPaymentComplete
          ? "success"
          : session.status === "open"
            ? "pending"
            : "requires_payment";

      return {
        status,
        sessionId: session.id,
        checkoutStatus: session.status,
        paymentStatus: session.payment_status,
        subscriptionStatus,
        plan: plan ?? null,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        customerEmail:
          session.customer_details?.email ?? session.customer_email ?? null,
        createdAt: session.created
          ? new Date(session.created * 1000).toISOString()
          : null,
      } as const;
    } catch (err) {
      if (
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        err.type === "StripeInvalidRequestError"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "La session Stripe est introuvable ou invalide.",
        });
      }

      if (err instanceof TRPCError) {
        throw err;
      }

      console.error(
        "[Stripe] Failed to retrieve checkout session:",
        err instanceof Error ? err.message : err,
      );

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Impossible de récupérer la session de paiement. Merci de réessayer.",
        cause: err,
      });
    }
  },

  async getCurrentSubscription({ proUuid }: { proUuid: ProUuid }) {
    if (!stripe) {
      return null;
    }

    try {
      const pro = await ProRepository.get(proUuid);
      if (!pro?.stripeSubscriptionId) {
        return null;
      }

      const subscription = await stripe.subscriptions.retrieve(
        pro.stripeSubscriptionId,
      );
      const currentPeriodEndUnix = subscription.items.data.reduce(
        (max, item) => Math.max(max, item.current_period_end ?? 0),
        0,
      );

      return {
        id: subscription.id,
        status: subscription.status ?? null,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        currentPeriodEnd: currentPeriodEndUnix
          ? new Date(currentPeriodEndUnix * 1000).toISOString()
          : null,
      } as const;
    } catch (err) {
      if (
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        err.type === "StripeInvalidRequestError"
      ) {
        return null;
      }

      logError(err, "[Stripe.getCurrentSubscription]");
      return null;
    }
  },

  async listInvoices({
    proUuid,
    limit = 50,
  }: {
    proUuid: ProUuid;
    limit?: number;
  }) {
    try {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Stripe n'est pas configuré côté serveur. Merci de contacter l'administrateur.",
        });
      }

      const pro = await ProRepository.get(proUuid);
      if (!pro) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Compte introuvable.",
        });
      }

      if (!pro.stripeCustomerId) {
        return [];
      }

      const maxLimit = Math.min(limit, 50);
      const invoices = await stripe.invoices
        .list({
          customer: pro.stripeCustomerId,
          limit: maxLimit,
        })
        .autoPagingToArray({ limit: maxLimit });

      return invoices.map(mapInvoice);
    } catch (err) {
      logError(err, "[Stripe.listInvoices]");
      return [];
    }
  },

  async listProductsForAdmin(): Promise<Array<AdminStripeProduct>> {
    try {
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Stripe n'est pas configuré côté serveur. Merci de contacter l'administrateur.",
        });
      }

      const [products, prices] = await Promise.all([
        stripe.products.list({ limit: 100 }).autoPagingToArray({ limit: 1000 }),
        stripe.prices.list({ limit: 100 }).autoPagingToArray({ limit: 1000 }),
      ]);

      let subscriptions: Array<Stripe.Subscription> = [];
      try {
        subscriptions = await stripe.subscriptions
          .list({
            status: "all",
            limit: 100,
            expand: ["data.customer"],
          })
          .autoPagingToArray({ limit: 1000 });
      } catch (subscriptionError) {
        // Listing Stripe clients/subscriptions is a best-effort enrichment.
        // Keep products/prices available even if this endpoint is restricted.
        logError(
          subscriptionError,
          "[Stripe.listProductsForAdmin] subscriptions fallback",
        );
      }

      const pricesByProductId = new Map<string, Array<AdminStripePrice>>();
      for (const price of prices) {
        const productId =
          typeof price.product === "string" ? price.product : price.product.id;

        const mappedPrice: AdminStripePrice = {
          priceId: price.id,
          active: Boolean(price.active),
          currency: price.currency ?? null,
          unitAmount: price.unit_amount ?? null,
          type: price.type,
          recurringInterval: price.recurring?.interval ?? null,
          recurringIntervalCount: price.recurring?.interval_count ?? null,
        };

        const currentPrices = pricesByProductId.get(productId) ?? [];
        currentPrices.push(mappedPrice);
        pricesByProductId.set(productId, currentPrices);
      }

      const clientsByProductId = new Map<
        string,
        Map<
          string,
          Omit<AdminStripeProductClient, "priceIds"> & { priceIds: Set<string> }
        >
      >();

      for (const subscription of subscriptions) {
        const customerId = getCustomerId(subscription.customer);
        if (!customerId) {
          continue;
        }

        const customer =
          typeof subscription.customer === "string" ||
          subscription.customer.deleted
            ? null
            : subscription.customer;

        const customerEmail = customer?.email ?? null;
        const customerName = customer?.name ?? null;

        for (const item of subscription.items.data) {
          const product = item.price.product;
          const productId = typeof product === "string" ? product : product.id;

          const productClients =
            clientsByProductId.get(productId) ??
            new Map<
              string,
              Omit<AdminStripeProductClient, "priceIds"> & {
                priceIds: Set<string>;
              }
            >();
          const clientKey = `${subscription.id}:${customerId}`;

          const currentClient = productClients.get(clientKey) ?? {
            customerId,
            customerEmail,
            customerName,
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            priceIds: new Set<string>(),
          };

          currentClient.priceIds.add(item.price.id);
          productClients.set(clientKey, currentClient);
          clientsByProductId.set(productId, productClients);
        }
      }

      return products
        .map((product) => {
          const defaultPriceId = !product.default_price
            ? null
            : typeof product.default_price === "string"
              ? product.default_price
              : product.default_price.id;

          const productPrices = pricesByProductId.get(product.id) ?? [];
          productPrices.sort((a, b) => {
            const left = a.unitAmount ?? Number.MAX_SAFE_INTEGER;
            const right = b.unitAmount ?? Number.MAX_SAFE_INTEGER;
            if (left !== right) {
              return left - right;
            }
            return a.priceId.localeCompare(b.priceId);
          });

          const productClients: Array<AdminStripeProductClient> = Array.from(
            (
              clientsByProductId.get(product.id) ??
              new Map<
                string,
                Omit<AdminStripeProductClient, "priceIds"> & {
                  priceIds: Set<string>;
                }
              >()
            ).values(),
          )
            .map((client) => ({
              customerId: client.customerId,
              customerEmail: client.customerEmail,
              customerName: client.customerName,
              subscriptionId: client.subscriptionId,
              subscriptionStatus: client.subscriptionStatus,
              priceIds: Array.from(client.priceIds).sort(),
            }))
            .sort((a, b) => {
              const left =
                a.customerName ?? a.customerEmail ?? a.customerId ?? "";
              const right =
                b.customerName ?? b.customerEmail ?? b.customerId ?? "";
              return left.localeCompare(right);
            });

          return {
            productId: product.id,
            name: product.name,
            description: product.description ?? null,
            active: Boolean(product.active),
            defaultPriceId,
            prices: productPrices,
            clients: productClients,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logError(err, "[Stripe.listProductsForAdmin]");
      if (err instanceof TRPCError) {
        throw err;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Impossible de récupérer les produits Stripe. Merci de réessayer.",
        cause: err,
      });
    }
  },

  async handleStripeEvent(event: Stripe.Event) {
    if (!stripe) {
      console.warn("[Stripe] Stripe is not configured; cannot handle events.");
      return;
    }

    try {
      switch (event.type) {
        // first activation after checkout; sets plan and initial credits.
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("[Stripe] Checkout session completed:", session.id);

          const customerId = getCustomerId(session.customer);
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : (session.subscription?.id ?? null);

          if (!customerId || !subscriptionId) {
            console.error(
              "[Stripe] Missing customer or subscription in session",
            );
            break;
          }

          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          const planType = session.metadata?.["subscription"] as
            | ProSubscription
            | undefined;
          if (!planType) {
            console.error("[Stripe] Missing subscription metadata");
            break;
          }

          const plan = getProPlan(planType);
          if (!plan?.buyable) {
            console.error("[Stripe] Invalid or non-buyable plan:", planType);
            break;
          }

          const stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const isSubscriptionUsable = isStripeStatusActive(
            stripeSubscription.status,
          );
          const canCancelPrevious = isSubscriptionUsable;

          // Si un ancien abonnement existe et est différent, on le résilie après activation du nouveau
          const previousSubscriptionId = session.metadata?.[
            "previousSubscriptionId"
          ] as string | undefined;
          if (
            previousSubscriptionId &&
            previousSubscriptionId !== subscriptionId
          ) {
            if (canCancelPrevious) {
              try {
                const existingSub = await stripe.subscriptions.retrieve(
                  previousSubscriptionId,
                );
                if (existingSub.status !== "canceled") {
                  await stripe.subscriptions.cancel(previousSubscriptionId);
                }
              } catch (cancelErr) {
                console.error(
                  "[Stripe] Failed to cancel previous subscription:",
                  previousSubscriptionId,
                  cancelErr instanceof Error ? cancelErr.message : cancelErr,
                );
              }
            } else {
              console.log(
                "[Stripe] Skipping previous subscription cancellation; new sub not active/past_due yet.",
                { subscriptionId, status: stripeSubscription.status },
              );
            }
          }

          // Vérification d'idempotence - éviter les doubles traitements mais permettre la mise à jour du plan
          const alreadyProcessed =
            pro.stripeSubscriptionId === subscriptionId &&
            pro.subscription === planType &&
            isStripeStatusActive(pro.stripeSubscriptionStatus);

          if (alreadyProcessed) {
            console.log(
              "[Stripe] Session already processed for Pro (skip update):",
              pro.id,
            );
            break;
          }

          console.log("[Stripe] Activating Pro subscription:", {
            proId: pro.id,
            subscriptionId,
            planType,
            status: stripeSubscription.status,
          });

          const shouldAddCredits = isStripeStatusActive(
            stripeSubscription.status,
          );

          const planPriceId = getPriceId(plan.subscription);
          if (!planPriceId) {
            console.error(
              "[Stripe] Missing price ID for plan:",
              plan.subscription,
            );
          }

          // Mise à jour du Pro avec l'abonnement actif
          await ProRepository.update(pro.uuid, {
            stripeSubscriptionId: subscriptionId,
            stripeSubscriptionStatus: stripeSubscription.status,
            ...(isSubscriptionUsable && {
              stripeCurrentPlanPriceId: planPriceId ?? null,
              subscription: planType,
              status: "Actif" as ProStatus,
              // Ajout des crédits mensuels
              ...(shouldAddCredits && {
                remainingCredits: (pro.remainingCredits || 0) + plan.credits,
              }),
            }),
          });

          console.log("[Stripe] Pro subscription activated:", {
            proId: pro.id,
            subscription: planType,
            credits: shouldAddCredits ? plan.credits : 0,
            status: stripeSubscription.status,
          });

          // TODO: Envoyer email de confirmation
          break;
        }

        // bookkeeping right after Stripe creates customer subscription.
        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription;

          console.log("[Stripe] Subscription created:", {
            id: subscription.id,
            status: subscription.status,
            customerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer?.id,
          });

          const customerId = getCustomerId(subscription.customer);
          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          await ProRepository.update(pro.uuid, {
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
          });
          break;
        }

        // plan/status change (upgrade/downgrade/past_due/unpaid, etc.).
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log("[Stripe] Subscription updated:", {
            id: subscription.id,
            status: subscription.status,
            customerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer?.id,
          });

          const customerId = getCustomerId(subscription.customer);
          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          const newPlan = getPlanFromSubscription(subscription);

          if (!newPlan) {
            console.error(
              "[Stripe] Updated subscription has unknown price ID:",
              getPriceIdFromSubscription(subscription),
            );
            break;
          }

          const isUnpaidStripeStatus = isStripeStatusUnpaid(
            subscription.status,
          );
          const shouldKeepLocalUnpaid =
            isUnpaidStripeStatus && pro.subscription === ProSubscription.UNPAID;

          // Mise à jour du statut (active, past_due, canceled, etc.)
          // Les crédits sont ajoutés dans invoice.payment_succeeded (renouvellement) pour éviter les doublons.
          await ProRepository.update(pro.uuid, {
            stripeSubscriptionStatus: subscription.status,
            stripeCurrentPlanPriceId: getPriceIdFromSubscription(subscription),
            ...(shouldKeepLocalUnpaid
              ? {}
              : { subscription: newPlan.subscription }),
            ...(isStripeStatusActive(subscription.status)
              ? { status: "Actif" as ProStatus }
              : {}),
          });

          console.log("[Stripe] Pro subscription updated:", {
            proId: pro.uuid,
            status: subscription.status,
          });
          break;
        }

        // cancellation at Stripe; we clear local subscription.
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log("[Stripe] Subscription deleted:", {
            id: subscription.id,
            status: subscription.status,
            customerId:
              typeof subscription.customer === "string"
                ? subscription.customer
                : subscription.customer?.id,
          });

          const customerId = getCustomerId(subscription.customer);
          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          // Ignore deletion events for old subscriptions that are not the current one
          if (
            pro.stripeSubscriptionId &&
            pro.stripeSubscriptionId !== subscription.id
          ) {
            console.log(
              "[Stripe] Skip deletion; event is for a previous subscription",
              {
                proId: pro.uuid,
                current: pro.stripeSubscriptionId,
                deleted: subscription.id,
              },
            );
            break;
          }

          // Annulation de l'abonnement
          await ProRepository.update(pro.uuid, {
            stripeSubscriptionStatus: "canceled",
            stripeSubscriptionId: null,
            subscription: null,
            status: "Inactif",
          });

          console.log("[Stripe] Pro subscription canceled:", pro.uuid);
          // TODO: Envoyer email de notification
          break;
        }

        // recurring invoice paid; adds monthly credits and (re)stores plan.
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("[Stripe] Invoice payment succeeded:", {
            id: invoice.id,
            billingReason: invoice.billing_reason,
            customerId:
              typeof invoice.customer === "string"
                ? invoice.customer
                : invoice.customer?.id,
          });

          const customerId = getCustomerId(invoice.customer);
          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          // Renouvellement mensuel - ajout des crédits
          if (invoice.billing_reason === "subscription_cycle") {
            const plan = await resolvePlanFromInvoice(
              invoice,
              pro.subscription,
            );

            if (!plan) {
              console.error(
                "[Stripe] Unable to credit Pro - plan not found from invoice",
                invoice.id,
              );
              break;
            }

            await ProRepository.update(pro.uuid, {
              subscription: plan.subscription,
              remainingCredits: (pro.remainingCredits || 0) + plan.credits,
              stripeSubscriptionStatus: "active",
              status: "Actif" as ProStatus,
            });

            console.log("[Stripe] Monthly credits added:", {
              proId: pro.id,
              credits: plan.credits,
            });
          }
          break;
        }

        // payment failed; marks subscription as past_due for follow-up.
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("[Stripe] Invoice payment failed:", invoice.id);

          const customerId = getCustomerId(invoice.customer);
          const pro = await getProFromCustomerId(customerId, event.type);
          if (!pro) {
            break;
          }

          // Mise à jour du statut en "past_due"
          await ProRepository.update(pro.uuid, {
            stripeSubscriptionStatus: "past_due",
            status: "Inactif",
            subscription: ProSubscription.UNPAID,
          });

          console.warn("[Stripe] Payment failed for Pro:", pro.uuid);
          // TODO: Envoyer email d'alerte paiement échoué
          break;
        }

        default:
          console.log("[Stripe] Unhandled event type:", event.type);
      }
    } catch (error) {
      // Re-propager les erreurs intentionnelles
      if (error instanceof TRPCError) {
        throw error;
      }
      // Logger et dégrader gracieusement uniquement pour les erreurs Stripe externes
      console.error("[Stripe] Error handling event:", event.type, error);
      throw error; // Propager l'erreur pour que Stripe retente
    }
  },
};
