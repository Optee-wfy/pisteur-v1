import { ProSubscription } from "@optee/constants";
import { ProAdminProvider } from "@optee/pro-server";
import { StripeProvider } from "@optee/stripe-server";
import z from "zod";
import { adminProcedure, proProcedure, router } from "../trpc";

export const stripeRouter = router({
  createCheckoutSession: proProcedure()
    .input(z.object({ subscription: z.nativeEnum(ProSubscription) }))
    .mutation(({ input, ctx }) =>
      StripeProvider.createCheckoutSession({
        subscription: input.subscription,
        proUuid: ctx.pro.id,
        user: { id: ctx.user.id, email: ctx.user.email },
      }),
    ),

  getCheckoutSession: proProcedure()
    .input(z.object({ sessionId: z.string().min(1) }))
    .query(({ input, ctx }) =>
      StripeProvider.getCheckoutSession({
        sessionId: input.sessionId,
        proUuid: ctx.pro.id,
        userUuid: ctx.user.id,
      }),
    ),

  getCurrentSubscription: proProcedure().query(({ ctx }) =>
    StripeProvider.getCurrentSubscription({
      proUuid: ctx.pro.id,
    }),
  ),

  listInvoices: proProcedure()
    .input(
      z
        .object({ limit: z.number().int().positive().max(50).optional() })
        .optional(),
    )
    .query(({ input, ctx }) =>
      StripeProvider.listInvoices({
        proUuid: ctx.pro.id,
        limit: input?.limit,
      }),
    ),

  getProductsForAdmin: adminProcedure.query(() =>
    Promise.all([
      StripeProvider.listProductsForAdmin(),
      ProAdminProvider.getByStripeCurrentPlanPriceForAdmin(),
    ]).then(([products, pros]) => {
      const prosByPriceId = new Map<string, Array<(typeof pros)[number]>>();
      for (const pro of pros) {
        const currentPros =
          prosByPriceId.get(pro.stripeCurrentPlanPriceId) ?? [];
        currentPros.push(pro);
        prosByPriceId.set(pro.stripeCurrentPlanPriceId, currentPros);
      }

      return products.map((product) => {
        const attachedProsByUuid = new Map<string, (typeof pros)[number]>();
        for (const price of product.prices) {
          const pricePros = prosByPriceId.get(price.priceId) ?? [];
          for (const pro of pricePros) {
            attachedProsByUuid.set(pro.uuid, pro);
          }
        }

        return {
          productId: product.productId,
          productName: product.name,
          description: product.description,
          active: product.active,
          defaultPriceId: product.defaultPriceId,
          prices: product.prices,
          clients: product.clients,
          pros: Array.from(attachedProsByUuid.values()),
        };
      });
    }),
  ),
});
