import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { form, submit, validateStandardSchema } from "@angular/forms/signals";
import { Router } from "@angular/router";
import type {
  LeadGeneratorForm,
  LocationBdnbLegalEntityFilterPro,
} from "@optee/constants";
import {
  buildEmployeeRangesFromNumberRange,
  buildLocationBuildingTypeCodes,
  getLocationBuildingTypeSelection,
  hasAllLocationBuildingTypesSelected,
  leadGeneratorSchema,
  LocationTypeNafCategoryEnum,
} from "@optee/constants";
import {
  IconBriefCaseComponent,
  IconBuildingComponent,
  IconChecklistComponent,
  IconCompanyComponent,
  IconCrosshairComponent,
} from "@optee/icons";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { removeNullishProps } from "@optee/utils";
import { MailCardComponent } from "apps/marketplace/src/app/components/account/mail-card/mail-card.component";
import { FiltersGroupComponent } from "apps/marketplace/src/app/feats/prospect/components/filters/filters-group/filters-group.component";
import { Skeleton } from "primeng/skeleton";
import { debounceTime } from "rxjs";
import trpcClient from "../../../../../../trpc-client";
import { AdvancedFiltersFormComponent } from "../../../../../feats/prospect/components/leads/advenced-filters-form.component";
import { LeadGenerationConfigurationComponent } from "../../../../../feats/prospect/components/leads/lead-generation-configuration.component";
import { LegalEntityTypeFormComponent } from "../../../../../feats/prospect/components/leads/legal-entity-type-form.component";
import { PlaceTypeFormComponent } from "../../../../../feats/prospect/components/leads/place-type-form.component";
import { PlacesParamsService } from "../../../../../feats/prospect/services/places-filters.service";
import { PlacesNavigationService } from "../../../../../feats/prospect/services/places-navigation.service";

type SavedProspectParameters = Awaited<
  ReturnType<typeof trpcClient.prospect.getProspectParameters.query>
>;

