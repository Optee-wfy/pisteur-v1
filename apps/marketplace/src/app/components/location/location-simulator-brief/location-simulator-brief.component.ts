import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  resource,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { IconChevronRightComponent, IconDownloadComponent } from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { InfoComponent } from "@optee/ui/components/molecules/info/info.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { PrintDirective } from "@optee/ui/directives/print.directive";
import { Skeleton } from "primeng/skeleton";
import { TextareaModule } from "primeng/textarea";
import trpcClient from "../../../../trpc-client";
import { OperationAnalysisScoreComponent } from "../../operation/operation-analysis-score/operation-analysis-score.component";
import { OperationCeeFileComponent } from "../../operation/operation-cee-file/operation-cee-file.component";
import { OperationImpactEstimationComponent } from "../../operation/operation-impact-estimation/operation-impact-estimation.component";
import { LocationRecapComponent } from "../location-recap/location-recap.component";

@Component({
  selector: "mkp-location-simulator-brief",
  host: {
    class: "flex flex-col gap-8 p-6 lg:flex-row justify-center",
    id: "print-content",
  },
  template: `
    @if (operation(); as operationV) {
      <section
        class="flex max-w-4xl flex-col gap-6 pb-3 2xl:gap-10 print:mx-8 print:mt-3"
        [style.flex]="4"
      >
        <!-- Brief heading -->
        <oui-bob heading="Brief technique">
          <div class="flex print:hidden" preTitle>
            <a
              class="text-primary-700 flex cursor-pointer items-center justify-center gap-4"
              (click)="backClick.emit()"
            >
              <oui-button-icon class="size-8">
                <icon-chevron-right class="size-4 rotate-180 text-gray-600" />
              </oui-button-icon>
              <span class="font-display underline">
                Relancer une nouvelle simulation
              </span>
            </a>
          </div>
          <div class="flex flex-col gap-6">
            <mkp-location-recap [location]="operationV.location" />

            <oui-info heading="Opération identifiée" variant="highlighted">
              <oui-info [heading]="operationV.typeInfo.label">
                {{
                  operationV.typeInfo.description?.definition ??
                    "Aucune information trouvée pour cette opération."
                }}
              </oui-info>
            </oui-info>

            <mkp-operation-cee-file [operation]="operationV" />

            @if (operationV.additionalInfo) {
              <oui-info heading="Infos supplémentaires" variant="highlighted">
                {{ operationV.additionalInfo }}
              </oui-info>
            }
          </div>

          <!-- Download PDF -->
          <div class="print:hidden" aside>
            <a
              class="text-primary-700 flex cursor-pointer items-center justify-center gap-2 underline"
              ouiPrint
              printSectionId="print-content"
              variant="primary"
              [printTitle]="'Brief technique ' + operationV.name"
            >
              <icon-download class="size-4" colorMode="colored" />
              Télécharger le PDF
            </a>
          </div>
        </oui-bob>

        <!-- Bot: Impact estimation -->
        <mkp-operation-impact-estimation [operation]="operationV" />

        @if (botBrief.value(); as operationBrief) {
          <!-- Bot : CEE conformity -->
          @if ((operationV.funding.value ?? 0) > 0) {
            <oui-bob
              class="print:pt-16"
              dropDown
              heading="Conformité CEE et obligations techniques"
              [isOpen]="true"
            >
              <div class="flex flex-col gap-4">
                <oui-info
                  heading="Critères d’éligibilité aux aides CEE :"
                  variant="highlighted"
                >
                  @for (
                    eligibility of operationBrief.eligibilityCriteriaCEE ?? [];
                    track $index
                  ) {
                    <p>{{ eligibility }}</p>
                  } @empty {
                    <p>Aucune fiche disponible.</p>
                  }
                </oui-info>

                <oui-info
                  heading="Qualifications nécessaires :"
                  variant="highlighted"
                >
                  @for (
                    qualification of operationBrief.qualificationsNeeded ?? [];
                    track $index
                  ) {
                    <p>{{ qualification }}</p>
                  } @empty {
                    <p>Non renseigné.</p>
                  }
                </oui-info>

                <oui-info
                  heading="Contrôles et vérifications :"
                  variant="highlighted"
                >
                  @for (
                    operation of operationBrief.checksOperations ?? [];
                    track $index
                  ) {
                    <p>{{ operation }}</p>
                  } @empty {
                    <p>Non renseigné.</p>
                  }
                </oui-info>
              </div>
            </oui-bob>
          }

          <!-- Bot: Criteria & constraints -->
          <oui-bob
            class="print:pt-16"
            dropDown
            heading="Critères et contraintes techniques"
            [isOpen]="true"
          >
            <div class="flex flex-col gap-4">
              <oui-info
                heading="Objectifs du maître d'ouvrage"
                variant="highlighted"
              >
                {{ operationBrief.goalMOA || "Non renseigné." }}
              </oui-info>

              <oui-info
                heading="Justification des choix des opérations"
                variant="highlighted"
              >
                {{
                  operationBrief.justificationChoiceOperations ||
                    "Non renseigné."
                }}
              </oui-info>

              <oui-info heading="Type de site" variant="highlighted">
                {{ operationBrief.buildingType || "Non connu." }}
              </oui-info>

              <oui-info heading="Critères du site" variant="highlighted">
                {{ operationBrief.buildingCriterias || "Aucun critère connu." }}
              </oui-info>
              <oui-info heading="Contraintes techniques" variant="highlighted">
                {{
                  operationBrief.technicalConstraint ||
                    "Aucune contrainte connue."
                }}
              </oui-info>
            </div>
          </oui-bob>
        } @else if (botBrief.isLoading()) {
          <oui-bob>
            <ng-container *ngTemplateOutlet="loadingBrief" />
          </oui-bob>
        } @else if (botBrief.error()) {
          <oui-message
            class="mx-auto max-w-lg"
            severity="error"
            summary="Erreur de génération du brief"
          >
            Une erreur est survenue lors de la génération du brief technique.
            Veuillez réessayer plus tard ou contacter le support si le problème
            persiste.
          </oui-message>
        }
      </section>

      <!-- Sidebar : buttons + analysis/score -->
      <section
        class="top-0 -mt-2 flex h-fit flex-1 flex-col gap-4 pt-2 empty:hidden lg:sticky lg:max-w-screen-sm print:mx-8"
      >
        @if (
          operationV.supportsAnalysis() && operationV.estimatedEnergyImpact
        ) {
          <mkp-operation-analysis-score [operation]="operationV" />
        }
      </section>
    } @else {
      <!-- Error message -->
      <div class="mx-auto flex flex-col items-center gap-3">
        <oui-message
          class="mx-auto max-w-lg"
          severity="error"
          summary="Erreur d'affichage"
        >
          Une erreur est survenue lors de la récupération du operation. Si le
          problème persiste, veuillez contacter le support.
        </oui-message>

        <oui-button (click)="backClick.emit()">Retour</oui-button>
      </div>
    }

    <ng-template #loadingBrief>
      <p class="mb-3 italic text-gray-600">
        Rédaction du brief technique en cours ...
        <strong>Merci de ne pas quitter la page.</strong>
        🔃
      </p>
      <p-skeleton styleClass="mb-2" width="90%" />
      <p-skeleton styleClass="mb-2" width="60%" />
    </ng-template>
  `,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    BobComponent,
    InfoComponent,
    MessageComponent,
    TextareaModule,
    IconDownloadComponent,
    IconChevronRightComponent,
    ButtonIconComponent,
    OperationAnalysisScoreComponent,
    OperationCeeFileComponent,
    OperationImpactEstimationComponent,
    LocationRecapComponent,
    ButtonComponent,
    PrintDirective,
    NgTemplateOutlet,
    Skeleton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSimulatorBriefComponent {
  readonly backClick = output<void>();

  readonly operation = input.required<OperationRow>();

  protected readonly botBrief = resource({
    params: () => ({
      operation: this.operation(),
    }),
    loader: async ({ params }) => {
      const { operation } = params;

      try {
        return trpcClient.operations.generateBrief.query({
          prestationId: operation.prestationId,
          location: {
            bdnbData: operation.location.bdnbData,
            address: operation.location.address,
            mainSector: operation.location.mainSector,
          },
        });
      } catch (e) {
        console.error("Failed to generate brief:", e);
        throw new Error(
          e instanceof Error
            ? e.message
            : "Une erreur est survenue lors de la génération du brief.",
        );
      }
    },
  });
}
