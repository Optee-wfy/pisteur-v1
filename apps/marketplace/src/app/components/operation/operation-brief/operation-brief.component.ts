import { AsyncPipe, CurrencyPipe, DatePipe, Location } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { CTA, MARKETPLACE_UI_URL, type OperationBrief } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconArrowLeftComponent,
  IconDownloadComponent,
  IconPenComponent,
  IconRefreshComponent,
} from "@optee/icons";
import type { OperationHsId, OperationRow, OperationUuid } from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { InfoComponent } from "@optee/ui/components/molecules/info/info.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import { formatToStringArray, isNotNullish } from "@optee/utils";
import { Skeleton } from "primeng/skeleton";
import { TextareaModule } from "primeng/textarea";
import {
  catchError,
  concatMap,
  filter,
  map,
  merge,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { OperationService } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
import { ProService } from "../../../services/pro.service";
import { LocationRecapComponent } from "../../location/location-recap/location-recap.component";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { LaunchOperationComponent } from "../launch-operation.component/launch-operation.component";
import { OperationAnalysisScoreComponent } from "../operation-analysis-score/operation-analysis-score.component";
import { OperationCeeFileComponent } from "../operation-cee-file/operation-cee-file.component";
import { OperationImpactEstimationComponent } from "../operation-impact-estimation/operation-impact-estimation.component";
import { OperationSignatoryComponent } from "../operation-signatory/operation-signatory.component";

@Component({
  selector: "mkp-operation-brief",
  host: {
    class:
      "flex gap-6 2xl:gap-10 flex-col-reverse justify-center lg:flex-row p-4 xl:p-10",
  },
  template: `
    @if (brief$ | async; as brief) {
      <div class="flex flex-col gap-8 lg:flex-row">
        <section
          class="flex max-w-4xl flex-col gap-6 2xl:gap-10 print:mx-8 print:mt-3"
          [style.flex]="4"
        >
          <!-- Brief heading -->
          <oui-bob [heading]="heading()">
            <!-- Go Back btn -->
            @if (access() === "editable") {
              <div class="flex print:hidden" preTitle>
                <a
                  class="text-primary-700 flex items-center justify-center gap-4"
                  (click)="goBack()"
                >
                  <icon-arrow-left class="size-5" />
                  <span class="font-display underline">Retour</span>
                </a>
              </div>
            }
            <div class="flex flex-col gap-6">
              @if (access() === "editable") {
                <oui-message severity="info">
                  Merci pour votre commande ! Nous transmettons votre demande
                  dès maintenant à nos partenaires professionnels et revenons
                  vers vous sous 72h. Nous restons disponibles pour toute
                  question complémentaire.
                </oui-message>
              }

              <mkp-location-recap [location]="brief.location" />

              <oui-info heading="Détail du projet" variant="highlighted">
                <div class="grid grid-cols-3 gap-x-12 gap-y-4">
                  <oui-info heading="Date de la demande">
                    {{
                      brief.createdAt
                        ? (brief.createdAt | date)
                        : "Non renseignée."
                    }}
                  </oui-info>
                  <oui-info heading="Date de lancement prévue">
                    {{ (brief.launchingDate | date) ?? "Non renseigné." }}
                  </oui-info>

                  @if (brief.plannedBudget) {
                    <oui-info heading="Budget prévu">
                      {{
                        brief.plannedBudget
                          | currency: "EUR" : "symbol" : "1.0-0"
                      }}
                    </oui-info>
                  } @else if (brief.plannedBudgetRange) {
                    <oui-info heading="Budget prévu">
                      Entre {{ brief.plannedBudgetRange }}€
                    </oui-info>
                  }

                  @let isProAndLinkedToOperation =
                    authService.isLoggedAsPro() &&
                    isProLinkedToOperationResource.value();
                  @if (
                    isProAndLinkedToOperation || authService.isLoggedAsClient()
                  ) {
                    <oui-info
                      [heading]="
                        isProAndLinkedToOperation
                          ? 'Décisionnaire'
                          : 'Signataire'
                      "
                    >
                      <mkp-operation-signatory
                        compact
                        (signatoryChanged)="refresh$.next()"
                        [operationUuid]="brief.uuid"
                        [signatory]="brief.signatoryContact"
                      />
                    </oui-info>

                    <oui-info heading="Contact sur site">
                      {{
                        brief.location.nameContactOnSite ?? "Nom non renseigné"
                      }}
                      <br />
                      {{
                        brief.location.phoneContactOnSite ??
                          "Numero non renseignée."
                      }}
                    </oui-info>
                  }
                </div>
              </oui-info>

              <oui-info heading="Opération identifiée" variant="highlighted">
                <oui-info [heading]="brief.typeInfo.label">
                  {{
                    brief.typeInfo.description?.definition ??
                      "Aucune information trouvée pour cette opération."
                  }}
                </oui-info>
              </oui-info>

              <mkp-operation-cee-file [operation]="brief" />

              @if (brief.additionalInfo) {
                <oui-info heading="Infos supplémentaires" variant="highlighted">
                  {{ brief.additionalInfo }}
                </oui-info>
              }
            </div>

            <!-- Loader -->
            <div class="print:hidden" aside>
              @if (pdfLoading()) {
                <div class="flex items-center justify-center gap-6">
                  <icon-refresh class="size-4 animate-spin" />
                  <span class="italic">Génération du PDF en cours...</span>
                </div>
              } @else {
                <a
                  class="text-primary-700 flex cursor-pointer items-center justify-center gap-2 underline"
                  (click)="
                    generatePdf(
                      brief.id,
                      'Récapitulatif de votre opération ' + brief.name
                    )
                  "
                >
                  <icon-download class="size-4" colorMode="colored" />
                  Télécharger le PDF
                </a>
              }
            </div>
          </oui-bob>

          <!-- Bot: Impact estimation -->
          <mkp-operation-impact-estimation [operation]="brief" />

          <!-- Bot : CEE conformity -->
          @if ((brief.funding.value ?? 0) > 0) {
            <oui-bob
              class="print:pt-16"
              dropDown
              heading="Conformité CEE et obligations techniques"
              [isOpen]="true"
            >
              @if (access() === "editable") {
                <oui-button-icon
                  class="size-8 print:hidden"
                  postTitle
                  (click)="editCriteria.set(!editCriteria())"
                >
                  <icon-pen class="size-5" />
                </oui-button-icon>
              }

              <div class="flex flex-col gap-4" [formGroup]="criteriaForm">
                <oui-info
                  heading="Critères d’éligibilité aux aides CEE :"
                  variant="highlighted"
                >
                  @if (editCriteria()) {
                    <textarea
                      class="w-full"
                      pTextarea
                      [autoResize]="true"
                      [formControl]="
                        criteriaForm.controls.eligibilityCriteriaCEE
                      "
                    ></textarea>
                  } @else if (!brief.botBrief) {
                    <p-skeleton styleClass="mb-2" width="100%" />
                    <p-skeleton styleClass="mb-2" width="20%" />
                  } @else {
                    @for (
                      eligibility of brief.botBrief.eligibilityCriteriaCEE;
                      track $index
                    ) {
                      <p>{{ eligibility }}</p>
                    } @empty {
                      <p>Aucune fiche disponible.</p>
                    }
                  }
                </oui-info>

                <oui-info
                  heading="Qualifications nécessaires :"
                  variant="highlighted"
                >
                  @if (editCriteria()) {
                    <textarea
                      class="w-full"
                      pTextarea
                      [autoResize]="true"
                      [formControl]="criteriaForm.controls.qualificationsNeeded"
                    ></textarea>
                  } @else if (!brief.botBrief) {
                    <p-skeleton styleClass="mb-2" width="100%" />
                    <p-skeleton styleClass="mb-2" width="20%" />
                  } @else {
                    @for (
                      qualification of brief.botBrief.qualificationsNeeded;
                      track $index
                    ) {
                      <p>{{ qualification }}</p>
                    } @empty {
                      <p>Non renseigné.</p>
                    }
                  }
                </oui-info>
                <oui-info
                  heading="Contrôles et vérifications :"
                  variant="highlighted"
                >
                  @if (editCriteria()) {
                    <textarea
                      class="w-full"
                      pTextarea
                      [autoResize]="true"
                      [formControl]="criteriaForm.controls.checksOperations"
                    ></textarea>
                  } @else if (!brief.botBrief) {
                    <p-skeleton styleClass="mb-2" width="100%" />
                    <p-skeleton styleClass="mb-2" width="20%" />
                  } @else {
                    @for (
                      operation of brief.botBrief.checksOperations;
                      track $index
                    ) {
                      <p>{{ operation }}</p>
                    } @empty {
                      <p>Non renseigné.</p>
                    }
                  }
                </oui-info>

                @if (editCriteria()) {
                  <oui-button
                    variant="primary"
                    (click)="updateCriteria(criteriaForm.value)"
                  >
                    Enregistrer les modifications
                  </oui-button>
                }
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
            @if (access() === "editable") {
              <oui-button-icon
                class="size-8 print:hidden"
                postTitle
                (click)="editConstraints.set(!editConstraints())"
              >
                <icon-pen class="size-5" />
              </oui-button-icon>
            }
            <div class="flex flex-col gap-4" [formGroup]="constraintsForm">
              <oui-info
                heading="Objectifs du maître d'ouvrage"
                variant="highlighted"
              >
                @if (editConstraints()) {
                  <textarea
                    class="w-full"
                    pTextarea
                    [autoResize]="true"
                    [formControl]="constraintsForm.controls.goalMOA"
                  ></textarea>
                } @else if (!brief.botBrief) {
                  <p-skeleton styleClass="mb-2" width="100%" />
                  <p-skeleton styleClass="mb-2" width="20%" />
                } @else {
                  {{ brief.botBrief.goalMOA || "Non renseigné." }}
                }
              </oui-info>
              <oui-info
                heading="Justification des choix des opérations"
                variant="highlighted"
              >
                @if (editConstraints()) {
                  <textarea
                    class="w-full"
                    pTextarea
                    [autoResize]="true"
                    [formControl]="
                      constraintsForm.controls.justificationChoiceOperations
                    "
                  ></textarea>
                } @else if (!brief.botBrief) {
                  <p-skeleton styleClass="mb-2" width="100%" />
                  <p-skeleton styleClass="mb-2" width="20%" />
                } @else {
                  {{
                    brief.botBrief.justificationChoiceOperations ||
                      "Non renseigné."
                  }}
                }
              </oui-info>
              <oui-info heading="Type de site" variant="highlighted">
                @if (editConstraints()) {
                  <textarea
                    class="w-full"
                    pTextarea
                    [autoResize]="true"
                    [formControl]="constraintsForm.controls.buildingType"
                  ></textarea>
                } @else if (!brief.botBrief) {
                  <p-skeleton styleClass="mb-2" width="100%" />
                  <p-skeleton styleClass="mb-2" width="20%" />
                } @else {
                  {{ brief.botBrief.buildingType || "Non connu." }}
                }
              </oui-info>
              <oui-info heading="Critères du site" variant="highlighted">
                @if (editConstraints()) {
                  <textarea
                    class="w-full"
                    pTextarea
                    [autoResize]="true"
                    [formControl]="constraintsForm.controls.buildingCriterias"
                  ></textarea>
                } @else if (!brief.botBrief) {
                  <p-skeleton styleClass="mb-2" width="100%" />
                  <p-skeleton styleClass="mb-2" width="20%" />
                } @else {
                  {{
                    brief.botBrief.buildingCriterias || "Aucun critère connu."
                  }}
                }
              </oui-info>
              <oui-info heading="Contraintes techniques" variant="highlighted">
                @if (editConstraints()) {
                  <textarea
                    class="w-full"
                    pTextarea
                    [autoResize]="true"
                    [formControl]="constraintsForm.controls.technicalConstraint"
                  ></textarea>
                } @else if (!brief.botBrief) {
                  <p-skeleton styleClass="mb-2" width="100%" />
                  <p-skeleton styleClass="mb-2" width="20%" />
                } @else {
                  {{
                    brief.botBrief.technicalConstraint ||
                      "Aucune contrainte connue."
                  }}
                }
              </oui-info>
              @if (editConstraints()) {
                <oui-button
                  variant="primary"
                  (click)="updateConstraint(constraintsForm.value)"
                >
                  Enregistrer les modifications
                </oui-button>
              }
            </div>
          </oui-bob>
        </section>

        <!-- Sidebar : buttons + analysis/score -->
        <section
          class="top-0 -mt-2 flex h-fit flex-1 flex-col gap-4 pt-2 empty:hidden lg:sticky lg:max-w-screen-sm print:mx-8"
        >
          @if (brief.isLaunchable && permissionService.can("DEAL_LAUNCH")) {
            <oui-button
              class="flex-1"
              full
              size="medium"
              variant="primary"
              (click)="initOperation(brief)"
            >
              <mkp-icon-operation-launch class="size-4" />
              {{ CTA.launchCallForTender }}
            </oui-button>
          }

          @if (brief.supportsAnalysis() && brief.estimatedEnergyImpact) {
            <mkp-operation-analysis-score [operation]="brief" />
          }
        </section>
      </div>
    } @else if (error$ | async) {
      <div class="mx-auto flex flex-col items-center gap-3">
        <oui-message
          class="mx-auto max-w-lg"
          severity="error"
          summary="Erreur d'affichage"
        >
          Une erreur est survenue lors de la récupération du brief. Si le
          problème persiste, veuillez contacter le support.
        </oui-message>

        <oui-button routerLink="/client/">
          Retour vers la page d'accueil
        </oui-button>
      </div>
    }
  `,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterModule,
    BobComponent,
    InfoComponent,
    MessageComponent,
    Skeleton,
    TextareaModule,
    ButtonComponent,
    IconPenComponent,
    IconArrowLeftComponent,
    IconDownloadComponent,
    IconOperationLaunchComponent,
    IconRefreshComponent,
    ButtonIconComponent,
    OperationAnalysisScoreComponent,
    OperationCeeFileComponent,
    OperationImpactEstimationComponent,
    LocationRecapComponent,
    OperationSignatoryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationBriefComponent {
  readonly operationUuid = input.required<OperationUuid>();
  readonly access = input.required<"read-only" | "editable">();

  protected readonly heading = computed(() => {
    return this.access() === "editable"
      ? "Récapitulatif de votre demande"
      : "Récapitulatif de la demande";
  });

  protected readonly permissionService = inject(PermissionService);
  private readonly dialogService = inject(DialogService);
  private readonly operationService = inject(OperationService);
  private readonly toastService = inject(ToastService);
  private readonly location = inject(Location);
  private readonly fileService = inject(FileService);
  protected readonly authService = inject(AuthService);
  protected readonly proService = inject(ProService);

  protected readonly pdfLoading = signal(false);

  protected readonly title = inject(Title);

  protected readonly CTA = CTA;

  protected readonly editCriteria = signal(false);
  protected readonly criteriaForm = new FormGroup({
    eligibilityCriteriaCEE: new FormControl([""]),
    qualificationsNeeded: new FormControl([""]),
    checksOperations: new FormControl([""]),
  });

  protected readonly editConstraints = signal(false);
  protected readonly constraintsForm = new FormGroup({
    goalMOA: new FormControl(""),
    justificationChoiceOperations: new FormControl([""]),
    buildingType: new FormControl(""),
    buildingCriterias: new FormControl(""),
    technicalConstraint: new FormControl(""),
  });

  protected readonly subRefreshOnBriefPromise = toObservable(this.operationUuid)
    .pipe(
      takeUntilDestroyed(),
      concatMap(async (uuid) => {
        // Already got a running Promise? Fine let's wait for it to complete
        if (this.operationService.briefPromises[uuid]) {
          return this.operationService.briefPromises[uuid];
        }

        const operation = await this.operationService.get(uuid);
        // Got no operation, shouldn't happen so let's just leave
        if (!operation) {
          return Promise.resolve(null);
        }

        // Operation has no brief... and no Promise is running? It has probably be canceled... Let's ask again
        if (!operation.botBrief) {
          return this.operationService.updateMissingBrief(uuid);
        }

        // Nah, all good the operation has a brief
        return Promise.resolve(null);
      }),
      filter(isNotNullish),
    )
    .subscribe(() => {
      this.refresh$.next();
    });

  protected readonly refresh$ = new Subject<void>();

  protected readonly brief$ = merge(
    toObservable(this.operationUuid).pipe(filter(isNotNullish)),
    this.refresh$,
  ).pipe(
    switchMap(() => this.operationService.get(this.operationUuid())),
    filter(isNotNullish),
    shareReplay(1),
    tap((b) => {
      if (b.botBrief) {
        this.criteriaForm.patchValue(b.botBrief);
        this.constraintsForm.patchValue(b.botBrief);
      }
    }),
  );

  private readonly titleSubscription = this.brief$
    .pipe(takeUntilDestroyed())
    .subscribe((brief) => {
      this.title.setTitle("Brief " + brief.name);
    });

  protected readonly ceeFile$ = this.brief$.pipe(
    map((b) => b.getCeeFile(b.location.mainSector)),
  );

  protected readonly error$ = this.brief$.pipe(
    map((b) => !b),
    catchError(() => of(true)),
  );

  protected readonly isProLinkedToOperationResource = resource({
    params: () => ({
      operationUuid: this.operationUuid(),
      loggedAsPro: this.authService.isLoggedAsPro(),
    }),
    loader: async ({ params }) => {
      if (!params.loggedAsPro) {
        return false;
      }
      return this.proService.checkIfProLinkedToOperation(params.operationUuid);
    },
  });

  // Helper to display location name or "Résidence" + streetName if name starts with a number
  protected locationNameDisplay(name: string, streetName: string): string {
    return /^\d/.test(name) ? "Résidence " + streetName : name;
  }

  protected async initOperation(operation: OperationRow) {
    const canLaunch = await this.operationService.canLaunchOperation({
      hsPrestationId: operation.prestationId,
      locationUuid: operation.location.uuid,
      operationUuid: operation.uuid,
    });

    if (!canLaunch) {
      return;
    }

    try {
      const { res: isLaunched } = await this.dialogService.open(
        LaunchOperationComponent,
        {
          data: {
            operationUuid: operation.uuid,
            locationUuid: operation.location.uuid,
            contactOnSite: operation.location.contactOnSite,
            hsPrestationId: operation.prestationId,
            skipBriefPanel: true,
          },
        },
      );

      if (!isLaunched) {
        return;
      }

      this.refresh$.next();
    } catch (err) {
      this.toastService.openError("Lancement de l'opération", err);
    }
  }

  protected async updateCriteria(formValue: {
    eligibilityCriteriaCEE?: string[] | null | undefined;
    qualificationsNeeded?: string[] | null | undefined;
    checksOperations?: string[] | null | undefined;
  }) {
    try {
      await trpcClient.operations.editBrief.mutate({
        uuid: this.operationUuid(),
        botBrief: {
          eligibilityCriteriaCEE: formatToStringArray(
            formValue.eligibilityCriteriaCEE,
          ),
          qualificationsNeeded: formatToStringArray(
            formValue.qualificationsNeeded,
          ),
          checksOperations: formatToStringArray(formValue.checksOperations),
        },
      });
    } catch (error) {
      this.toastService.openError("Mise à jour des critères", error);
    }
    this.editCriteria.set(false);
    this.refresh$.next();
  }

  protected async updateConstraint(formValue: OperationBrief) {
    const { justificationChoiceOperations, ...values } = formValue;
    try {
      await trpcClient.operations.editBrief.mutate({
        uuid: this.operationUuid(),
        botBrief: {
          ...values,
          justificationChoiceOperations: formatToStringArray(
            justificationChoiceOperations,
          ),
        },
      });
    } catch (error) {
      this.toastService.openError("Mise à jour des contraintes", error);
    }
    this.editConstraints.set(false);
    this.refresh$.next();
  }

  goBack() {
    this.location.back();
  }

  protected async generatePdf(briefId: OperationHsId | null, fileName: string) {
    if (!briefId) {
      return;
    }
    const urlBrief = `${MARKETPLACE_UI_URL}/brief/${briefId}`;
    this.pdfLoading.set(true);
    try {
      const base64 = await trpcClient.pdfGenerator.convertUrlToPdf.mutate({
        url: urlBrief,
      });
      const blobUrl = this.fileService.convertBase64ToUrl(base64);
      await this.fileService.downloadFileFromUrl(blobUrl, fileName);
    } catch (error) {
      this.toastService.openError("Génération du PDF", error);
    } finally {
      this.pdfLoading.set(false);
    }
  }
}