@Component({
  selector: "mkp-generate-leads-page",
  host: {
    class:
      "flex flex-col w-full max-h-full overflow-y-auto px-4 pb-4 pt-0 lg:px-8 lg:pb-8 lg:pt-0",
  },
  template: `
    @let count = matchingCount.value();
    @let buildingCount = count?.buildingCount ?? 0;
    @let companyCount = count?.companyCount ?? 0;
    @let unlockedLeadsCount = leadHistoryCount.value()?.total ?? 0;
    <div class="mb-4 flex flex-col gap-4">
      <section
        class="sticky top-0 isolate z-[200] grid gap-3 pt-3 backdrop-blur-sm xl:grid-cols-3"
      >
        <article
          class="rounded-[1.4rem] border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-md"
            >
              <icon-building class="size-6 text-white" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-blue-700">
                Bâtiments correspondants
              </p>
              <p class="text-3xl font-bold text-blue-900">
                @if (matchingCount.isLoading()) {
                  <p-skeleton class="inline-block h-9 w-20" />
                } @else {
                  {{ buildingCount | number: "1.0-0" }}
                }
              </p>
              <p class="mt-0.5 text-xs text-blue-700">
                Basé sur vos filtres actuels
              </p>
            </div>
          </div>
        </article>

        <article
          class="rounded-[1.4rem] border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 shadow-md"
            >
              <icon-company class="size-6 text-white" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-purple-700">
                Entreprises correspondantes
              </p>
              <p class="text-3xl font-bold text-purple-900">
                @if (matchingCount.isLoading()) {
                  <p-skeleton class="inline-block h-9 w-20" />
                } @else {
                  {{ companyCount | number: "1.0-0" }}
                }
              </p>
              <p class="mt-0.5 text-xs text-purple-700">
                Gestionnaires potentiels
              </p>
            </div>
          </div>
        </article>

        <article
          class="rounded-[1.4rem] border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-600 shadow-md"
            >
              <icon-crosshair class="size-6 text-white" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-green-700">
                Leads déjà obtenus
              </p>
              <p class="text-3xl font-bold text-green-900">
                {{ unlockedLeadsCount | number: "1.0-0" }}
              </p>
              <p class="mt-0.5 text-xs text-green-700">Dans votre CRM</p>
            </div>
          </div>
        </article>
      </section>

      <section
        class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 shadow-md"
      >
        <div
          class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm"
            >
              <icon-checklist class="size-4 text-white" />
            </div>

            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-white">Première visite ?</h3>
              <p class="text-xs text-blue-100">
                Découvrez comment générer vos premiers leads en 2 minutes
              </p>
            </div>
          </div>

          <a
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-blue-50"
            href="https://optee.io/demo"
            rel="noreferrer"
            target="_blank"
          >
            Demander une démo
          </a>
        </div>
      </section>

      <div class="flex flex-col gap-8">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <div class="flex flex-col gap-5">
            <div class="flex items-start gap-4">
              <div
                class="flex size-10 items-center justify-center rounded-2xl bg-green-100"
              >
                <icon-crosshair class="size-4 text-green-600" />
              </div>
              <div class="min-w-0">
                <h2 class="text-primary-900 text-base font-semibold md:text-[1.2rem]">
                  Définition de vos cibles marketing
                </h2>
                <p class="text-granite-400 mt-1 text-sm">
                  Affinez vos critères de ciblage pour obtenir les leads les plus
                  pertinents
                </p>
              </div>
            </div>

            <oui-divider-horizontal />

            <div class="flex flex-col gap-5">
              <h3 class="text-primary-900 text-lg font-semibold md:text-[1.15rem]">
                Type de bâtiment
              </h3>
              <p class="text-granite-400 -mt-2 text-sm">
                Sélectionnez un ou plusieurs types de bâtiments
              </p>
              <div class="flex flex-col gap-5">
                <mkp-place-type-form [form]="form.placeForm" />
                <mkp-filters-group colored="false" dropDown [isOpen]="true">
                  <span class="text-sm font-medium" heading>
                    Filtres avancés
                  </span>

                  @if (savedProspectParametersInitialized()) {
                    <mkp-advanced-filters-form
                      (applyFilters)="onAdvancedFiltersApply($event)"
                      (resetFilters)="onAdvancedFiltersReset($event)"
                      [filters]="advancedFilters()"
                      [visibleCategories]="marketingAdvancedVisibleCategories"
                    />
                  }
                </mkp-filters-group>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <div class="flex flex-col gap-5">
            <div class="flex items-start gap-4">
              <div
                class="flex size-10 items-center justify-center rounded-2xl bg-amber-100"
              >
                <icon-brief-case class="size-4 text-amber-700" />
              </div>
              <div class="min-w-0">
                <h2 class="text-primary-900 text-base font-semibold md:text-[1.2rem]">
                  Entreprise & Personnes
                </h2>
                <p class="text-granite-400 mt-1 text-sm">
                  Ciblez les entreprises et les contacts clés
                </p>
              </div>
            </div>

            <oui-divider-horizontal />

            <div class="flex flex-col gap-5">
              <h3 class="text-primary-900 text-lg font-semibold md:text-[1.15rem]">
                Type d'entreprise
              </h3>
              <p class="text-granite-400 -mt-2 text-sm">
                Sélectionnez un ou plusieurs types d'entreprises
              </p>
              <div class="flex flex-col gap-5">
                <mkp-legal-entity-type-form [form]="form.legalEntityForm" />
                @if (savedProspectParametersInitialized()) {
                  <mkp-filters-group colored="false" dropDown [isOpen]="true">
                    <span class="text-sm font-medium" heading>
                      Filtres avancés
                    </span>

                    <mkp-advanced-filters-form
                      (applyFilters)="onAdvancedFiltersApply($event)"
                      (resetFilters)="onAdvancedFiltersReset($event)"
                      [filters]="advancedFilters()"
                      [visibleCategories]="enterpriseAdvancedVisibleCategories"
                    />
                  </mkp-filters-group>
                }
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <mkp-mail-card />
      <mkp-lead-generation-configuration
        (frequencyChange)="generationFrequency.set($event)"
        (leadsToGenerateChange)="leadsToGenerate.set($event)"
        (recipientContactUuidChange)="recipientContactUuid.set($event)"
        (recipientEmailChange)="recipientEmail.set($event)"
        [frequency]="generationFrequency()"
        [leadsToGenerate]="leadsToGenerate()"
        [recipientContactUuid]="recipientContactUuid()"
        [recipientEmail]="recipientEmail()"
      />

      <!-- <button
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          type="button"
          (click)="navigateToResults('list')"
          [disabled]="redirectingToResults()"
        >
          Voir les résultats
        </button>

        <button
          class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          type="button"
          (click)="navigateToResults('lead')"
          [disabled]="redirectingToResults()"
        >
          Voir un lead
        </button> -->
      <div class="mr-14 flex justify-end">
        <button
          class="self-start rounded-lg bg-purple-600 px-4 py-2 text-base font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          type="button"
          (click)="navigateToResults('mail')"
          [disabled]="redirectingToResults()"
        >
          Lancer la génération de leads
        </button>
      </div>
    </div>
  `,
  imports: [
    PlaceTypeFormComponent,
    LegalEntityTypeFormComponent,
    AdvancedFiltersFormComponent,
    LeadGenerationConfigurationComponent,
    DividerHorizontalComponent,
    IconBriefCaseComponent,
    IconCrosshairComponent,
    IconBuildingComponent,
    IconChecklistComponent,
    IconCompanyComponent,
    FiltersGroupComponent,
    MailCardComponent,
    Skeleton,
    DecimalPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateLeadsPage {
  private readonly router = inject(Router);
  private readonly placesParamsService = inject(PlacesParamsService);
  private readonly navigationService = inject(PlacesNavigationService);
  private readonly toastService = inject(ToastService);

  protected readonly data = signal<LeadGeneratorForm>({
    placeForm: {
      buildingUsage: [],
      ownershipStructure: null,
      locationDepartment: [],
    },
    advancedForm: {
      creationDate: null,
      habitableSurfaceArea: null,
      nbStoreys: null,
      nbUnits: null,
      nbParkingSpots: null,
      glazingType: [],
      exteriorWallInsulationType: [],
      hasAirConditioning: null,
      dpe: [],
      energyType: [],
      annualElectricityConsumption: null,
      greenhouseGasEmissionsPerSquareMeter: null,
    },
    legalEntityForm: {
      types: [],
      nbLocations: null,
      nbEmployees: null,
    },
    technicalConstraintsForm: {
      energyType: [],
      annualElectricityConsumption: null,
      heatingSystem: [],
      dpe: [],
      nbUnits: null,
      nbParkingSpots: null,
      surfaceThatRequiresHeating: null,
      nbStoreys: null,
    },
  });

  protected readonly recipientEmail = signal("");
  protected readonly recipientContactUuid = signal<string | null>(null);
  protected readonly leadsToGenerate = signal(7);
  protected readonly generationFrequency = signal(3);

  protected readonly form = form(this.data, (form) => {
    validateStandardSchema(form, leadGeneratorSchema);
  });

  private readonly formValue = computed(() => this.form().value());

  protected readonly debouncedForm = toSignal(
    toObservable(this.formValue).pipe(debounceTime(1000)),
    { initialValue: this.formValue() },
  );

  protected readonly redirectingToResults = signal(false);

  protected readonly advancedFilters =
    signal<LocationBdnbLegalEntityFilterPro | null>(null);

  protected readonly marketingAdvancedVisibleCategories = [
    "localisation",
    "characteristics",
    "energyPerformance",
  ] as const;

  protected readonly enterpriseAdvancedVisibleCategories = [
    "entreprise",
    "externalContact",
  ] as const;

  protected readonly savedProspectParametersInitialized = signal(false);
  protected readonly savedProspectParameters = resource({
    params: () => true,
    loader: async () => {
      try {
        return await trpcClient.prospect.getProspectParameters.query();
      } catch (error) {
        this.toastService.openError(
          "Chargement de la configuration de prospection",
          error,
        );
        throw error;
      }
    },
  });

  protected readonly mergedFilters = computed(() =>
    this.buildMergedFilters(this.debouncedForm()),
  );

  protected readonly debouncedMergedFilters = toSignal(
    toObservable(this.mergedFilters).pipe(debounceTime(1000)),
    { initialValue: this.mergedFilters() },
  );

  protected readonly matchingCount = resource({
    params: () => this.debouncedMergedFilters(),
    loader: async ({ params: filters }) => {
      try {
        return await trpcClient.locationsBdnb.countMatchingLocations.mutate(
          filters,
        );
      } catch (error) {
        this.toastService.openError(
          "Calcul du nombre de correspondances",
          error,
        );
        throw error;
      }
    },
  });

  protected readonly leadHistoryCount = resource({
    params: () => true,
    loader: async ({ abortSignal }) => {
      try {
        return await trpcClient.locationsBdnb.getLeadHistoryPaginatedForPro.query(
          {
            page: 0,
            pageSize: 10,
          },
          { signal: abortSignal },
        );
      } catch (error) {
        this.toastService.openError("Chargement des leads déjà obtenus", error);
        throw error;
      }
    },
  });

  private readonly applySavedProspectParameters = effect(() => {
    if (this.savedProspectParametersInitialized()) {
      return;
    }

    if (this.savedProspectParameters.isLoading()) {
      return;
    }

    const savedProspectParameters = this.savedProspectParameters.value();
    if (savedProspectParameters) {
      this.applyProspectParameters(savedProspectParameters);
    }

    this.savedProspectParametersInitialized.set(true);
  });

  protected onAdvancedFiltersApply(
    filters: LocationBdnbLegalEntityFilterPro | null,
  ) {
    this.advancedFilters.set(filters);
  }

  protected onAdvancedFiltersReset(
    filters: LocationBdnbLegalEntityFilterPro | null,
  ) {
    this.advancedFilters.set(filters);
  }

  private buildMergedFilters(
    form: LeadGeneratorForm,
  ): LocationBdnbLegalEntityFilterPro {
    const baseFilters = this.mapFormToFilters(form);
    const advancedFilters = this.advancedFilters() ?? {};

    return removeNullishProps({
      ...baseFilters,
      ...advancedFilters,
      show: "new",
    });
  }

  private applyProspectParameters(
    parameters: NonNullable<SavedProspectParameters>,
  ) {
    this.data.update((current) => ({
      ...current,
      placeForm: {
        ...current.placeForm,
        buildingUsage: parameters.filters.buildingUsage ?? [],
      },
      legalEntityForm: {
        ...current.legalEntityForm,
        types: getLocationBuildingTypeSelection(
          parameters.filters.locationBuildingType ?? [],
        ).map((type) => LocationTypeNafCategoryEnum[type]),
      },
    }));
    this.advancedFilters.set(
      this.buildInitialAdvancedFilters(parameters.filters),
    );
    this.leadsToGenerate.set(parameters.leadsToGenerate);
    this.generationFrequency.set(parameters.sendFrequencyPerWeek);
    this.recipientContactUuid.set(parameters.recipientContactUuid);
    this.recipientEmail.set("");
  }

  private buildInitialAdvancedFilters(
    filters: LocationBdnbLegalEntityFilterPro,
  ): LocationBdnbLegalEntityFilterPro {
    const advancedFilters = { ...filters };

    delete advancedFilters.buildingUsage;
    delete advancedFilters.locationBuildingType;

    return advancedFilters;
  }

  protected readonly canNavigateToResults = computed(() => {
    const merged = this.mergedFilters();

    return Object.entries(merged).some(([key, value]) => {
      if (key === "show") {
        return false;
      }
      if (value === null || value === undefined) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === "object") {
        return Object.keys(value).length > 0;
      }
      return true;
    });
  });

  protected navigateToResults(mode: "lead" | "list" | "mail") {
    if (this.redirectingToResults()) {
      return;
    }

    submit(this.form, async (form) => {
      if (!this.canNavigateToResults()) {
        this.toastService.open(
          "warn",
          "Filtres manquants",
          "Sélectionnez au moins un filtre avant de lancer la génération de leads.",
        );
        return undefined;
      }
      try {
        this.redirectingToResults.set(true);
        const mappedFilters = this.buildMergedFilters(form().value());
        const queryInput = {
          ...mappedFilters,
          page: 0,
          pageSize: 100,
          sort: { sortBy: "random" as const, sortOrder: "asc" as const },
          show: "new" as const,
          legalEntityUuid: null,
        };

        this.placesParamsService.activeFilters.set(mappedFilters);

        if (mode === "mail") {
          if (!this.recipientContactUuid()) {
            this.redirectingToResults.set(false);
            this.toastService.open(
              "warn",
              "Contact de réception manquant",
              "Sélectionnez le contact qui doit recevoir les leads avant de lancer la génération.",
            );
            return undefined;
          }

          const savedProspectParameters =
            await trpcClient.prospect.addProspectParameters.mutate({
              ...queryInput,
              leadsToGenerate: this.leadsToGenerate(),
              recipientContactUuid: this.recipientContactUuid(),
              sendFrequencyPerWeek: this.generationFrequency(),
            });

          if (!savedProspectParameters) {
            throw new Error(
              "La sauvegarde des paramètres de prospection a échoué.",
            );
          }

          this.redirectingToResults.set(false);
          this.toastService.open(
            "success",
            "Alertes par mail activées",
            `Vos leads ont été enregistrés. ${this.leadsToGenerate()} lead(s) seront envoyés ${this.generationFrequency()} fois par semaine, selon votre configuration, et resteront accessibles dans le carnet d'adresses.`,
          );
          await this.router.navigate(["/pro/pisteur/address-book/leads"]);
          return undefined;
        }

        const places =
          await trpcClient.locationsBdnb.getAllPaginatedForPro.mutate(
            queryInput,
          );

        const placeUuids = places.items.map((place) => place.location.uuid);

        this.navigationService.queryContext.set({
          page: queryInput.page,
          pageSize: queryInput.pageSize,
          sort: queryInput.sort,
          show: queryInput.show,
          legalEntityUuid: queryInput.legalEntityUuid,
          filters: mappedFilters,
        });
        this.navigationService.locationsList.set(placeUuids);

        if (mode === "lead") {
          const destination = placeUuids[0];

          if (!destination) {
            this.redirectingToResults.set(false);
            this.toastService.open(
              "info",
              "Aucun résultat trouvé",
              "Aucun bâtiment ne correspond aux critères sélectionnés. Essayez de modifier les filtres pour trouver des correspondances.",
            );
            return undefined;
          }

          this.redirectingToResults.set(false);
          await this.router.navigate([
            "/pro/pisteur/places/details",
            destination,
          ]);
        } else {
          this.redirectingToResults.set(false);
          await this.router.navigate(["/pro/pisteur/places"]);
        }

        return undefined;
      } catch (error) {
        this.redirectingToResults.set(false);
        this.toastService.openError(
          "Navigation vers les résultats",
          "Une erreur est survenue lors de la navigation vers les résultats. Veuillez réessayer.",
        );
        throw error;
      }
    });
  }

  private mapFormToFilters(
    form: LeadGeneratorForm,
  ): LocationBdnbLegalEntityFilterPro {
    const {
      placeForm,
      advancedForm,
      legalEntityForm,
      technicalConstraintsForm,
    } = form;
    const shouldApplyLocationBuildingTypeFilter =
      !hasAllLocationBuildingTypesSelected(legalEntityForm.types);
    const energyType =
      advancedForm.energyType.length > 0
        ? advancedForm.energyType
        : technicalConstraintsForm.energyType;
    const dpe =
      (advancedForm.dpe?.length ?? 0) > 0
        ? advancedForm.dpe
        : technicalConstraintsForm.dpe;
    const annualElectricityConsumption =
      advancedForm.annualElectricityConsumption ??
      technicalConstraintsForm.annualElectricityConsumption;
    const nbUnits = advancedForm.nbUnits ?? technicalConstraintsForm.nbUnits;
    const nbParkingSpots =
      advancedForm.nbParkingSpots ?? technicalConstraintsForm.nbParkingSpots;
    const nbStoreys =
      advancedForm.nbStoreys ?? technicalConstraintsForm.nbStoreys;

    return removeNullishProps({
      buildingUsage: placeForm.buildingUsage,
      locationDepartment: placeForm.locationDepartment,
      nbLegalEntitiesPerLocation: placeForm.ownershipStructure
        ? placeForm.ownershipStructure === "multiple"
          ? ([2, 1000] as [number, number])
          : ([1, 1] as [number, number])
        : null,

      nbEmployeesRange: buildEmployeeRangesFromNumberRange(
        legalEntityForm.nbEmployees,
      ),
      locationBuildingType: shouldApplyLocationBuildingTypeFilter
        ? buildLocationBuildingTypeCodes(legalEntityForm.types)
        : null,
      nbRelatedLocations: legalEntityForm.nbLocations,

      creationDate: advancedForm.creationDate,
      habitableSurfaceArea: advancedForm.habitableSurfaceArea,
      glazingType: advancedForm.glazingType,
      exteriorWallInsulationType: advancedForm.exteriorWallInsulationType,
      hasAirConditioning: advancedForm.hasAirConditioning,
      greenhouseGasEmissionsPerSquareMeter:
        advancedForm.greenhouseGasEmissionsPerSquareMeter,
      energyType,
      annualElectricityConsumption,
      heatingSystem: technicalConstraintsForm.heatingSystem,
      dpe: dpe ?? [],
      nbUnits,
      nbParkingSpots,
      surfaceThatRequiresHeating:
        technicalConstraintsForm.surfaceThatRequiresHeating,
      nbStoreys,
      show: "new",
    });
  }
}
