import { CurrencyPipe, DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { z } from "zod";

import { buildAssetUrl } from "@optee/constants";
import { accountSchema } from "../common-schemas";

/**
 * Required information for the neutral contribution template
 */
export const NeutralContributionSchema = z.object({
  pro: z.object({ name: z.string() }),
  quote: z.object({ fundingAmount: z.number() }),
  account: accountSchema,
  prestationId: z.string(),
  ceeFile: z.string(),
  signatoryFirstName: z.string(),
  signatoryLastName: z.string(),
});

export const isNeutralContributionData = (
  data: unknown,
): data is z.infer<typeof NeutralContributionSchema> =>
  !!data && NeutralContributionSchema.safeParse(data).success;

@Component({
  selector: "mkp-neutral-contribution-template",
  host: {
    class: "shadow-o text-xs overflow-auto",
  },
  template: `
    <div class="pdf-page">
      <div class="w-full rounded-xl border-4 border-green-600 p-12 pb-36">
        <img
          class="w-36"
          alt="Certificat d'économie d'énergie"
          [src]="ceeLogo"
        />
        <h1 class="pb-12 pl-12 pt-4 text-center text-xl font-medium">
          Cadre de contribution
        </h1>
        <p class="mb-3 text-justify">
          Le dispositif national des certificats d’économies d’énergie (CEE) mis
          en place par le Ministère en charge de l’énergie impose à l’ensemble
          des fournisseurs d’énergie (électricité, gaz, fioul domestique,
          chaleur ou froid, carburants automobiles), de réaliser des économies
          et de promouvoir les comportements vertueux auprès des consommateurs
          d’énergie.
        </p>
        <p class="mb-3">
          Dans le cadre son partenariat, la société
          <span class="font-medium">{{ data().pro.name }}</span>
          <br />
          s'engage à vous apporter:
        </p>
        <ul class="list-disc pl-6">
          <li style="list-style-type: 'x    ';">
            une prime d'un montant de
            <span class="font-medium">
              {{
                data().quote.fundingAmount
                  | currency: "EUR" : "symbol" : "1.0-0"
              }}
            </span>
            ;
          </li>
          <li>
            un bon d’achat pour des produits de consommation courante d’un
            montant de __ euros ;
          </li>
          <li>
            un prêt bonifié d’un montant de __ euros proposé par __ au taux
            effectif global (TEG) de __ % (valeur de la bonification = __) ;
          </li>
          <li>
            un audit ou conseil personnalisé, sous forme écrite (valeur u __ ) ;
          </li>
          <li>
            un produit ou service offert :............... d’une valeur de. €
          </li>
        </ul>

        <table
          class="mx-auto mt-3 w-full border border-black text-center text-xs"
        >
          <caption class="py-2 text-left">
            dans le cadre des travaux suivants (1 ligne par opération)
          </caption>
          <thead>
            <tr>
              <td class="w-36 border border-black">Nature des travaux</td>
              <td class="w-28 border border-black">Fiche CEE</td>
              <td class="w-36 border border-black">Conditions à respecter</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-black">{{ data().prestationId }}</td>
              <td class="border border-black">{{ data().ceeFile }}</td>
              <td class="border border-black">
                <a
                  class="text-blue-500"
                  rel="noopener"
                  target="_blank"
                  [href]="ceeLink"
                >
                  {{ ceeLink }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-3 flex gap-1">
          <p class="font-bold">au bénéfice de :</p>
          <p>
            <span>{{ data().account.name }}</span>
            -
            <span>
              {{ data().signatoryFirstName }} {{ data().signatoryLastName }}
            </span>
            <br />
            <span>
              {{
                [
                  data().account.billingAddress,
                  data().account.billingZipCode,
                  data().account.billingCity,
                ].join(" ")
              }}
            </span>
          </p>
        </div>
        <p class="mt-3">
          <span class="pr-1 font-bold">Date de cette proposition</span>
          <span>{{ today | date }}</span>
        </p>
        <p class="mt-3 font-bold">Signature du partenaire (et tampon)</p>
      </div>
      <div class="px-6 text-justify">
        <p class="mt-3">
          ⚠ Faites réaliser plusieurs devis afin de prendre une décision
          éclairée. Attention, seules les propositions remises avant
          l’acceptation du devis ou du bon de commande sont valables, et vous ne
          pouvez pas cumuler plusieurs offres CEE différentes pour la même
          opération.
        </p>
        <p class="mt-3">
          ⚠ Seul le professionnel est responsable de la conformité des travaux
          que vous lui confiez. Vérifiez ses qualifications techniques et
          l'éligibilité des produits proposés avant d'engager vos travaux. Un
          contrôle des travaux effectués dans votre logement pourra être réalisé
          sur demande de GreenYellow ou des autorités publiques.
        </p>
      </div>
    </div>

    <div class="pdf-page">
      <div
        class="flex flex-col items-center justify-center gap-2 border border-black bg-blue-300 p-6"
      >
        <p class="underline">
          Où se renseigner pour bénéficier de cette offre ?
        </p>
        <p class="underline">
          Où s'informer sur les aides pour les travaux d'économies d'énergie ?
        </p>
        <p>
          Site du réseau FAIRE:
          <a href="http://faire.gouv.fr">http://faire.gouv.fr</a>
        </p>
        <p>
          Numéro de téléphone:
          <span class="bg-white p-1 text-gray-600">0 808 800 700</span>
        </p>
        <p class="text-center font-medium underline">
          En cas de litige avec le porteur de l'offre ou son partenaire, vous
          pouvez faire appel gratuitement au médiateur de la consommation (6° de
          l'article L.611-1 du code de la consommation):
        </p>
        <div class="flex flex-col items-center gap-1">
          <p class="font-bold">SAS Médiation Solution</p>
          <p>222 Chemin de la bergerie</p>
          <p>O1800 Saint Jean de Niost</p>
          <p>Tel: 04 82 53 93 06</p>
          <p>
            Site:
            <a
              class="text-primary-700 border-primary-700 border-b"
              href="http://www.sasmediationsolution-conso.fr"
            >
              www.sasmediationsolution-conso.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  imports: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeutralContributionTemplateComponent {
  readonly data = input.required<z.infer<typeof NeutralContributionSchema>>();

  protected readonly ceeLink =
    "https://www.ecologie.gouv.fr/politiques-publiques/operations-standardisees-deconomies-denergie";

  protected readonly today = new Date();

  ceeLogo = buildAssetUrl(
    "pdf-assets/cee-logo.png",
    "https://app.optee.io/assets",
  );
}
