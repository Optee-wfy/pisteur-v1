import { AsyncPipe, DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  LOCALE_ID,
  model,
  resource,
  signal,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import {
  AssociationProExternalContactType,
  buildAssetUrl,
  CONTACT_CONNECTION_COST,
  type OperationHubspotCategory,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconArrowComponent,
  IconChevronRightComponent,
  IconCompanyComponent,
  IconCrosshairComponent,
  IconFileComponent,
  IconInfoComponent,
  IconLightbulbComponent,
  IconMagicWandComponent,
  IconMailComponent,
  IconPhoneComponent,
  IconUsersComponent,
} from "@optee/icons";
import type { LocationBdnbUuid } from "@optee/models";
import {
  ExternalLocation,
  Location,
  LocationUuid,
  simulateOperationsFromLocation,
} from "@optee/models";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { PreviousNextButtonsComponent } from "@optee/ui/components/molecules/previous-next-buttons/previous-next-buttons.component";
import { DrawerComponent } from "@optee/ui/components/organisms/drawer/drawer.component";
import { FormatAddressPipe } from "@optee/ui/pipes/format-address.pipe";
import { ToastService } from "@optee/ui/services/toast.service";
import { formatFullName, removeNullishProps } from "@optee/utils";
import { combineLatest, map, shareReplay } from "rxjs";
import trpcClient from "../../../../../../trpc-client";
import type { OperationListColumn } from "../../../../../components/operation/operations-group-row/operations-group-row.component";
import { LegalEntityCardComponent } from "../../../../../feats/prospect/components/legal-entities/legal-entity-card/legal-entity-card.component";
import { PlacesNavigationService } from "../../../../../feats/prospect/services/places-navigation.service";
import { FullEnrichService } from "../../../../../services/fullenrich.service";
import { ProService } from "../../../../../services/pro.service";
import { TrackingService } from "../../../../../services/tracking.service";

import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { OperationsFilterComponent } from "@optee/ui/components/organisms/operations-filter/operations-filter.component";
import { OperationsGroupComponent } from "apps/marketplace/src/app/components/operation/operations-group/operations-group.component";
import { LeadDetailsCardComponent } from "apps/marketplace/src/app/feats/prospect/components/leads/lead-details-card.component";
import { ProspectionDialogComponent } from "apps/marketplace/src/app/feats/prospect/components/prospection-dialog/prospection-dialog.component";
import { PlaceInformationsTabComponent } from "../../../../../feats/prospect/components/places/place-informations-tab/place-informations-tab.component";
import { getBuildingUsageFromValue } from "../../../../../feats/prospect/components/places/place.constant";

type RecommendedContact = NonNullable<
  Awaited<ReturnType<typeof trpcClient.prospect.getLeadRecommendedContact.query>>
>;

@Component({
  selector: "mkp-lead-details-page",
  host: {
    class: "w-full bg-granite-50 h-screen  p-4 gap-4",
    "[class.!grid-rows-1]":
      "place.isLoading() || place.error() || hasAccessToPlace.isLoading() || hasAccessToPlace.error()",
  },
  template: `
    @if (place.isLoading()) {
      <oui-loader label="Chargement du bâtiment..." />
    } @else if (place.error() || hasAccessToPlace.error()) {
      <oui-message
        class="m-auto h-fit max-w-xl"
        severity="error"
        summary="Chargement du bâtiment"
      >
        {{
          place.error()?.message ??
            hasAccessToPlace.error()?.message ??
            "Une erreur est survenue lors du chargement du bâtiment. Si le problème persiste, contactez le support."
        }}
      </oui-message>
    } @else if (place.value(); as placeDetails) {
      <div
        class="grid gap-4 overflow-y-auto"
        style="height: calc(100vh - 104px)"
      >
        <!-- [class]="gridClass()" -->

        <section
          class="flex h-full min-w-[456px] flex-col gap-6 overflow-auto"
          style="flex: 3"
        >
          <div class="flex flex-col gap-4">
            <header
              class="shadow-o flex w-full flex-col gap-4 rounded-xl bg-white p-4 xl:flex-row"
            >
              <img
                class="w-full rounded-lg object-cover xl:max-w-[680px]"
                style="aspect-ratio: 16 / 9"
                [alt]="'Vue de ' + (placeDetails | formatAddress)"
                [src]="streetView()"
                [style.height.px]="streetViewHeight"
                [style.width.px]="streetViewWidth"
              />

              <div class="flex min-w-0 flex-1 flex-col gap-5 self-stretch">
                <div class="flex flex-wrap items-center gap-3">
                  <oui-previous-next-buttons
                    class="sm:ml-auto xl:ml-0"
                    (next)="goTo('next')"
                    (previous)="goTo('previous')"
                    [disabledNext]="!nextLocationUuid()"
                    [disabledPrevious]="!previousLocationUuid()"
                  />
                </div>

                <div class="flex flex-1 flex-col gap-3">
                  <h1
                    class="text-granite-900 min-w-0 text-2xl font-semibold leading-tight lg:text-4xl"
                  >
                    <span class="line-clamp-2 block">
                      {{ placeDetails | formatAddress }}
                    </span>
                  </h1>

                  <div
                    class="mt-auto grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
                  >
                    <mkp-lead-details-card
                      icon="dpe"
                      label="DPE"
                      variant="green"
                      [value]="placeDpeLabel() ?? 'NC'"
                    />

                    <mkp-lead-details-card
                      icon="surface"
                      label="Surface"
                      variant="green"
                      [suffix]="placeSurfaceArea() ? 'm²' : null"
                      [value]="
                        placeSurfaceArea()
                          ? ((placeSurfaceArea() | number: '1.0-0') ?? 'N/A')
                          : 'N/A'
                      "
                    />

                    <mkp-lead-details-card
                      icon="type"
                      label="Type"
                      variant="green"
                      [value]="placeBuildingUsage()?.label ?? 'N/A'"
                    />

                    <mkp-lead-details-card
                      icon="consumption"
                      label="Conso"
                      variant="gray"
                      [suffix]="
                        placeAnnualElectricityConsumption() ? 'kWh/an' : null
                      "
                      [value]="
                        placeAnnualElectricityConsumption()
                          ? ((placeAnnualElectricityConsumption()
                              | number: '1.0-0') ?? 'N/A')
                          : 'N/A'
                      "
                    />

                    <mkp-lead-details-card
                      icon="energy"
                      label="Énergie"
                      variant="gray"
                      [value]="placeEnergyType() ?? 'N/A'"
                    />
                  </div>
                  <button
                    class="flex w-full items-center gap-4 rounded-xl border border-green-400 bg-white px-2 py-2 text-left text-black transition-colors hover:bg-green-50"
                    type="button"
                    (click)="showSidebar.set(!showSidebar())"
                  >
                    <icon-file class="size-4 shrink-0" />
                    <span
                      class="font-display text-sm font-medium leading-tight"
                    >
                      Voir toutes les données techniques
                    </span>
                    <icon-chevron-right
                      class="ml-auto size-5 shrink-0 origin-center transition-transform duration-200"
                      [style.transform]="
                        showSidebar() ? 'rotate(-90deg)' : 'rotate(90deg)'
                      "
                    />
                  </button>
                </div>
              </div>
            </header>
          </div>

          <section
            class="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm"
          >
            <div class="flex items-center gap-4 rounded-xl px-2 py-2">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
              >
                <icon-magic-wand class="size-6 text-white" />
              </div>

              <div class="min-w-0 flex-1">
                <h2 class="text-lg font-semibold leading-tight text-slate-900">
                  Analyse IA - Synthèse du lead
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Arguments clés et opportunités identifiées
                </p>
              </div>
            </div>

            <div class="mt-3 flex flex-col gap-4">
              @if (recommendedContact.value(); as recommendedContact) {
                @let recommendedContactPhoneEnrichmentInProgress =
                  isRecommendedContactFieldEnriching(
                    recommendedContact.contact,
                    "phone"
                  );
                @let recommendedContactEmailEnrichmentInProgress =
                  isRecommendedContactFieldEnriching(
                    recommendedContact.contact,
                    "email"
                  );
                @let recommendedContactEnrichmentInProgress =
                  recommendedContactPhoneEnrichmentInProgress ||
                  recommendedContactEmailEnrichmentInProgress;
                <article
                  class="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600"
                    >
                      <icon-users class="size-4" />
                    </div>

                    <div class="min-w-0">
                      <h2 class="text-lg font-semibold text-purple-900">
                        Contact prioritaire recommandé
                      </h2>
                    </div>
                  </div>

                  <article
                    class="mt-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5"
                  >
                    <div class="flex flex-col gap-5">
                      <div class="min-w-0">
                        <h3 class="text-xl font-semibold text-slate-900">
                          {{
                            recommendedContactDisplayName(recommendedContact)
                          }}
                        </h3>

                        @if (recommendedContact.contact.role) {
                          <p class="mt-1 text-lg text-slate-600">
                            {{ recommendedContact.contact.role }}
                          </p>
                        }

                        @if (recommendedContact.legalEntities?.length) {
                          <p class="mt-2 text-base text-slate-500">
                            {{ recommendedContact.legalEntities?.[0]?.name }}
                          </p>
                        }

                        @if (recommendedContactEnrichmentInProgress) {
                          <p class="mt-3 text-sm font-medium text-purple-700">
                            Enrichissement du contact en cours...
                          </p>
                        }
                      </div>

                      <div class="grid gap-3 lg:grid-cols-2">
                        @if (recommendedContact.contact.phone) {
                          <a
                            class="flex min-h-12 items-center gap-3 rounded-xl border border-green-200 bg-white px-4 text-base font-semibold text-green-700 shadow-sm"
                            [href]="'tel:' + recommendedContact.contact.phone"
                          >
                            <icon-phone class="size-5 shrink-0" />
                            <span class="truncate">
                              {{ recommendedContact.contact.phone }}
                            </span>
                          </a>
                        } @else {
                          <div
                            class="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-400 shadow-sm"
                          >
                            <icon-phone class="size-5 shrink-0" />
                            @if (recommendedContactPhoneEnrichmentInProgress) {
                              <div class="flex min-w-0 flex-col">
                                <span class="truncate blur-sm select-none">
                                  06 00 00 00 00
                                </span>
                                <span class="text-xs font-medium text-slate-400">
                                  Enrichissement en cours
                                </span>
                              </div>
                            } @else {
                              <span class="truncate">
                                {{
                                  getRecommendedContactMissingLabel(
                                    recommendedContact,
                                    "phone"
                                  )
                                }}
                              </span>
                            }
                          </div>
                        }

                        @if (recommendedContact.contact.email) {
                          <a
                            class="flex min-h-12 items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 text-base font-semibold text-blue-700 shadow-sm"
                          >
                            <icon-mail class="size-5 shrink-0" />
                            <span class="truncate">
                              {{ recommendedContact.contact.email }}
                            </span>
                          </a>
                        } @else {
                          <div
                            class="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-400 shadow-sm"
                          >
                            <icon-mail class="size-5 shrink-0" />
                            @if (recommendedContactEmailEnrichmentInProgress) {
                              <div class="flex min-w-0 flex-col">
                                <span class="truncate blur-sm select-none">
                                  email@exemple.com
                                </span>
                                <span class="text-xs font-medium text-slate-400">
                                  Enrichissement en cours
                                </span>
                              </div>
                            } @else {
                              <span class="truncate">
                                {{
                                  getRecommendedContactMissingLabel(
                                    recommendedContact,
                                    "email"
                                  )
                                }}
                              </span>
                            }
                          </div>
                        }
                      </div>

                      <div class="grid gap-3 lg:grid-cols-2">
                        @if (recommendedContact.contact.phone) {
                          <a
                            class="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-green-600 px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                            [href]="'tel:' + recommendedContact.contact.phone"
                          >
                            <icon-phone class="size-5 shrink-0" />
                            <span>Appeler</span>
                          </a>
                        } @else {
                          <button
                            class="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-slate-200 px-4 text-base font-semibold text-slate-500 shadow-sm"
                            disabled
                            type="button"
                          >
                            <icon-phone class="size-5 shrink-0" />
                            <span>
                              {{
                                recommendedContactPhoneEnrichmentInProgress
                                  ? "Enrichissement..."
                                  : "Appeler"
                              }}
                            </span>
                          </button>
                        }

                        @if (recommendedContact.contact.email) {
                          <button
                            class="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                            type="button"
                            (click)="
                              openRecommendedContactProspection(
                                recommendedContact
                              )
                            "
                          >
                            <icon-mail class="size-5 shrink-0" />
                            <span>Envoyer un email</span>
                          </button>
                        } @else {
                          <button
                            class="flex min-h-12 items-center justify-center gap-3 rounded-xl bg-slate-200 px-4 text-base font-semibold text-slate-500 shadow-sm"
                            disabled
                            type="button"
                          >
                            <icon-mail class="size-5 shrink-0" />
                            <span>
                              {{
                                recommendedContactEmailEnrichmentInProgress
                                  ? "Enrichissement..."
                                  : "Envoyer un email"
                              }}
                            </span>
                          </button>
                        }
                      </div>
                    </div>
                  </article>
                </article>
              }

              <article
                class="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  class="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left"
                  type="button"
                  (click)="showAiSummary.set(!showAiSummary())"
                >
                  @if (!showAiSummary()) {
                    <div
                      class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
                    >
                      <icon-crosshair class="size-5" />
                    </div>

                    <div class="min-w-0 flex-1">
                      <h2 class="text-lg font-semibold text-slate-900">
                        Résumé rapide
                      </h2>
                      <p class="mt-1 text-sm text-slate-500">
                        Voir la synthèse de l'assistant IA pour ce lead
                      </p>
                    </div>
                  } @else {
                    <div class="flex-1"></div>
                  }

                  <icon-chevron-right
                    class="size-5 shrink-0 text-slate-700 transition-transform duration-200"
                    [style.transform]="
                      showAiSummary() ? 'rotate(-90deg)' : 'rotate(90deg)'
                    "
                  />
                </button>

                @if (showAiSummary()) {
                  <div class="flex flex-col gap-4 px-4 pb-4">
                    @if (leadInsights.isLoading()) {
                      <article
                        class="rounded-2xl bg-slate-50 px-7 py-6 shadow-sm"
                      >
                        <oui-loader label="Analyse du lead en cours..." />
                      </article>
                    } @else if (leadInsights.error()) {
                      <article
                        class="rounded-2xl bg-slate-50 px-7 py-6 shadow-sm"
                      >
                        <oui-message
                          severity="warn"
                          summary="Assistant indisponible"
                        >
                          {{
                            leadInsights.error()?.message ??
                              "Impossible de générer l'analyse de ce lead pour le moment."
                          }}
                        </oui-message>
                      </article>
                    } @else if (leadInsights.value(); as insights) {
                      <article
                        class="rounded-2xl bg-slate-50 px-7 py-6 shadow-sm"
                      >
                        <div class="flex items-start gap-5">
                          <div
                            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-400"
                          >
                            <icon-crosshair class="size-6" />
                          </div>

                          <div class="min-w-0 flex-1">
                            <h2
                              class="text-xl font-semibold leading-tight text-blue-900"
                            >
                              Pourquoi ce bâtiment correspond à vos critères
                            </h2>

                            <p
                              class="mt-4 text-[1rem] leading-[1.8] text-slate-700"
                              [innerHTML]="
                                getMatchingReasonsHtml(insights.matchingReasons)
                              "
                            ></p>
                          </div>
                        </div>
                      </article>

                      <article
                        class="rounded-2xl bg-slate-50 px-7 py-6 shadow-sm"
                      >
                        <div class="flex items-start gap-5">
                          <div
                            class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-500"
                          >
                            <icon-arrow class="size-5 -rotate-45" />
                          </div>

                          <div class="min-w-0 flex-1">
                            <h2
                              class="text-xl font-semibold leading-tight text-green-800"
                            >
                              Arguments clés à mettre en avant
                            </h2>

                            @if (insights.keyArguments.length) {
                              <div
                                class="mt-6 grid gap-x-10 gap-y-7 lg:grid-cols-2"
                              >
                                @for (
                                  item of insights.keyArguments;
                                  track item + $index
                                ) {
                                  @let parsedArgument = parseLeadArgument(item);
                                  <article class="flex items-start gap-4">
                                    <div
                                      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white shadow-sm"
                                    >
                                      {{ $index + 1 }}
                                    </div>

                                    <div class="min-w-0">
                                      <h3
                                        class="text-[1rem] font-semibold leading-tight text-slate-900"
                                      >
                                        {{ parsedArgument.title }}
                                      </h3>
                                      @if (parsedArgument.description) {
                                        <p
                                          class="mt-1 text-[0.9rem] leading-relaxed text-slate-600"
                                        >
                                          {{ parsedArgument.description }}
                                        </p>
                                      }
                                    </div>
                                  </article>
                                }
                              </div>
                            } @else {
                              <p
                                class="mt-5 text-[1rem] leading-relaxed text-slate-600"
                              >
                                Aucun argument clé n'a été identifié.
                              </p>
                            }
                          </div>
                        </div>
                      </article>
                    }
                  </div>
                }
              </article>
            </div>
          </section>

          <section
            class="shadow-o flex shrink flex-col gap-3 rounded-xl bg-white p-4"
            [class.flex-1]="!canShowLegalEntities()"
          >
            @let legalEntitiesAssociated = legalEntities.value() ?? [];
            @if (
              hasAccessToPlace.isLoading() ||
              (autoUnlockStatus() === "loading" && !hasAccessToPlace.value()) ||
              (canShowLegalEntities() && legalEntities.isLoading())
            ) {
              <oui-loader label="Vérification des accès..." />
            } @else if (hasAccessToPlace.error() || legalEntities.error()) {
              <oui-message
                class="max-w-xl"
                severity="error"
                summary="Récupération des entreprises associées"
              >
                Une erreur est survenue lors de la récupération des entreprises.
                Si le problème persiste, contactez le support.
                <br />
                {{
                  hasAccessToPlace.error()?.message ||
                    legalEntities.error()?.message
                }}
              </oui-message>
            } @else if (canShowLegalEntities()) {
              <div class="text-granite-900 flex w-full items-center gap-4">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-purple-600"
                >
                  <icon-company class="size-4 text-white" />
                </div>

                <h3 class="text-xl font-semibold">
                  Entreprise{{
                    legalEntitiesAssociated.length > 1 ? "s" : ""
                  }}
                  associée{{ legalEntitiesAssociated.length > 1 ? "s" : "" }}
                </h3>
                <span
                  class="flex min-w-10 items-center justify-center rounded-lg border border-gray-300 px-2 py-1 text-xl font-medium leading-none"
                >
                  {{ legalEntitiesAssociated.length }}
                </span>
              </div>

              <div class="flex flex-col gap-4">
                @for (
                  row of legalEntitiesAssociated;
                  track row.legalEntity.uuid
                ) {
                  @let legalEntity = row?.legalEntity;
                  @if (legalEntity) {
                    <mkp-legal-entity-card
                      [contactsTableSize]="showSidebar() ? 'small' : 'medium'"
                      [legalEntity]="legalEntity"
                      [nbRelatedLocations]="row?.nbRelatedLocations ?? 0"
                      [nbRelatedPros]="row?.nbRelatedPros ?? 0"
                      [selectable]="false"
                    />
                  } @else {
                    <oui-message
                      class="max-w-xl"
                      severity="error"
                      summary="Récupération de l'entreprise associée"
                    >
                      Une erreur est survenue lors de la récupération de
                      l'entreprise. Si le problème persiste, contactez le
                      support.
                    </oui-message>
                  }
                }
              </div>
            } @else if (autoUnlockStatus() === "failed") {
              <oui-message severity="warn" summary="Déblocage automatique">
                Le déblocage automatique des entreprises associées n'a pas
                abouti. Vous pouvez réessayer.
                <button
                  class="mt-3 inline-flex items-center rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm font-medium text-orange-900 transition-colors hover:bg-orange-50"
                  type="button"
                  (click)="retryAutoUnlock()"
                >
                  Réessayer
                </button>
              </oui-message>
            } @else {
              <oui-loader label="Déblocage automatique des entreprises..." />
            }
          </section>
          <oui-eve
            class="flex flex-col gap-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50"
          >
            <div class="flex items-center gap-4 px-2 py-1">
              <div
                class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              >
                <icon-lightbulb class="size-6" />
              </div>
              <div class="min-w-0">
                <h2 class="font-display text-xl font-semibold leading-none">
                  Opérations réalisables
                </h2>
                <p class="mt-2 text-xs leading-tight text-slate-600">
                  Plans d'action identifiés par l'algorithme Pisteur
                </p>
              </div>

              <div
                class="flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white"
              >
                {{ (operationsToOrder$ | async)?.length ?? 0 }}
              </div>
            </div>

            <oui-operations-filter
              hideCount
              mode="leads"
              [(activeOperationTypes)]="activeOperationTypes"
            />

            @if (operationsToOrder$ | async; as operations) {
              @if (operations.length > 0) {
                <mkp-operations-group
                  displayMode="leads"
                  hideActions
                  hideLaunchDate
                  hideTotal
                  preventSimulation
                  sortCriteria="score"
                  sortCriteriaDirection="desc"
                  [actions]="[]"
                  [operations]="operations"
                  [rowsPerPage]="10"
                  [visibleColumns]="visibleColumns"
                />
              } @else {
                <oui-message severity="info" styleMode="leads">
                  Aucune opération ne peut être simulée pour votre sélection de
                  sites. Si vous pensez qu’il s’agit d’une erreur et que vous
                  souhaitez lancer une opération de ce type, contactez notre
                  équipe pour obtenir de l'aide.
                </oui-message>
              }
            }
          </oui-eve>
        </section>
      </div>

      @if (showSidebar()) {
        <div
          class="fixed inset-0 z-50 flex justify-end bg-black/45"
          (click)="showSidebar.set(false)"
        >
          <oui-drawer
            (click)="$event.stopPropagation()"
            (closed)="showSidebar.set(false)"
          >
            <div class="flex flex-col gap-1" heading>
              <h2 class="text-2xl font-semibold leading-tight">
                Données techniques complètes
              </h2>
              <p class="text-sm text-gray-600">Vue détaillée du bâtiment.</p>
            </div>

            <div class="flex min-h-0 flex-1 overflow-y-auto pr-1">
              <mkp-place-informations-tab
                class="h-full flex-1 overflow-y-auto px-1 lg:px-2"
                compact
                displayMode="panel"
                variant="colored"
                [enedisOpen]="false"
                [place]="placeDetails"
                [solicitationCount]="solicitationCount()"
              />
            </div>
          </oui-drawer>
        </div>
      }
    }
  `,
  imports: [
    FormatAddressPipe,
    IconChevronRightComponent,
    IconCompanyComponent,
    IconFileComponent,
    LoaderComponent,
    DrawerComponent,
    LegalEntityCardComponent,
    PlaceInformationsTabComponent,
    PreviousNextButtonsComponent,
    MessageComponent,
    LeadDetailsCardComponent,
    AsyncPipe,
    DecimalPipe,
    EveComponent,
    IconArrowComponent,
    IconCrosshairComponent,
    IconMailComponent,
    IconInfoComponent,
    IconLightbulbComponent,
    IconMagicWandComponent,
    IconPhoneComponent,
    IconUsersComponent,
    OperationsFilterComponent,
    OperationsGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadDetailsPage {
  readonly uuid = input.required<LocationBdnbUuid>();

  private readonly locale = inject(LOCALE_ID);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly proService = inject(ProService);
  private readonly trackingService = inject(TrackingService);
  private readonly router = inject(Router);
  private readonly fullEnrichService = inject(FullEnrichService);
  private readonly navigationService = inject(PlacesNavigationService);
  private readonly recommendedContactEnrichmentAttemptedFor = signal<
    string | null
  >(null);
  private readonly recommendedContactEnrichmentAwaitingReload = signal(false);

  protected readonly CONTACT_CONNECTION_COST = CONTACT_CONNECTION_COST;
  protected readonly responsiveOptions = computed(() => {
    const showSidebar = this.showSidebar();
    return [
      {
        breakpoint: "1898px",
        numVisible: !showSidebar ? 4 : 3,
        numScroll: 1,
      },
      {
        breakpoint: "1628px",
        numVisible: !showSidebar ? 3 : 2,
        numScroll: 1,
      },
      {
        breakpoint: "1448px",
        numVisible: !showSidebar ? 2 : 1,
        numScroll: 1,
      },
      {
        breakpoint: "924px",
        numVisible: 1,
        numScroll: 1,
      },
    ];
  });

  protected readonly streetViewHeight = 266;
  protected readonly streetViewWidth = 472;

  protected readonly showSidebar = signal(false);
  protected readonly showAiSummary = signal(false);
  protected readonly solicitationCount = signal<number | null>(null);
  protected readonly autoUnlockStatus = signal<
    "idle" | "loading" | "success" | "failed"
  >("idle");

  protected readonly activeOperationTypes = model<
    OperationHubspotCategory[] | null
  >(null);

  protected readonly visibleColumns: OperationListColumn[] = [
    "score",
    "sortableCost",
    "sortableFunding",
    "sortableRemainingAmount",
    "estimatedEnergyImpact",
  ];

  protected readonly canAfford = computed(() => {
    const credits = this.proService.remainingCredits();
    return credits !== null && credits >= this.CONTACT_CONNECTION_COST;
  });

  private readonly simulatedPlace = computed(() => {
    const place = this.place.value();
    if (!place) {
      return null;
    }

    return Location.init({
      ...place,
      uuid: LocationUuid.parse(place.uuid),
      name: place.name ?? undefined,
      creationDate: place.creationDate?.toISOString() ?? undefined,
      exteriorWallInsulationType: undefined,
      lowerFloorInsulationType: undefined,
      upperFloorInsulationType: undefined,
      windowMaterialType: undefined,
      shutterType: undefined,
      id: null,
      nameContactOnSite: null,
      phoneContactOnSite: null,
    });
  });

  protected readonly operationsToOrder$ = combineLatest([
    toObservable(this.simulatedPlace),
    toObservable(this.activeOperationTypes),
  ]).pipe(
    map(([place, activeOperationTypes]) => {
      if (!place) {
        return [];
      }

      try {
        return simulateOperationsFromLocation(place, activeOperationTypes);
      } catch {
        return [];
      }
    }),
    shareReplay(1),
  );

  protected readonly hasAccessToPlace = resource({
    params: () => this.uuid(),
    loader: async ({ params }) => {
      if (!params) {
        return false;
      }
      const response =
        await trpcClient.pros.hasAccessToLocationBdnb.query(params);
      return response;
    },
  });

  protected readonly place = resource({
    params: () => this.uuid(),
    loader: async ({ params: uuid }) => {
      try {
        const res = await trpcClient.locationsBdnb.get.query(uuid);
        const location = res?.batiments_bdnb;
        if (!location) {
          throw new Error(
            "Ce bâtiment n'a pas été trouvé. Si le problème persiste, contactez le support.",
          );
        }
        this.solicitationCount.set(Number(res?.nbRelatedPros ?? 0));
        return ExternalLocation.init(location, res?.personnes_morales);
      } catch (error) {
        this.toastService.openError("Chargement du bâtiment.", error);
        throw error;
      }
    },
  });

  protected readonly prospectParameters = resource({
    params: () => true,
    loader: () => trpcClient.prospect.getProspectParameters.query(),
  });

  protected readonly recommendedContact = resource({
    params: () => this.uuid(),
    loader: async ({ params: locationBdnbUuid }) => {
      if (!locationBdnbUuid) {
        return null;
      }

      return trpcClient.prospect.getLeadRecommendedContact.query(
        locationBdnbUuid,
      );
    },
  });

  protected readonly leadInsights = resource({
    params: () => {
      const place = this.place.value();
      const filters = this.prospectParameters.value()?.filters;

      if (!place || !filters) {
        return undefined;
      }

      const cleanedFilters = removeNullishProps(filters) as Record<
        string,
        unknown
      >;
      const cleanedLead = removeNullishProps({
        ...place,
      }) as Record<string, unknown>;

      return {
        filters: cleanedFilters,
        lead: cleanedLead,
      };
    },
    loader: async ({ params }) => {
      if (!params) {
        return null;
      }

      try {
        return await trpcClient.prospect.getLeadDetailsInsights.mutate(params);
      } catch (error) {
        this.toastService.openError("Analyse du lead", error);
        throw error;
      }
    },
  });

  protected readonly streetView = computed(() => {
    const place = this.place.value();
    if (place?.streetViewUrl) {
      return place.streetViewUrl;
    }
    return buildAssetUrl("batiment.png");
  });

  protected placeBuildingUsage = computed(() => {
    const usageValue = this.place.value()?.buildingUsage;
    if (!usageValue) {
      return null;
    }
    return getBuildingUsageFromValue(usageValue);
  });

  protected placeSurfaceArea = computed(() => {
    const surfaceArea = this.place.value()?.surfaceArea;
    if (!surfaceArea) {
      return null;
    }
    return surfaceArea;
  });

  protected placeDpeLabel = computed(() => {
    const dpe = this.place.value()?.dpeAssessmentClass;
    if (!dpe) {
      return null;
    }
    return dpe;
  });

  protected placeAnnualElectricityConsumption = computed(() => {
    const annualElectricityConsumption =
      this.place.value()?.annualElectricityConsumption;
    if (!annualElectricityConsumption) {
      return null;
    }

    return annualElectricityConsumption;
  });

  protected placeEnergyType = computed(
    () => this.place.value()?.energyType ?? null,
  );

  protected getMatchingReasonsHtml(reasons: string[]) {
    if (!reasons.length) {
      return "Aucun élément saillant n'a été identifié.";
    }

    return reasons.join(" ");
  }

  protected parseLeadArgument(argument: string) {
    const [title, ...rest] = argument.split(":");
    const trimmedTitle = title?.trim() || argument.trim();
    const description = rest.join(":").trim();

    return {
      title: trimmedTitle,
      description: description.length ? description : null,
    };
  }

  protected getRecommendedContactMissingLabel(
    recommendedContact: RecommendedContact,
    type: "email" | "phone",
  ) {
    const contact = recommendedContact.contact;

    if (
      (type === "email" && contact.isMailUnavailableForFullEnrich) ||
      (type === "phone" && contact.isPhoneUnavailableForFullEnrich)
    ) {
      return "Non connu";
    }

    return "Non connu";
  }

  protected isRecommendedContactFieldEnriching(
    contact: RecommendedContact["contact"],
    type: "email" | "phone",
  ) {
    if (type === "email") {
      return (
        this.fullEnrichService.isContactEnriching(
          contact.uuid,
          AssociationProExternalContactType.MAIL,
        ) ||
        this.fullEnrichService.isContactEnriching(
          contact.uuid,
          AssociationProExternalContactType.BOTH,
        )
      );
    }

    return (
      this.fullEnrichService.isContactEnriching(
        contact.uuid,
        AssociationProExternalContactType.PHONE,
      ) ||
      this.fullEnrichService.isContactEnriching(
        contact.uuid,
        AssociationProExternalContactType.BOTH,
      )
    );
  }

  protected isRecommendedContactEnriching(
    contact: RecommendedContact["contact"],
  ) {
    return (
      this.isRecommendedContactFieldEnriching(contact, "email") ||
      this.isRecommendedContactFieldEnriching(contact, "phone")
    );
  }

  protected recommendedContactDisplayName(recommendedContact: RecommendedContact) {
    return (
      formatFullName({
        firstName: recommendedContact.contact.firstName ?? null,
        lastName: recommendedContact.contact.lastName ?? null,
      }) ||
      recommendedContact.contact.email ||
      recommendedContact.contact.phone ||
      "Contact recommande"
    );
  }

  private getRecommendedContactLegalEntity(recommendedContact: RecommendedContact) {
    const associatedLegalEntityUuids = new Set(
      (this.legalEntities.value() ?? []).map((row) => row.legalEntity.uuid),
    );

    return (
      recommendedContact.legalEntities?.find((legalEntity) =>
        associatedLegalEntityUuids.has(legalEntity.uuid),
      ) ?? recommendedContact.legalEntities?.[0]
    );
  }

  private getRecommendedContactEnrichmentType(
    recommendedContact: RecommendedContact,
  ): AssociationProExternalContactType | null {
    const contact = recommendedContact.contact;
    const shouldEnrichEmail =
      !(contact.email ?? "").trim() && !contact.isMailUnavailableForFullEnrich;
    const shouldEnrichPhone =
      !(contact.phone ?? "").trim() && !contact.isPhoneUnavailableForFullEnrich;

    if (shouldEnrichEmail && shouldEnrichPhone) {
      return AssociationProExternalContactType.BOTH;
    }

    if (shouldEnrichEmail) {
      return AssociationProExternalContactType.MAIL;
    }

    if (shouldEnrichPhone) {
      return AssociationProExternalContactType.PHONE;
    }

    return null;
  }

  private triggerRecommendedContactEnrichment(
    recommendedContact: RecommendedContact,
  ) {
    const type = this.getRecommendedContactEnrichmentType(recommendedContact);
    const legalEntity = this.getRecommendedContactLegalEntity(recommendedContact);

    if (!type || !legalEntity?.uuid) {
      return;
    }

    this.recommendedContactEnrichmentAttemptedFor.set(
      recommendedContact.contact.uuid,
    );
    this.recommendedContactEnrichmentAwaitingReload.set(true);
    this.fullEnrichService.enrichSingleContact({
      row: {
        contact: recommendedContact.contact,
        legalEntities: recommendedContact.legalEntities ?? undefined,
      },
      type,
      legalEntityUuid: legalEntity.uuid,
      legalEntityName: legalEntity.name ?? null,
    });
  }

  protected openRecommendedContactProspection(
    recommendedContact: RecommendedContact,
  ) {
    const legalEntityUuid = this.getRecommendedContactLegalEntity(
      recommendedContact,
    )?.uuid;
    const contactEmail = recommendedContact.contact.email;
    const locationBdnbUuid = this.uuid();

    if (!legalEntityUuid || !contactEmail || !locationBdnbUuid) {
      return;
    }

    this.dialogService.open(ProspectionDialogComponent, {
      data: {
        contact: {
          uuid: recommendedContact.contact.uuid,
          email: contactEmail,
        },
        legalEntityUuid,
        locationBdnbUuid,
      },
      disableClose: true,
    });
  }

  readonly nextLocationUuid = computed(() =>
    this.navigationService.nextLocation(this.uuid()),
  );

  readonly previousLocationUuid = computed(() =>
    this.navigationService.previousLocation(this.uuid()),
  );

  protected readonly gridClass = computed(() => {
    return this.showSidebar() && !this.place.isLoading()
      ? "grid-cols-[1fr,256px] lg:grid-cols-[1fr,356px] xl:grid-cols-[1fr,428px]"
      : "grid-cols-1";
  });

  protected readonly canShowLegalEntities = computed(
    () =>
      this.hasAccessToPlace.value() || this.autoUnlockStatus() === "success",
  );

  protected readonly legalEntities = resource({
    params: () => {
      if (
        !this.uuid() ||
        this.hasAccessToPlace.isLoading() ||
        !this.canShowLegalEntities()
      ) {
        return undefined;
      }
      return this.uuid();
    },
    loader: async ({ params: locationBdnbUuid }) => {
      try {
        if (!locationBdnbUuid) {
          return [];
        }
        return trpcClient.legalEntities.getAllByLocationBdnb.query(
          locationBdnbUuid,
        );
      } catch (error) {
        this.toastService.openError(
          "Chargement des entreprises associées.",
          error,
        );
        throw error;
      }
    },
  });

  private readonly resetAutoUnlockOnLocationChange = effect(() => {
    this.uuid();
    this.autoUnlockStatus.set("idle");
  });

  private readonly resetRecommendedContactEnrichmentOnLocationChange = effect(
    () => {
      this.uuid();
      this.recommendedContactEnrichmentAttemptedFor.set(null);
      this.recommendedContactEnrichmentAwaitingReload.set(false);
    },
  );

  private readonly autoEnrichRecommendedContact = effect(() => {
    const recommendedContact = this.recommendedContact.value();

    if (!recommendedContact || this.recommendedContact.status() !== "resolved") {
      return;
    }

    if (
      this.recommendedContactEnrichmentAttemptedFor() ===
      recommendedContact.contact.uuid
    ) {
      return;
    }

    if (this.isRecommendedContactEnriching(recommendedContact.contact)) {
      return;
    }

    if (!this.getRecommendedContactEnrichmentType(recommendedContact)) {
      return;
    }

    this.triggerRecommendedContactEnrichment(recommendedContact);
  });

  private readonly reloadRecommendedContactAfterEnrichment = effect(() => {
    const completedEnrichmentId =
      this.fullEnrichService.lastCompletedEnrichmentId();
    const recommendedContact = this.recommendedContact.value();
    const attemptedUuid = this.recommendedContactEnrichmentAttemptedFor();

    if (
      !completedEnrichmentId ||
      !recommendedContact ||
      !attemptedUuid ||
      !this.recommendedContactEnrichmentAwaitingReload()
    ) {
      return;
    }

    if (recommendedContact.contact.uuid !== attemptedUuid) {
      return;
    }

    if (this.isRecommendedContactEnriching(recommendedContact.contact)) {
      return;
    }

    this.recommendedContactEnrichmentAwaitingReload.set(false);
    void this.recommendedContact.reload();
  });

  private readonly autoUnlockLegalEntities = effect(() => {
    const uuid = this.uuid();
    const accessStatus = this.hasAccessToPlace.status();
    const hasAccess = this.hasAccessToPlace.value();

    if (
      !uuid ||
      accessStatus !== "resolved" ||
      hasAccess !== false ||
      this.autoUnlockStatus() !== "idle"
    ) {
      return;
    }

    this.autoUnlockStatus.set("loading");
    this.autoUnlockLocation(uuid);
  });

  protected readonly onSolicitationUnlocked = () => {
    this.hasAccessToPlace.reload();
    this.autoUnlockStatus.set("success");
    this.solicitationCount.update((count) => (count ?? 0) + 1);
  };

  protected async autoUnlockLocation(locationUuid: LocationBdnbUuid) {
    try {
      await trpcClient.locationsBdnb.autoConnectWithLocation.mutate(
        locationUuid,
      );
      await this.hasAccessToPlace.reload();

      if (this.hasAccessToPlace.value()) {
        this.autoUnlockStatus.set("success");
      } else {
        this.autoUnlockStatus.set("failed");
      }
    } catch (error) {
      this.autoUnlockStatus.set("failed");
      this.toastService.openError("Déblocage automatique", error);
    }
  }

  protected retryAutoUnlock() {
    const locationUuid = this.uuid();
    if (!locationUuid) {
      return;
    }

    this.autoUnlockStatus.set("loading");
    this.autoUnlockLocation(locationUuid);
  }

  protected async onBuyLocationContact(locationUuid: LocationBdnbUuid) {
    try {
      await trpcClient.locationsBdnb.connectWithLocation.mutate(locationUuid);

      this.trackingService.trackPro("pro_credits_consumed", {
        credits_used: this.CONTACT_CONNECTION_COST,
        type: "batiment",
        source_page: "batiment",
        entity_id: locationUuid,
        entity_name: this.place.value()?.address ?? "inconnu",
        action: "Déblocage entreprises associées (bâtiment)",
      });

      this.proService.refresh();
      await this.hasAccessToPlace.reload();
      this.autoUnlockStatus.set("success");

      return true;
    } catch (error) {
      this.autoUnlockStatus.set("failed");
      this.toastService.openError("Demande de contact", error);
      return false;
    }
  }

  protected goTo(direction: "next" | "previous") {
    const targetUuid =
      direction === "next"
        ? this.nextLocationUuid()
        : this.previousLocationUuid();
    if (targetUuid) {
      this.router.navigate(["/pro/pisteur/leads/details", targetUuid]);
    }
  }
}
