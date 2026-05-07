import { Injectable } from "@angular/core";
import type { ProSubscription } from "@optee/constants";
import trpcClient from "../../../../trpc-client";

@Injectable({ providedIn: "root" })
export class StripeCheckoutService {
  async redirectToCheckout(subscription: ProSubscription): Promise<void> {
    const session = await trpcClient.stripe.createCheckoutSession.mutate({
      subscription,
    });

    if (!session?.url) {
      throw new Error("Impossible de créer une session Stripe.");
    }

    // Force navigation in the same tab
    window.location.assign(session.url);
  }
}
