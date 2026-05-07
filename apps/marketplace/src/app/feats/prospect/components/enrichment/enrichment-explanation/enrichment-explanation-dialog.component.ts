import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { EnrichmentProvidersComponent } from "../enrichment-providers/enrichment-providers.component";

@Component({
  selector: "mkp-enrichment-explanation-dialog",
  template: `
    <op-dialog-wrapper class="!max-w-xl gap-4" (crossClick)="dialogRef.close()">
      <div class="flex flex-col items-start justify-start gap-6">
        <div class="flex flex-col gap-2">
          <h3 class="w-full text-xl font-semibold leading-7">
            Explication de l'enrichissement de contacts
          </h3>
          <p class="max-w-prose text-gray-600">
            Lorsqu'un enrichissement est lancé, nous envoyons les contacts
            sélectionnés à nos fournisseurs de données tiers pour obtenir des
            informations supplémentaires.
          </p>

          <oui-message
            class="max-w-prose"
            severity="warn"
            summary="Temps de chargement"
          >
            L'enrichissement peut prendre plusieurs minutes en fonction du
            nombre de contacts et de la rapidité des fournisseurs. Vous pouvez
            cependant cumuler d'autres enrichissements en même temps.
          </oui-message>
        </div>

        <mkp-enrichment-providers />

        <p class="max-w-prose italic text-gray-600">
          Une fois l'enrichissement terminé, vous pouvez consulter les résultats
          sur votre CRM. Les contacts enrichis seront disponibles sur la page
          d'activation avec les nouvelles informations enrichies.
        </p>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    EnrichmentProvidersComponent,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrichmentExplanationDialogComponent extends StronglyTypedDialog<
  void,
  void
> {}
