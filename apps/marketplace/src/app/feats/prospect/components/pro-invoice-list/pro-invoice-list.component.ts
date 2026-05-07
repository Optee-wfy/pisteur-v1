import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { IconDownloadComponent } from "@optee/icons";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import trpcClient, { isTRPCClientError } from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";

type Invoice = {
  id: string;
  number: string | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  status: string | null;
  total: number | null;
  currency: string | null;
  createdAt: string | null;
};

@Component({
  selector: "mkp-pro-invoice-list",
  host: { class: "flex flex-col items-start gap-6" },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Factures</h1>
      <p class="text-sm text-gray-600">
        Retrouvez ci-dessous l'ensemble des factures liées à votre abonnement.
      </p>
    </header>

    @if (error(); as err) {
      <oui-message severity="error" [summary]="err" />
    }

    @if (invoices().length) {
      <div class="w-full overflow-x-auto rounded-lg border border-gray-100">
        <table class="min-w-full text-sm">
          <thead
            class="bg-gray-50 text-left text-xs font-semibold text-gray-500"
          >
            <tr class="[&_th]:px-3 [&_th]:py-2">
              <th scope="col">Facture</th>
              <th scope="col">Date</th>
              <th scope="col">Montant</th>
              <th scope="col">Statut</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (invoice of sortedInvoices(); track invoice.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-3 py-2 font-medium">
                  {{ invoice.number ?? invoice.id }}
                </td>
                <td class="px-3 py-2">
                  {{ formatDate(invoice.createdAt) }}
                </td>
                <td class="px-3 py-2 font-medium">
                  {{ formatAmount(invoice.total, invoice.currency) }}
                </td>
                <td class="px-3 py-2">
                  <span
                    class="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold capitalize text-gray-700"
                  >
                    {{ invoice.status ?? "inconnu" }}
                  </span>
                </td>
                <td class="px-3 py-2">
                  @if (invoice.invoicePdf || invoice.hostedInvoiceUrl) {
                    <a
                      class="pister-link w-fit"
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label="Télécharger la facture"
                      [href]="
                        invoice.invoicePdf ??
                        invoice.hostedInvoiceUrl ??
                        undefined
                      "
                    >
                      <icon-download class="mx-auto size-4" />
                    </a>
                  } @else {
                    <span class="text-gray-400">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else if (!invoicesResource.isLoading()) {
      <p
        class="w-full rounded-lg border border-current p-4 text-sm text-gray-600"
      >
        Aucune facture disponible pour le moment. Abonnez-vous pour commencer à
        recevoir des factures.
      </p>
    } @else {
      <oui-loader label="Chargement des factures..." />
    }
  `,
  imports: [MessageComponent, IconDownloadComponent, LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProInvoiceListComponent {
  private readonly proService = inject(ProService);

  private readonly pro = toSignal(this.proService.pro$, {
    initialValue: null,
  });

  protected readonly invoicesResource = resource({
    loader: async () => {
      try {
        const res = await trpcClient.stripe.listInvoices.query({ limit: 50 });
        return res ?? [];
      } catch (error) {
        console.error("Error fetching invoices:", error);
        if (
          isTRPCClientError(error) &&
          error.message.startsWith("No such customer:")
        ) {
          return [];
        }
        throw new Error(
          "Impossible de récupérer les factures. Merci de réessayer plus tard. Si le problème persiste, contactez le support.",
        );
      }
    },
  });

  protected readonly invoices = computed<Invoice[]>(
    () => this.invoicesResource.value() ?? [],
  );

  protected readonly sortedInvoices = computed(() =>
    [...this.invoices()].sort((a, b) => {
      const aDateRaw = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bDateRaw = b.createdAt ? Date.parse(b.createdAt) : 0;
      const aDate = Number.isFinite(aDateRaw) ? aDateRaw : 0;
      const bDate = Number.isFinite(bDateRaw) ? bDateRaw : 0;
      return bDate - aDate;
    }),
  );

  protected readonly stripeStatus = computed(
    () =>
      this.proService.subscription() ??
      this.pro()?.stripeSubscriptionStatus ??
      null,
  );

  protected readonly error = computed(() => {
    const err = this.invoicesResource.error();
    if (!err) {
      return null;
    }
    console.error("Error in invoices resource:", err);
    return isTRPCClientError(err)
      ? err.message
      : err instanceof Error
        ? err.message
        : "Une erreur inconnue est survenue.";
  });

  protected formatAmount(amount: number | null, currency: string | null) {
    if (amount == null) {
      return "—";
    }
    const code = (currency ?? "eur").toUpperCase();
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: code,
    }).format(amount / 100);
  }

  protected formatDate(value: string | null) {
    if (!value) {
      return "—";
    }

    const ts = Date.parse(value);
    if (!Number.isFinite(ts)) {
      return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  }
}
