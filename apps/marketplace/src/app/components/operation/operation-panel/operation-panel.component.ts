import { animate, style, transition, trigger } from "@angular/animations";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, RouterModule } from "@angular/router";
import type { BriefPageQueryParams } from "@optee/constants";
import {
  BRIEF_PAGE_SOURCE_QUERY_PARAM,
  CTA,
  OperationPhaseEnum,
  ProSubscription,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { IconCirclePlusComponent, IconXmarkComponent } from "@optee/icons";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { TagComponent } from "@optee/ui/components/atoms/tag/tag.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { TabsModule } from "primeng/tabs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { OperationService, Tab } from "../../../services/operation.service";
import { PermissionService } from "../../../services/permission.service";
import { ProService } from "../../../services/pro.service";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { LaunchOperationComponent } from "../launch-operation.component/launch-operation.component";
import { NewOperationByClientComponent } from "../new-operation-by-client/new-operation-by-client.component";
import { OperationAnalysisScoreComponent } from "../operation-analysis-score/operation-analysis-score.component";
import { OperationDocumentsComponent } from "../operation-documents/operation-documents.component";
import { OperationsGeneralInfoComponent } from "../operation-general-info/operation-general-info.component";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";

type TabItem = {
  type: Tab;
  label: string;
};
@Component({
  selector: "mkp-operation-panel",
  host: {
    class: "z-50",
  },
  template: `
    @if (operationService.operation(); as operation) {
      <!-- backdrop -->
      <div
        class="fixed inset-0 z-30 bg-black/75"
        [@fadeInOut]
        aria-hidden="true"
        (click)="operationService.closePanel()"
      ></div>

      <section
        class="shadow-o fixed inset-0 left-auto z-50 flex h-screen w-full max-w-screen-sm flex-col gap-4 rounded-bl-3xl rounded-tl-3xl bg-white p-6"
        [@fadeTranslate]
      >
        <header>
          <div class="flex w-full items-start gap-4">
            <oui-button-icon
              class="text-primary-700 size-8"
              (click)="operationService.closePanel()"
            >
              <icon-xmark class="size-5" />
            </oui-button-icon>

            <div class="flex-1">
              @let locationName = operation?.location?.name;
              @let hasCustomLocationName =
                locationName &&
                locationName.toLocaleLowerCase() !==
                  operation.location.shortAddress.toLocaleLowerCase();
              <h2 class="text-primary-900 font-display text-2xl font-semibold">
                {{ locationName ?? operation.location.shortAddress }}
              </h2>

              @if (hasCustomLocationName) {
                <div class="text-primary-900 text-lg font-medium">
                  {{ operation.location.shortAddress }}
                </div>
              }
              <div class="text-lg text-gray-600">
                {{ operation.location.zipcode }}
                {{ operation.location.city }}
              </div>
            </div>

            @if (
              !operation.isSimulation &&
              operation.parentTypeInfo.showBriefButton
            ) {
              <oui-button size="medium" variant="primary" (click)="seeBrief()">
                Voir brief
              </oui-button>
            }
          </div>

          <!-- Width of icon + gap. We don't want to put it under the address because it can push the brief button when too long -->
          <div class="ml-14 mt-4 flex gap-2">
            <mkp-operation-tag
              [operationGroup]="operation.phase.category"
              [operationSubType]="operation.typeInfo"
              [operationType]="operation.parentTypeInfo"
            />
            <oui-tag size="small" [variant]="tagVariant()">
              {{ operation.typeCategory }}
            </oui-tag>
          </div>
        </header>

        <p-tabs
          class="h-full flex-1"
          scrollable
          [value]="operationService.selectedTab() ?? Tab.GENERAL_INFO"
        >
          @let tabs = tabsList();
          <p-tablist class="h-20">
            @for (tab of tabs; track $index) {
              <p-tab [value]="tab.type">
                {{ tab.label }}
              </p-tab>
            }
          </p-tablist>

          <div class="relative flex-auto">
            @let loggedAs = authService.loggedAs();
            <p-tabpanels
              class="absolute inset-0 -mx-3 h-full overflow-y-auto !pt-0"
            >
              @for (tab of tabs; track $index) {
                <p-tabpanel [value]="tab.type">
                  @switch (tab.type) {
                    @case (Tab.SCORE) {
                      <mkp-operation-analysis-score [operation]="operation" />
                    }
                    @case (Tab.DOCUMENTS) {
                      @if (
                        loggedAs &&
                        (authService.isLoggedAsClient() || canSeeDocuments())
                      ) {
                        <mkp-operation-documents
                          [displayFor]="loggedAs"
                          [operationUuid]="operation.uuid"
                        />
                      } @else {
                        <oui-message class="w-full" severity="info">
                          Vous n'avez pas accès aux documents associés à cette
                          opération.
                        </oui-message>
                      }
                    }
                    @default {
                      <mkp-operations-general-info [operation]="operation" />
                    }
                  }
                </p-tabpanel>
              }
            </p-tabpanels>
          </div>
        </p-tabs>

        <footer class="mt-auto flex w-full items-center empty:hidden">
          @if (operation.isSimulation) {
            @if (permissionService.can("DEAL_LAUNCH")) {
              @if (operation.isAlreadyOrdered) {
                <oui-button
                  class="ml-auto"
                  full
                  size="medium"
                  variant="primary"
                  (click)="launchOperation()"
                >
                  <mkp-icon-operation-launch class="size-4" />
                  {{ CTA.launchThisOperation }}
                </oui-button>
              } @else {
                <oui-button
                  class="ml-auto"
                  full
                  size="medium"
                  variant="primary"
                  (click)="newProject()"
                >
                  <icon-circle-plus class="size-4" />
                  {{ CTA.startThisProject }}
                </oui-button>
              }
            }
          } @else {
            @if (
              operation.canBeDeleted && permissionService.can("DEAL_DELETE")
            ) {
              <a
                class="font-display cursor-pointer text-red-500 underline"
                (click)="deleteOperation()"
              >
                Supprimer l'opération
              </a>
            }

            @if (
              operation.isLaunchable && permissionService.can("DEAL_LAUNCH")
            ) {
              <oui-button
                class="ml-auto"
                full
                size="medium"
                variant="primary"
                (click)="launchOperation()"
              >
                <mkp-icon-operation-launch class="size-4" />
                {{ CTA.launchThisOperation }}
              </oui-button>
            }
          }
        </footer>
      </section>
    }
  `,
  imports: [
    RouterModule,
    OperationsGeneralInfoComponent,
    ButtonComponent,
    IconOperationLaunchComponent,
    IconCirclePlusComponent,
    OperationAnalysisScoreComponent,
    ButtonIconComponent,
    IconXmarkComponent,
    TagComponent,
    OperationTagComponent,
    OperationDocumentsComponent,
    TabsModule,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeInOut", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("150ms", style({ opacity: 0 }))]),
    ]),
    trigger("fadeTranslate", [
      transition(":enter", [
        style({ transform: "translateX(16px)", opacity: 0 }),
        animate("150ms", style({ transform: "translateX(0)", opacity: 1 })),
      ]),
      transition(":leave", [
        animate("150ms", style({ transform: "translateX(16px)", opacity: 0 })),
      ]),
    ]),
  ],
})
export class OperationPanelComponent {
  protected readonly operationService = inject(OperationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly authService = inject(AuthService);
  protected readonly proService = inject(ProService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly tagVariant = computed(() => {
    const operation = this.operationService.operation();
    if (!operation) {
      return "neutral";
    }
    return "primary";
  });

  protected readonly Tab = Tab;
  protected readonly CTA = CTA;
  protected readonly eliteSubscription = ProSubscription.IMPACT;

  protected readonly canSeeDocuments = computed(
    () => this.canReadQuotesByClient() || this.canReadQuotesByLocation(),
  );

  protected readonly tabsList = computed(() => {
    const operation = this.operationService.operation();

    const tabs: TabItem[] = [];

    // If no operation is available, return an empty list
    if (!operation) {
      return [];
    }

    // Tab "Informations générales" is always available
    tabs.push({
      type: Tab.GENERAL_INFO,
      label: "Informations générales",
    });

    // Tab "Analyse & Score" if operation supports analysis and has energy impact
    if (
      operation.supportsAnalysis() &&
      operation.estimatedEnergyImpact !== null
    ) {
      tabs.push({ type: Tab.SCORE, label: "Analyse & Score" });
    }

    // Tab “Documents” if user can read quotes
    if (this.canSeeDocuments()) {
      tabs.push({ type: Tab.DOCUMENTS, label: "Documents" });
    }

    return tabs;
  });

  private readonly briefQueryParam: BriefPageQueryParams = {
    [BRIEF_PAGE_SOURCE_QUERY_PARAM]: "Panneau latéral",
  };

  private readonly canReadQuotesByClient = toSignal(
    this.permissionService.can$("QUOTE_READ_BY_CLIENT"),
    { initialValue: false },
  );

  private readonly canReadQuotesByLocation = toSignal(
    this.permissionService.can$("QUOTE_READ_BY_LOCATION"),
    { initialValue: false },
  );

  private readonly syncSelectedTab = effect(() => {
    const firstTab = this.tabsList()[0]?.type ?? null;
    this.operationService.selectedTab.set(firstTab);
  });

  protected async deleteOperation() {
    try {
      const operation = this.operationService.operation();
      if (!operation) {
        return;
      }

      const { res: confirmed } = await this.dialogService.open(
        DialogConfirmationComponent,
        {
          data: {
            title: "Voulez-vous vraiment supprimer cette opération ?",
            description:
              "Si vous supprimez cette opération, cela mettera fin à toutes les démarches entreprises en cours. Nous vous invitons à contacter votre conseiller chez Optee.",
            action: "Supprimer",
            actionColor: "danger",
            reverse: false,
          },
        },
      );

      if (confirmed) {
        await trpcClient.operations.updatePhase.mutate({
          uuid: operation.uuid,
          phase: OperationPhaseEnum.CLOSED_LOST,
        });

        this.operationService.refresh();
        this.operationService.closePanel();

        this.toastService.open(
          "success",
          "Suppression de l'opération",
          "L'opération a bien été supprimée",
        );
      }
    } catch (err) {
      this.toastService.openError("Suppression de l'opération", err);
    }
  }

  protected async launchOperation() {
    const operation = this.operationService.operation();
    if (!operation) {
      return;
    }

    try {
      if (!operation.isLaunchable) {
        throw new Error(
          "L'opération ne peut être démarrée, veuillez contacter votre conseiller Optee",
        );
      }

      if (!this.permissionService.can("DEAL_LAUNCH")) {
        throw new Error(
          "Vous n'avez pas la permission de lancer cette opération",
        );
      }

      const canLaunch = await this.operationService.canLaunchOperation({
        hsPrestationId: operation.prestationId,
        locationUuid: operation.location.uuid,
        operationUuid: operation.uuid,
      });

      if (!canLaunch) {
        return;
      }

      await this.dialogService.open(LaunchOperationComponent, {
        data: {
          operationUuid: operation.uuid,
          locationUuid: operation.location.uuid,
          contactOnSite: operation.location.contactOnSite,
          hsPrestationId: operation.prestationId,
        },
      });
    } catch (err) {
      this.toastService.openError(CTA.launchOperation, err);
    }
  }

  protected newProject() {
    const operation = this.operationService.operation();
    if (!operation) {
      return;
    }

    this.dialogService.open(NewOperationByClientComponent, {
      data: {
        operation,
      },
    });
  }

  protected async seeBrief() {
    const operation = this.operationService.operation();

    if (!operation) {
      return;
    }

    if (this.router.url.startsWith("/client")) {
      this.router.navigate(["/client/brief", operation.uuid], {
        queryParams: this.briefQueryParam,
      });
      this.operationService.closePanel();
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/brief", operation.id], {
          queryParams: this.briefQueryParam,
        }),
      );
      window.open(url, "_blank");
    }
  }
}
