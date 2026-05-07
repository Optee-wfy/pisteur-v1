import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import type { ContractType } from "@optee/constants";
import {
  buildAssetUrl,
  PRO_CONTRACTS,
  YouSignEventEnum,
  YouSignRequestStatus,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconDownloadComponent, IconSpinnerComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { sleep } from "@optee/utils";
import trpcClient from "../../../../../trpc-client";
import { YousignSignerDialogComponent } from "../../../../components/you-sign/you-sign-signer.component";
import { ProService } from "../../../../services/pro.service";
import { YousignService } from "../../../../services/yousign.service";

@Component({
  selector: "mkp-pro-onboarding-sign",
  host: {
    class: "p-4 flex flex-col items-start justify-center w-full",
  },
  template: `
    <oui-bob
      class="max-w-app mx-auto flex w-full justify-center"
      heading="Création du compte terminée"
    >
      <p class="text-sm text-gray-600" underTitle>
        Pour finaliser votre inscription, veuillez prendre connaissance et
        accepter le contrat suivant.
      </p>

      @if (loading()) {
        <p
          class="text-primary-900 flex items-center justify-center gap-2 py-4 text-center text-sm"
        >
          <icon-spinner
            class="size-4 animate-spin text-transparent"
            colorMode="colored"
          />
          Vérification des informations
        </p>
      } @else {
        <div class="flex flex-col gap-4">
          <h2
            class="font-display text-primary-900 text-base font-semibold tracking-tight"
          >
            {{ displayedConditions().title }}
          </h2>

          <div class="flex flex-col gap-6 rounded-2xl bg-gray-100 p-6">
            @for (block of displayedConditions().items; track block.title) {
              <div class="flex flex-col gap-2">
                <h3
                  class="text-primary-900 text-sm font-medium leading-tight tracking-tight"
                >
                  {{ block.title }}
                </h3>
                <ul class="flex flex-col gap-2 pt-1">
                  @for (item of block.items; track $index) {
                    <li class="flex items-center gap-4">
                      <span
                        class="text-primary-700 flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-medium"
                      >
                        {{ $index + 1 }}
                      </span>
                      <span
                        class="text-primary-900 text-sm leading-tight tracking-tight"
                      >
                        {{ item }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div
            class="bg-primary-700 flex flex-col gap-6 rounded-2xl p-6 text-white"
          >
            <h3 class="font-display text-pretty font-semibold tracking-tight">
              Pour plus d’information, veuillez consulter le document en
              cliquant sur le lien ci-dessous.
            </h3>
            @if (currentContract(); as contract) {
              <a
                class="flex cursor-pointer items-center gap-2 underline underline-offset-4"
                [download]="contract.documentName"
                [href]="buildAssetUrl(contract.file)"
              >
                <icon-download
                  class="size-6 shrink-0 rounded-full border border-current p-1"
                  colorMode="semi"
                />
                Télécharger le document
              </a>
              <hr />
              <div class="flex flex-wrap items-center justify-between gap-4">
                <p class="font-display text-sm leading-tight tracking-tight">
                  En cliquant sur “Signer le contrat”, je reconnais
                  <br />
                  avoir pris connaissance du contrat et l’accepte.
                </p>
                <oui-button
                  (click)="signContract(contract.id)"
                  [disabled]="!isSignable.value() || loading() || !contract.id"
                >
                  Signer le contrat
                </oui-button>
              </div>
            }
          </div>
        </div>
      }
    </oui-bob>
  `,
  imports: [
    BobComponent,
    IconDownloadComponent,
    ButtonComponent,
    IconSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProSignComponent {
  private readonly proService = inject(ProService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly yousignService = inject(YousignService);

  private readonly contractConditions = {
    partnership: {
      title: "1. Contrat de Partenariat",
      items: [
        {
          title: "Accès aux chantiers",
          items: [
            "Référencement dans le réseau Optee pour recevoir des mises en relation avec des clients.",
            "Libre fixation des tarifs et conditions d'exécution des prestations.",
          ],
        },
        {
          title: "Commission et obligations",
          items: [
            "Optee perçoit une commission de 18% sur chaque chantier réalisé via la plateforme.",
            "Le prestataire est seul responsable des travaux effectués.",
          ],
        },
      ],
    },
    cee: {
      title: "2. Contrat de Valorisation des Certificats d’Énergie",
      items: [
        {
          title: "Engagement du partenaire",
          items: [
            "Constituer et transmettre des dossiers de travaux complets et conformes aux exigences réglementaires.",
            "Garantir la validité des CEE émis et s’engager à respecter la réglementation en vigueur.",
          ],
        },
        {
          title: "Conditions financières",
          items: [
            "Le partenaire perçoit une rémunération basée sur les CEE obtenus et validés à hauteur de 6,0 euros du gWh cumac.",
            "Un montant minimum de Prime pour le bénéficiaire final est imposé.",
            "Le paiement est effectué après validation des dossiers et peut être conditionné en cas de non-conformité.",
          ],
        },
      ],
    },
  };

  protected readonly displayedConditions = computed(
    () => this.contractConditions[this.currentStep()],
  );

  protected readonly buildAssetUrl = buildAssetUrl;

  protected readonly pro = toSignal(this.proService.pro$);
  protected readonly isEligibleCee = computed(
    () => !!this.pro()?.eligibilityCee,
  );

  protected readonly currentStep = linkedSignal<ContractType>(() =>
    this.pro()?.partnershipContractSignedAt ? "cee" : "partnership",
  );

  protected readonly currentContract = computed(() =>
    this.currentStep() === "cee"
      ? PRO_CONTRACTS.find((contract) => contract.id === "cee")
      : PRO_CONTRACTS.find(
          (contract) =>
            contract.id === "partnership" &&
            contract.cee === this.isEligibleCee(),
        ),
  );

  protected readonly isSignable = resource({
    params: () => ({
      currentContract: this.currentContract(),
      currentPro: this.pro(),
    }),
    loader: async ({ params }) => {
      if (params.currentPro?.status === "Compte en attente de validation") {
        await this.router.navigate(["/pro/onboarding/onboarding-confirm"]);
        return false;
      }

      this.loading.set(true);

      const contractKey = params.currentContract?.id;

      if (!contractKey) {
        this.loading.set(false);
        return false;
      }
      const contractId = params.currentPro?.[`${contractKey}ContractId`];

      if (!contractId) {
        this.loading.set(false);
        return true;
      }

      const status =
        await trpcClient.yousign.getSignatureRequestStatus.query(contractId);

      if (status === YouSignRequestStatus.DONE) {
        await this.nextStep(this.currentStep());
        return false;
      }
      this.loading.set(false);
      return status === YouSignRequestStatus.ONGOING;
    },
  });

  protected readonly loading = signal(false);

  async signContract(contract: ContractType) {
    this.loading.set(true);
    try {
      const { contractId, signatureLink, status } =
        await trpcClient.pros.getContract.mutate(contract);

      if (!contractId) {
        throw new Error(
          "Le contrat est introuvable. Merci de contacter le support.",
        );
      }

      switch (status) {
        case YouSignRequestStatus.REJECTED:
          // should never happen since they don't have option, but in case
          throw new Error(
            "Vous ne pouvez refuser le contrat. Merci de contacter le support.",
          );
        case YouSignRequestStatus.ONGOING: {
          if (!signatureLink) {
            throw new Error(
              "Le lien de signature est introuvable. Merci de contacter le support.",
            );
          }
          const { res } = await this.dialogService.open(
            YousignSignerDialogComponent,
            {
              data: { signatureLink },
              disableClose: true,
            },
          );
          this.loading.set(true);

          if (res?.event === YouSignEventEnum.SIGNATUREDONE) {
            const isDone =
              await this.yousignService.waitUntilSignatureDone(contractId);
            if (!isDone) {
              throw new Error(
                "La signature n'a pas pu être confirmée. Veuillez réessayer ou contacter le support si le problème persiste.",
              );
            }

            // next section
            this.nextStep(contract);
          }
          break;
        }
        case YouSignRequestStatus.DONE: {
          this.nextStep(contract);
          break;
        }
        default:
          console.error(
            "🚩 Status Yousign non pris en charge",
            status,
            this.pro()?.uuid,
          );
      }
    } catch (err) {
      this.toastService.openError("Signature du contrat", err);
    } finally {
      this.loading.set(false);
    }
  }

  private async nextStep(contract: "partnership" | "cee") {
    this.proService.refresh();
    await sleep(500);
    if (contract === "partnership" && this.isEligibleCee()) {
      this.currentStep.set("cee");
    } else {
      this.router.navigate(["/pro/onboarding/onboarding-confirm"]);
    }
  }
}
