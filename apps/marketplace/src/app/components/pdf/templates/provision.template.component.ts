import { CurrencyPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { buildAssetUrl, CEELAB_ADDRESS } from "@optee/constants";
import type { OperationUuid } from "@optee/models";
import { z } from "zod";
import { accountSchema, locationSchema } from "../common-schemas";

export const ProvisionSchema = z.object({
  account: accountSchema,
  location: locationSchema,
  pdfId: z.string(),
  sendingDate: z.coerce.date(),
  expirationDate: z.coerce.date(),
  amount: z.number(),
});
export const isProvisionData = (
  data: unknown,
): data is z.infer<typeof ProvisionSchema> =>
  !!data && ProvisionSchema.safeParse(data).success;

export type ProvisionInput = {
  uuid: OperationUuid;
  pdfId: string;
  sendingDate: Date;
  expirationDate: Date;
};

@Component({
  selector: "mkp-provision-template",
  template: `
    <div class="pdf-page text-sm">
      <img class="w-72" alt="logo d'Optee" [src]="logoLight" />
      <header class="my-4 flex items-start justify-between">
        <div>
          <p class="text-primary-400">Émetteur</p>
          <p class="w-48">{{ ceelabAddress }}</p>
        </div>
        <div class="flex max-w-48 flex-col gap-4 text-end">
          <div>
            <p class="text-primary-400">Destinataire</p>
            <p>{{ data().account.name }}</p>
            <p>{{ data().account.billingAddress }}</p>
            <p>{{ data().account.billingZipCode }}</p>
            <p>{{ data().account.billingCity }}</p>
          </div>
          <div>
            <p class="text-primary-400">Adresse du site</p>
            <p>{{ data().location.streetNumber }}</p>
            <p>{{ data().location.streetName }}</p>
            <p>{{ data().location.zipcode }}</p>
            <p>{{ data().location.city }}</p>
          </div>
        </div>
      </header>
      <h1 class="my-4 max-w-prose text-center text-xl font-semibold underline">
        {{
          "Appel de provisions " +
            (type() === "sdc" ? "solde de tout compte" : "acompte") +
            " n° ".toLocaleUpperCase() +
            data().pdfId
        }}
      </h1>
      <div class="my-6 flex w-full justify-between">
        <div>
          <p class="text-primary-400">Date émission</p>
          <p>{{ data().sendingDate | date }}</p>
        </div>
        <div>
          <p class="text-primary-400">Date échéance</p>
          <p>{{ data().expirationDate | date }}</p>
        </div>
      </div>
      <p class="my-3 font-bold">
        Le règlement doit se faire sur le RIB d’OPTEE que vous trouverez
        ci-dessous et non auprès de l’entreprise partenaire.
      </p>
      <p class="my-3 italic">
        Merci de renseigner dans votre ordre de virement le n°{{ data().pdfId }}
      </p>
      <p class="my-3">
        <span class="font-bold underline">Total à régler</span>
        : {{ data().amount | currency: "EUR" : "symbol" : "1.2-2" }}
      </p>
      <div class="mt-12 flex w-full justify-between gap-6">
        <div class="h-fit min-w-fit border border-black p-2">
          <p>
            Titulaire du comte:
            <strong>LEMONWAY SAS</strong>
          </p>
          <p>
            Libellé du comte:
            <strong>OPERATIONS / CEELAB</strong>
          </p>
          <p>
            IBAN:
            <strong>FR7630004021180001023673692</strong>
          </p>
          <p>
            BIC:
            <strong>BNPAFRPPXXX</strong>
          </p>
          <p>
            DEVISE:
            <strong>EUR</strong>
          </p>
        </div>
        <div class="px-4">
          <p class="font-bold">Conditions de paiement:</p>
          <ul class="flex flex-col gap-2">
            <li>A régler sous 30 jours à compter de la réception.</li>
            <li>
              Pénalité de retard : 3 fois le taux annuel d’intérêt légal en
              vigueur calculé depuis la date d’échéance jusqu’à complet paiement
              du prix
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  imports: [DatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProvisionTemplateComponent {
  readonly data = input.required<z.infer<typeof ProvisionSchema>>();
  readonly type = input.required<"sdc" | "deposit">();

  protected readonly ceelabAddress = CEELAB_ADDRESS;

  logoLight = buildAssetUrl(
    "logo-light-theme.svg",
    "https://app.optee.io/assets/",
  );
}
