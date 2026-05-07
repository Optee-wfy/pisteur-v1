import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  CONTACT_CONNECTION_COST_CYCLOPE,
  CTA,
  PRO_LOCATION_ASSOCIATIONS,
  UserType,
} from "@optee/constants";
import {
  IconBookmarkComponent,
  IconChevronRightComponent,
  IconPaperPlaneComponent,
  IconSpinnerComponent,
} from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { Operation } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { sleep } from "@optee/utils";
import { TabsModule } from "primeng/tabs";
import { Tooltip } from "primeng/tooltip";
import { LocationColumnComponent } from "../../../../components/location/location-column/location-column.component";
import { LocationSimulatorBriefComponent } from "../../../../components/location/location-simulator-brief/location-simulator-brief.component";
import { OperationAnalysisProComponent } from "../../../../components/operation/operation-analysis-pro/operation-analysis-pro.component";
import { OperationDocumentsComponent } from "../../../../components/operation/operation-documents/operation-documents.component";
import { ContactsTabComponent } from "../../../../components/pro/cyclope/contacts-tab/contacts-tab.component";
import {
  CyclopeMode,
  CyclopeService,
} from "../../../../services/cyclope.service";

@Component({
  selector: "mkp-cyclope-page",
  host: {
    class: "flex h-full relative justify-start",
  },
  template: `
    @let locationValue = cyclopeService.location.value();
    @let cyclope = cyclopeService.activeCyclope();
    @let clientUuidValue = cyclopeService.clientUuid.value();

    @if (operationForBrief(); as brief) {
      <mkp-location-simulator-brief
        class="mx-auto"
        (backClick)="operationForBrief.set(null)"
        [operation]="brief"
      />
    } @else if (cyclope) {
      @if (isLoadingContent()) {
        <p
          class="mx-auto flex w-fit items-center gap-2 self-center justify-self-center text-lg text-gray-600"
        >
          <icon-spinner
            class="size-4 animate-spin text-transparent"
            colorMode="colored"
          />
          Chargement de votre espace.
        </p>
      } @else {
        <mkp-location-column
          class="hidden lg:inline lg:max-w-md lg:overflow-y-auto"
          [canUpdate]="false"
          [location]="locationValue ?? null"
        >
          <div class="flex items-center justify-start gap-2 px-4">
            @if (
              cyclope.mode !== CyclopeMode.SIMULATE &&
              locationValue &&
              !cyclopeService.isInFavorites.isLoading()
            ) {
              <oui-button (click)="cyclopeService.toggleFavorite()">
                <icon-bookmark
                  class="size-4"
                  ngProjectAs="prefix"
                  [filled]="cyclopeService.isInFavorites.value()"
                />
                {{
                  cyclopeService.isInFavorites.value()
                    ? "Enregistré"
                    : "Enregistrer"
                }}
              </oui-button>
            }

            <!-- Launch new project -->
            <span tooltipPosition="right" [pTooltip]="newProjectTooltip()">
              @if (
                cyclopeService.isInProspectMode(cyclope) &&
                cyclopeService.locationHasContacts.value()
              ) {
                @let prospectionMailTo = cyclopeService.prospectionMailUrl();
                <oui-button
                  target="_blank"
                  variant="accent"
                  [attr.rel]="prospectionMailTo ? 'noopener noreferrer' : null"
                  [disabled]="
                    !cyclopeService.proHasUnlockedLocation() ||
                    !prospectionMailTo
                  "
                  [href]="prospectionMailTo ? prospectionMailTo : undefined"
                >
                  {{ CTA.proposeNewClientProject }}
                </oui-button>
              } @else {
                <oui-button
                  variant="accent"
                  (click)="
                    cyclopeService.createClientProject(
                      locationValue,
                      clientUuidValue
                    )
                  "
                  [disabled]="!cyclopeService.proHasUnlockedLocation()"
                >
                  @if (
                    cyclopeService.location.isLoading() ||
                    cyclopeService.clientUuid.isLoading()
                  ) {
                    <icon-spinner
                      class="size-4 animate-spin text-transparent"
                      colorMode="colored"
                    />
                  }

                  <icon-paper-plane class="size-6" />
                  {{
                    cyclope.mode === CyclopeMode.PROSPECT
                      ? CTA.proposeClientProject
                      : CTA.proposeNewClientProject
                  }}
                </oui-button>
              }
            </span>
          </div>
        </mkp-location-column>

        <section
          class="mx-auto flex w-full flex-1 flex-col gap-4 p-6 lg:max-w-screen-lg"
        >
          <header class="flex flex-wrap items-end justify-between gap-4">
            <div class="flex flex-col gap-2">
              <a
                class="hover:bg-primary-100 flex w-fit cursor-pointer items-center justify-start gap-2 rounded-lg border-current py-1 pl-2 pr-3 text-lg text-gray-600"
                (click)="goBack()"
              >
                <icon-chevron-right class="size-4 rotate-180 text-gray-500" />
                Retour
              </a>
              <div class="flex flex-col gap-2">
                <h1 class="font-display text-3xl font-bold">
                  {{ sectionTitle() }}
                </h1>
                @if (cyclopeService.operationLead.value(); as op) {
                  <h2 class="font-display text-2xl font-medium text-gray-600">
                    {{ op.label }}
                  </h2>
                }
              </div>
            </div>
            <!-- @if (false && cyclope.mode === CyclopeMode.BOUGHT_LEAD) {
              <oui-button class="self-end" variant="accent">
                <icon-calendar class="size-6 text-gray-500" />
                Organiser un RDV
              </oui-button>
            } -->
          </header>

          <oui-eve class="flex-auto">
            <p-tabs
              class="-mx-2 h-full"
              scrollable
              [value]="cyclopeService.activeTab()"
            >
              <p-tablist class="p-tablist--big">
                @for (tab of tabs(); track $index) {
                  @if (tab.visible) {
                    <span
                      class="flex-1"
                      tooltipPosition="bottom"
                      [pTooltip]="tab.disabled ? tab.disabledReason : undefined"
                    >
                      <p-tab
                        class="justify-center"
                        [disabled]="tab.disabled"
                        [value]="tab.slug"
                      >
                        <div class="relative flex items-center">
                          {{ tab.label }}
                          @if (
                            tab.slug === "documents" &&
                            cyclopeService.missingProQuote.value()
                          ) {
                            <div
                              class="absolute -right-6 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                              aria-hidden="true"
                            >
                              1
                            </div>
                          }
                        </div>
                      </p-tab>
                    </span>
                  }
                }
              </p-tablist>

              <div class="relative max-h-full flex-1 overflow-y-auto">
                <p-tabpanels class="p-tabpanels--big absolute inset-0">
                  <p-tabpanel value="analysis">
                    <mkp-operation-analysis-pro
                      [(activeOperation)]="cyclopeService.activeOperation"
                      [(operationForBrief)]="operationForBrief"
                      [displayStatus]="cyclope.mode === CyclopeMode.BOUGHT_LEAD"
                      [isMissingProQuote]="
                        !!cyclopeService.missingProQuote.value()
                      "
                      [location]="locationValue ?? null"
                      [operationLead]="
                        cyclopeService.operationLead.value() ?? null
                      "
                    />
                  </p-tabpanel>

                  <p-tabpanel value="contacts">
                    <mkp-contacts-tab
                      [isInterested]="
                        cyclope.mode !== CyclopeMode.BUY_LEAD &&
                        cyclopeService.proIsInterested()
                      "
                      [isUnblocked]="
                        !!(
                          (cyclope.mode === CyclopeMode.PROSPECT &&
                            cyclopeService.proHasUnlockedLocation()) ||
                          cyclopeService.proHasAccessToOperation.value()
                        )
                      "
                      [locationType]="'optee'"
                    />
                  </p-tabpanel>

                  <p-tabpanel value="documents">
                    <div class="flex flex-col gap-8">
                      @if (
                        !cyclopeService.isInProspectMode(cyclope) &&
                        cyclopeService.proHasAccessToOperation.value()
                      ) {
                        <mkp-operation-documents
                          [displayFor]="proType"
                          [operationUuid]="cyclope.operationUuid"
                          [quoteUuidToUpload]="
                            cyclopeService.missingProQuote.value() ?? null
                          "
                        />
                      } @else {
                        <p class="py-3 text-lg font-medium text-gray-600">
                          Sélectionnez une opération pour voir les documents.
                        </p>
                      }
                    </div>
                  </p-tabpanel>
                </p-tabpanels>
              </div>
            </p-tabs>
          </oui-eve>

          <footer class="flex items-center justify-center gap-4">
            @if (!cyclopeService.proHasAccessToOperation.value()) {
              <span tooltipPosition="top" [pTooltip]="noContactsTooltip()">
                @if (
                  cyclope.mode === CyclopeMode.PROSPECT &&
                  !(
                    cyclopeService.proIsInterested() ||
                    cyclopeService.proHasUnlockedLocation()
                  )
                ) {
                  <!-- Access contact -->
                  <oui-button
                    class="ml-auto"
                    full
                    variant="primary"
                    (click)="
                      cyclopeService.onBuyLocationContact(
                        cyclope.locationUuid,
                        'optee'
                      )
                    "
                    [disabled]="!cyclopeService.locationHasContacts.value()"
                  >
                    Accéder aux contacts
                  </oui-button>
                } @else if (cyclope.mode === CyclopeMode.BUY_LEAD) {
                  <!-- Access project Btn -->
                  <oui-button
                    class="ml-auto"
                    full
                    variant="primary"
                    (click)="cyclopeService.onBuyLead()"
                    [disabled]="!cyclopeService.locationHasContacts.value()"
                  >
                    Accéder au projet
                  </oui-button>
                }
              </span>
            }
          </footer>
        </section>
      }
    } @else {
      <div class="m-6 flex flex-auto flex-col items-center gap-4">
        <oui-message
          severity="warn"
          summary="Erreur lors du chargement de l'outil de prospection :"
        >
          Un bâtiment doit être sélectionné pour afficher cette page.
        </oui-message>

        <oui-button (click)="goBack()">Retour</oui-button>
      </div>
    }
  `,
  imports: [
    ButtonComponent,
    TabsModule,
    LocationColumnComponent,
    FormsModule,
    EveComponent,
    NgxGpAutocompleteModule,
    IconChevronRightComponent,
    LocationSimulatorBriefComponent,
    OperationAnalysisProComponent,
    ContactsTabComponent,
    OperationDocumentsComponent,
    Tooltip,
    IconBookmarkComponent,
    IconSpinnerComponent,
    IconPaperPlaneComponent,
    MessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CyclopePage {
  protected readonly cyclopeService = inject(CyclopeService);

  protected readonly proType = UserType.PRO;
  protected readonly CONTACT_CONNECTION_COST = CONTACT_CONNECTION_COST_CYCLOPE;
  protected readonly CTA = CTA;
  protected readonly CyclopeMode = CyclopeMode;

  protected readonly sectionTitle = computed(() => {
    const mode = this.cyclopeService.activeCyclope()?.mode;
    const phase = this.cyclopeService.operationLead.value()?.phase?.enum;
    const isFromDtg = this.cyclopeService.operationLead.value()?.isFromDtg;
    const unsupportedMode = "Mode non supporté";

    if (!mode) {
      return unsupportedMode;
    }

    switch (mode) {
      case CyclopeMode.SIMULATE:
        return "Simulation";
      case CyclopeMode.PROSPECT:
      case CyclopeMode.BUY_LEAD:
        return phase && Operation.labelFromPhase(phase, isFromDtg ?? false);
      case CyclopeMode.BOUGHT_LEAD:
        return "Mon opération";
      default:
        return unsupportedMode;
    }
  });

  protected readonly operationForBrief = signal<OperationRow | null>(null);

  protected readonly tabs = computed(
    () =>
      [
        {
          slug: "analysis",
          label: "Analyse",
          disabled: false,
          disabledReason: undefined,
          visible: true,
        },
        {
          slug: "contacts",
          label: "Contacts",
          disabled: !this.cyclopeService.locationHasContacts.value(),
          disabledReason: this.noContactsTooltip(),
          visible: true,
        },
        {
          slug: "documents",
          label: "Documents",
          disabled:
            !this.cyclopeService.proHasUnlockedLocation() ||
            !this.cyclopeService.proHasAccessToOperation.value(),
          disabledReason: this.cyclopeService.proHasUnlockedLocation()
            ? "Vous n'avez pas accès à cette opération."
            : "Débloquez la fiche contact pour envoyer une offre au client.",
          visible:
            this.cyclopeService.activeCyclope()?.mode !==
              CyclopeMode.PROSPECT &&
            this.cyclopeService.locationHasContacts.value(),
        },
      ] as const,
  );

  protected readonly noContactsTooltip = computed(() =>
    !this.cyclopeService.locationHasContacts.value()
      ? "Pas de contact disponible pour cette adresse"
      : undefined,
  );

  protected readonly newProjectTooltip = computed(() => {
    if (
      !this.cyclopeService.proLocationAssociations.value() ||
      !this.cyclopeService.proLocationAssociations
        .value()
        ?.includes(PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label)
    ) {
      return "Veuillez débloquer la fiche contact pour créer un projet";
    }
    const contacts = this.cyclopeService.contacts.value();
    const contact = contacts?.data.contacts?.find((c) => !!c?.email);

    if (!contact?.email) {
      return "Le contact n'a pas d'adresse email renseignée";
    }
    return undefined;
  });

  protected readonly isLoadingContent = computed(
    () =>
      this.cyclopeService.location.isLoading() ||
      this.cyclopeService.locationHasContacts.isLoading() ||
      this.cyclopeService.proLocationAssociations.isLoading() ||
      this.cyclopeService.proHasAccessToOperation.isLoading() ||
      this.cyclopeService.operationLead.isLoading() ||
      this.cyclopeService.isInFavorites.isLoading() ||
      this.cyclopeService.clientUuid.isLoading(),
  );

  protected async goBack() {
    history.back();
    await sleep(300);
    this.cyclopeService.clearCyclope();
  }
}
