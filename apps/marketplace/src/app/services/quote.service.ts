import { inject, Injectable } from "@angular/core";
import { operationsEmail, QuoteStage, UserType } from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";

import {
  type AttachmentHsId,
  type HubspotPro,
  type HubspotQuote,
  type QuoteUuid,
  type SignatoryContact,
} from "@optee/models";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import {
  firstValueFrom,
  map,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import trpcClient from "../../trpc-client";
import { QuoteRejectDialogComponent } from "../components/quote/quotes-reject.component";
import { SupabaseService } from "../supabase.service";
import { AuthService } from "./auth.service";
import { TrackingService } from "./tracking.service";

@Injectable({ providedIn: "root" })
export class QuoteService {
  private readonly toastService = inject(ToastService);
  private readonly trackingService = inject(TrackingService);
  private readonly dialogService = inject(DialogService);
  private readonly fileService = inject(FileService);
  private readonly authService = inject(AuthService);

  private readonly refreshAll$ = new Subject<void>();

  refresh() {
    this.refreshAll$.next();
  }

  all$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => SupabaseService.isAuthenticated$),
    switchMap((isAuthenticated) =>
      isAuthenticated ? this.authService.loggedAs$ : of(null),
    ),
    switchMap((loggedAs) => this.getAllByLoggedUser(loggedAs)),
    map((quotes) => quotes.filter(isNotNullish)),
    shareReplay(1),
  );

  async getAllByLoggedUser(loggedAs: UserType | null) {
    try {
      if (!loggedAs) {
        return [];
      }

      const rows = await (loggedAs === UserType.PRO
        ? this.getAllForPro()
        : this.getAllForClient());

      return rows ?? [];
    } catch (err) {
      this.toastService.openError("Récupération des devis", err);
      return [];
    }
  }

  async getAllForPro() {
    try {
      const rows = await trpcClient.quotes.getAllForProByLoggedUser.query();

      return rows ?? [];
    } catch (err) {
      this.toastService.openError("Récupération des devis", err);
      return [];
    }
  }

  async getAllForClient(filter?: string | null) {
    try {
      const groupedQuotesByOperation =
        await trpcClient.quotes.getAllForClientByLoggedUser.query({
          filter: filter ?? undefined,
        });

      // Make the list of unique operationUuids
      const operationUuids = Array.from(
        new Set(groupedQuotesByOperation.map((row) => row.hsOperation.uuid)),
      );

      const operationsWithQuotesWithPro: Map<
        string, // operationUuid
        (typeof groupedQuotesByOperation)[number]["hsOperation"] & {
          hsQuotes: Array<
            HubspotQuote & {
              hsPro: HubspotPro;
              fileId: string | null;
            }
          >;
          signatoryContact: SignatoryContact | null;
        }
      > = new Map();

      for (const operationUuid of operationUuids) {
        const hsOperationRow = groupedQuotesByOperation.find(
          (row) => row.hsOperation.uuid === operationUuid,
        );

        if (!hsOperationRow) {
          continue;
        }

        operationsWithQuotesWithPro.set(operationUuid, {
          ...hsOperationRow.hsOperation,
          hsQuotes: groupedQuotesByOperation
            .filter((row) => row.hsOperation.uuid === operationUuid)
            .sort((a, b) => this.getQuoteWeight(a) - this.getQuoteWeight(b))
            .map((row) => {
              return {
                ...row.hsQuote,
                hsPro: row.hsPro,
                fileId: row.fileId,
              };
            }),
          signatoryContact: hsOperationRow.signatoryContact,
        });
      }

      return Array.from(operationsWithQuotesWithPro.values());
    } catch (err) {
      this.toastService.openError("Récupération des devis", err);
      return [];
    }
  }

  async getOne(uuid: QuoteUuid) {
    try {
      const res = await trpcClient.quotes.get.query({ uuid });

      if (!res) {
        throw new Error(
          `Le devis avec l'identifiant [${uuid}] est introuvable`,
        );
      }

      return {
        ...res.row.hsOperation,
        hsQuote: res.row.hsQuote,
        hsPro: res.row.hsPro,
        url: res.url,
        signatoryUuid: res.row.signatoryUuid,
        fileId: res.row.fileId,
        status: res.status,
      };
    } catch (err) {
      this.toastService.openError("Récupération d'un devis", err);
      return null;
    }
  }

  async rejectQuote(uuid: QuoteUuid) {
    const { res: reason } = await this.dialogService.open(
      QuoteRejectDialogComponent,
      {
        disableClose: true,
      },
    );

    if (!reason) {
      return null;
    }

    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          title: "Nous avons pris en compte votre demande",
          description:
            "Nos équipes continuent de chercher une solution plus adaptée à votre besoin et à vos contraintes n’hésitez pas néanmoins à contacter notre partenaire pour discuter des conditions si vous souhaitez recevoir une nouvelle proposition commerciale de sa part.",
          action: "Compris",
          actionColor: "primary",
        },
        disableClose: true,
      },
    );

    if (!confirmed) {
      return null;
    }

    try {
      await trpcClient.quotes.reject.mutate({ uuid, reason });
    } catch (err) {
      this.toastService.openError("Refus d'un devis", err);
      return null;
    }

    this.trackingService.trackClient("quote_reject");

    this.toastService.open(
      "success",
      "Devis refusé",
      "Vous pouvez néanmoins contacter notre partenaire pour recevoir une nouvelle proposition commerciale de sa part.",
    );

    return reason;
  }

  async downloadPdf(
    quote?: {
      uuid: QuoteUuid;
      fileId?: AttachmentHsId | null;
      name?: string | null;
    } | null,
  ) {
    try {
      if (!quote) {
        throw new Error("Devis introuvable.");
      }

      if (!quote?.fileId) {
        throw new Error("Aucun fichier associé à ce devis.");
      }

      const loggedAs = await firstValueFrom(this.authService.loggedAs$);

      if (!loggedAs) {
        throw new Error("Vous devez être connecté pour télécharger un devis.");
      }

      const url = await trpcClient.quotes.getFileUrl.query({
        quoteUuid: quote.uuid,
        hsId: quote.fileId,
        loggedAs,
      });
      if (!url) {
        throw new Error("Le lien de téléchargement n'est pas disponible.");
      }

      await this.fileService.downloadFileFromUrl(
        url,
        quote?.name ?? "devis" + ".pdf",
      );
    } catch (e) {
      this.toastService.openError("Téléchargement d'un devis", e);
    }
  }

  formatEmailHrefToContactPro({
    email,
    operationName,
  }: {
    email: string | null | undefined;
    operationName: string | null | undefined;
  }) {
    if (!email) {
      return null;
    }
    const subject = encodeURIComponent(
      `Demande d'information sur votre devis ${operationName ?? ""}`,
    );
    const cc = encodeURIComponent(operationsEmail);
    return `mailto:${email}?subject=${subject}&cc=${cc}`;
  }

  getQuoteWeight(quote: { hsQuote: { stage: QuoteStage | null } }) {
    return quote.hsQuote.stage === QuoteStage.DEVIS_SIGNE
      ? 0
      : quote.hsQuote.stage === QuoteStage.FERME_PERDU
        ? 2
        : 1;
  }
}
