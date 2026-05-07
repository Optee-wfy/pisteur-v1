import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  resource,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import type { ClientUuid, LocationBdnbUuid } from "@optee/models";
import {
  isOpteeLocation,
  Location,
  locationBdnbSchema,
  LocationUuid,
  OperationRow,
  OperationUuid,
} from "@optee/models";

import { toSignal } from "@angular/core/rxjs-interop";
import type { OperationHubspotPrestationId } from "@optee/constants";
import {
  contactSupport,
  GET_NEW_LEAD_COST,
  GET_PLANNED_LEAD_COST,
  OPERATION_HUBSPOT_PRESTATION_IDS,
  OperationPhaseEnum,
  operationsEmail,
  PRO_LOCATION_ASSOCIATIONS,
  PRO_MARKETPLACE_PHASES_SHOULD_HAVE_QUOTES,
  tryAgainOrContactUs,
  UserType,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { ToastService } from "@optee/ui/services/toast.service";
import { combineLatest, map } from "rxjs";
import { z } from "zod";
import trpcClient from "../../trpc-client";
import { NewOperationByProComponent } from "../components/operation/new-operation-by-pro/new-operation-by-pro.component";
import { BuyContactDialogComponent } from "../components/pro/buy-contact/buy-contact.dialog";
import { AuthService } from "./auth.service";
import { LocalStorageService } from "./local-storage.service";
import { OperationService } from "./operation.service";
import { ProService } from "./pro.service";

export const cyclopeTabSchema = z.enum(["analysis", "contacts", "documents"]);
export type CyclopeTab = z.infer<typeof cyclopeTabSchema>;

export enum CyclopeMode {
  SIMULATE = "simulate",
  PROSPECT = "prospect",
  BUY_LEAD = "buy-lead",
  BOUGHT_LEAD = "bought-lead",
}

const prospectWithUuid = z.object({
  mode: z.literal(CyclopeMode.PROSPECT),
  locationUuid: LocationUuid,
  activeTab: cyclopeTabSchema.nullish(),
});

const addressDataSchema = z.object({
  streetNumber: z.string().optional(),
  streetName: z.string().optional(),
  zipcode: z.string(),
  city: z.string(),
});

const simulateLocation = z.object({
  mode: z.literal(CyclopeMode.SIMULATE),
  addressData: addressDataSchema,
  bdnbRes: locationBdnbSchema,
  operation: z.enum(OPERATION_HUBSPOT_PRESTATION_IDS),
  activeTab: cyclopeTabSchema.nullish(),
});

const buyOrBoughtLead = z.object({
  mode: z.enum([CyclopeMode.BUY_LEAD, CyclopeMode.BOUGHT_LEAD]),
  locationUuid: LocationUuid,
  operationUuid: OperationUuid,
  activeTab: cyclopeTabSchema.nullish(),
});

export const cyclopeSchema = z.discriminatedUnion("mode", [
  prospectWithUuid,
  simulateLocation,
  buyOrBoughtLead,
]);
export type Cyclope = z.infer<typeof cyclopeSchema>;

/**
 * Provides methods to fetch leads, managing operations, and handling pro-related functionalities.
 * **It is designed to be used within pro pages of the application** (injected in pro-layout).
 * Also used by OperationsGroupRowComponent to open Cyclope in "bought-lead" mode when on dashboard.
 */
@Injectable({ providedIn: "root" })
export class CyclopeService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly proService = inject(ProService);
  private readonly operationService = inject(OperationService);
  private readonly authService = inject(AuthService);

  private readonly localCyclopeKey = "cyclope::active";

  readonly activeCyclope = signal<Cyclope | null>(
    this.localStorageService.safeGet(this.localCyclopeKey, cyclopeSchema),
  );

  readonly activeTab = linkedSignal<CyclopeTab>(
    () => this.activeCyclope()?.activeTab ?? "analysis",
  );

  readonly activeOperation = linkedSignal<OperationHubspotPrestationId | null>(
    () => {
      const cyclope = this.activeCyclope();
      if (!cyclope || cyclope.mode !== CyclopeMode.SIMULATE) {
        return null;
      }
      return cyclope?.operation ?? null;
    },
  );

  readonly leadCost = computed(() => {
    const operationPhase = this.operationLead.value()?.phase?.enum;

    return operationPhase === OperationPhaseEnum.PROJECT_PHASE
      ? GET_PLANNED_LEAD_COST
      : GET_NEW_LEAD_COST;
  });

  readonly location = resource({
    params: () => this.activeCyclope(),
    loader: async ({ params: cyclope }) => {
      if (!cyclope) {
        return null;
      }
      try {
        switch (cyclope.mode) {
          case CyclopeMode.SIMULATE:
            return Location.init({
              uuid: "temp-uuid" as LocationUuid,
              ...cyclope.addressData,
              ...cyclope.bdnbRes,
              name: `${cyclope.addressData.streetNumber} ${cyclope.addressData.streetName}, ${cyclope.addressData.zipcode} ${cyclope.addressData.city}`,
            });
          case CyclopeMode.PROSPECT:
          case CyclopeMode.BUY_LEAD:
          case CyclopeMode.BOUGHT_LEAD: {
            const { hsLocation: location } =
              await trpcClient.locations.get.query({
                uuid: cyclope.locationUuid,
              });
            return Location.init(location);
          }
          default:
            throw new Error(`Mode non supporté ${contactSupport}`);
        }
      } catch (error) {
        this.toastService.openError("Chargement du bâtiment", error);
        return null;
      }
    },
  });

  readonly locationHasContacts = resource({
    params: () => {
      const locationUuid = this.location.value()?.uuid;
      const mode = this.activeCyclope()?.mode;
      if (!locationUuid || !mode) {
        return undefined;
      }
      return { mode, locationUuid };
    },
    loader: async ({ params }) => {
      if (!params || this.isSimulatedLocationUuid(params.locationUuid)) {
        return false;
      }

      return trpcClient.locations.hasContact.query({
        locationUuid: params.locationUuid,
        type: "optee",
      });
    },
  });

  readonly proLocationAssociations = resource({
    params: () => {
      const locationUuid = this.location.value()?.uuid;
      if (!locationUuid) {
        return undefined;
      }
      return { locationUuid, type: "optee" as const };
    },
    loader: async ({ params }) => {
      if (!params || this.isSimulatedLocationUuid(params.locationUuid)) {
        return [];
      }

      const proLocationAssociations =
        await trpcClient.locations.getAssociationsWithLocation.query({
          locationUuid: params.locationUuid,
          type: params.type,
        });

      if (!proLocationAssociations || proLocationAssociations.length === 0) {
        return [];
      }

      return proLocationAssociations;
    },
  });

  readonly proIsInterested = computed(() => {
    return (
      this.proLocationAssociations
        .value()
        ?.includes(PRO_LOCATION_ASSOCIATIONS.INTERESTED.label) ?? false
    );
  });

  readonly proHasUnlockedLocation = computed(() => {
    const unlocked =
      this.proLocationAssociations
        .value()
        ?.includes(PRO_LOCATION_ASSOCIATIONS.UNBLOCKED.label) ?? false;

    return unlocked;
  });

  readonly operationLead = resource({
    params: () =>
      this.location.value() && this.activeCyclope()
        ? {
            activeCyclope: this.activeCyclope(),
            location: this.location.value(),
          }
        : undefined,
    loader: async ({ params }) => {
      if (
        !params?.activeCyclope ||
        this.isInProspectMode(params.activeCyclope) ||
        !params.location ||
        !isOpteeLocation(params.location)
      ) {
        return undefined;
      }
      try {
        const res = await trpcClient.operations.get.query(
          params.activeCyclope.operationUuid,
        );

        if (!res || !res.hsOperation || !res.hsLocation) {
          throw new Error(`L'opération est incomplète. ${contactSupport}`);
        }

        return OperationRow.initWithAssociations({
          input: res.hsOperation,
          location: params.location,
          displayFor: UserType.PRO,
        });
      } catch (error) {
        this.toastService.openError("Chargement de l'opération.", error);
        return undefined;
      }
    },
  });

  readonly proHasAccessToOperation = resource({
    params: () => this.operationLead.value(),
    loader: async ({ params: operation }) => {
      if (!operation) {
        return false;
      }

      return trpcClient.pros.isProLinkedToOperation.query(operation.uuid);
    },
  });

  readonly isInFavorites = resource({
    params: () => this.location.value(),
    loader: async ({ params: location }) => {
      if (
        !location ||
        this.isSimulatedLocationUuid(location.uuid) ||
        !isOpteeLocation(location)
      ) {
        return false;
      }

      return trpcClient.pros.isLocationInFavorites
        .query(location.uuid)
        .catch((e) => {
          console.error("Failed to check if location is in favorites:", e);
          return false;
        });
    },
  });

  readonly clientUuid = resource({
    params: () => ({
      location: this.location.value(),
      proLocations: this.proLocationAssociations.value(),
    }),
    loader: async ({ params }) => {
      const { location, proLocations } = params;
      if (
        !proLocations ||
        !location ||
        this.isSimulatedLocationUuid(location.uuid) ||
        !isOpteeLocation(location)
      ) {
        return undefined;
      }

      return trpcClient.clients.getUuidByLocation.query(location.uuid);
    },
  });

  readonly proContact = toSignal(
    combineLatest([this.proService.pro$, this.authService.contact$]).pipe(
      map(([pro, contact]) => {
        return { contact, pro };
      }),
    ),
    { initialValue: null },
  );

  readonly contacts = resource({
    params: () => {
      const cyclope = this.activeCyclope();

      const isUnblocked = !!(
        (cyclope?.mode === CyclopeMode.PROSPECT &&
          this.proHasUnlockedLocation()) ||
        this.proHasAccessToOperation.value()
      );

      if (!cyclope || !isUnblocked || cyclope.mode === CyclopeMode.SIMULATE) {
        return undefined;
      }

      return cyclope;
    },
    loader: async ({ params }) => {
      if (!params) {
        return null;
      }
      try {
        return {
          type: "optee" as const,
          data: await trpcClient.clients.getSummaryCardFromLocation.query(
            params.locationUuid,
          ),
        };
      } catch (error) {
        this.toastService.openError("Récupération des contacts.", error);
        throw error;
      }
    },
  });

  // ici on a la liste des personnes morales (entreprises) liées au bâtiment, ça sera utile et à reprendre pour la page liste des entreprises
  // readonly legalEntities = resource({
  //   request: () => {
  //     const cyclope = this.activeCyclope();

  //     const isUnblocked = !!(
  //       (cyclope?.mode === CyclopeMode.PROSPECT_EXTERNAL &&
  //         this.proHasUnlockedLocation()) ||
  //       this.proHasAccessToOperation.value()
  //     );

  //     if (!cyclope || !isUnblocked) {
  //       return undefined;
  //     }

  //     return cyclope;
  //   },
  //   loader: async ({ request }) => {
  //     if (!request || request.mode !== CyclopeMode.PROSPECT_EXTERNAL) {
  //       return null;
  //     }
  //     try {
  //       return {
  //         data: await trpcClient.pros.getDataFromProspectExternal.query(
  //           request.locationUuid,
  //         ),
  //       };
  //     } catch (error) {
  //       this.toastService.openError("Récupération des contacts.", error);
  //       throw error;
  //     }
  //   },
  // });

  readonly prospectionMailUrl = computed(() => {
    const cyclope = this.activeCyclope();
    const proContact = this.proContact();
    const location = this.location.value();
    const contacts = this.contacts.value();
    const contact = contacts?.data.contacts?.find((c) => !!c?.email);

    if (
      !cyclope ||
      !this.isInProspectMode(cyclope) ||
      !contact ||
      this.contacts.isLoading()
    ) {
      return undefined;
    }

    const to = contact.email;

    if (!proContact?.contact || !proContact.pro || !location || !to) {
      return undefined;
    }

    return this.prospectionMailtoContent({
      to,
      location: {
        address: location.address,
        sector: location?.sectorLabel,
        surfaceThatRequiresHeating: location?.surfaceThatRequiresHeating,
        nbBuildings: location?.nbBuildings,
        nbUnits: location?.nbUnits,
      },
      pro: { name: proContact.pro.name },
      proContact: {
        firstName: proContact.contact.firstName,
        lastName: proContact.contact.lastName,
        phone: proContact.contact.phone,
      },
    });
  });

  readonly missingProQuote = resource({
    params: () => {
      const operation = this.operationLead.value();
      const hasAccess = this.proHasAccessToOperation.value();
      if (!operation || !hasAccess) {
        return undefined;
      }
      return {
        uuid: operation.uuid,
        phase: operation.phase.enum,
      } as const;
    },
    loader: async ({ params }) => {
      if (!params) {
        return null;
      }

      if (!PRO_MARKETPLACE_PHASES_SHOULD_HAVE_QUOTES.includes(params.phase)) {
        return null;
      }

      try {
        const quotes =
          await trpcClient.quotes.getAllByOperationAndProWithNullableNotes.query(
            { operationUuid: params.uuid },
          );
        return quotes.find((q) => q.noteUuid == null)?.quoteUuid ?? null;
      } catch (error) {
        this.toastService.openError("Chargement des devis", error);
        return null;
      }
    },
  });

  constructor() {
    // Sync localStorage with activeCyclope
    effect(() => {
      const cyclope = this.activeCyclope();
      try {
        if (cyclope) {
          this.localStorageService.set(this.localCyclopeKey, cyclope);
        } else {
          this.localStorageService.clear(this.localCyclopeKey);
        }
      } catch (error) {
        console.error(
          "🚩 Une erreur est survenue lors de la synchronisation de l'état de Cyclope dans localStorage: " +
            (error instanceof Error ? error.message : error),
        );
      }
    });
  }

  async openCyclope(activeCyclope: Cyclope) {
    this.activeCyclope.set(activeCyclope);
    // update route to the new legal entity details page
    await this.router.navigate(["/pro", "cyclope"]);
  }

  clearCyclope() {
    this.activeCyclope.set(null);
  }

  isInProspectMode(
    cyclope: Cyclope,
  ): cyclope is
    | z.infer<typeof prospectWithUuid>
    | z.infer<typeof simulateLocation> {
    return (
      cyclope.mode === CyclopeMode.PROSPECT ||
      cyclope.mode === CyclopeMode.SIMULATE
    );
  }

  prospectionMailtoContent(data: {
    to: string | string[]; // destinataire(s)
    location: {
      address: string;
      sector: string | null;
      surfaceThatRequiresHeating: number | null;
      nbBuildings: number | null;
      nbUnits: number | null;
    };
    pro: {
      name: string | null;
    };
    proContact: {
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
    };
  }) {
    const subject = `Échanges sur votre bâtiment – ${data.location.address}`;

    const body = [
      "Madame, Monsieur,\n",
      `Je me permets de vous contacter au sujet de votre bâtiment situé ${data.location.address} :`,
      data.location.sector ? `- Catégorie: ${data.location.sector}` : null,
      data.location.surfaceThatRequiresHeating
        ? `- Surface chauffée: ${data.location.surfaceThatRequiresHeating} m²`
        : null,
      data.location.nbBuildings || data.location.nbUnits
        ? `- Nombre de bâtiments / lots: ${data.location.nbBuildings ?? "NC"} / ${data.location.nbUnits ?? "NC"}`
        : null,
      `\nJe souhaiterais échanger avec vous sur d’éventuels projets qui pourraient être envisagés pour ce site.`,
      `Je reste à votre disposition pour en discuter par téléphone au ${data.proContact.phone ?? "[Numéro de tél]"} ou pour convenir d’un rendez-vous.`,
      "Bien cordialement,\n",
      `${data.proContact.firstName ?? "[Prénom]"} ${data.proContact.lastName ?? "[Nom]"}`,
      `${data.pro.name ?? "[Nom de la société]"}`,
      `${data.proContact.phone ?? "[Numéro de tél]"}`,
    ]
      .filter(Boolean)
      .join("\n");

    const to = Array.isArray(data.to) ? data.to.join(",") : (data.to ?? "");

    const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=${encodeURIComponent(operationsEmail)}`;

    return `mailto:${encodeURIComponent(to)}?${params}`;
  }

  async toggleFavorite() {
    try {
      const location = this.location.value();

      if (!location) {
        throw new Error("Aucun bâtiment trouvé pour ajouter aux favoris.");
      }

      if (!isOpteeLocation(location)) {
        throw new Error(
          "Cette fonctionnalité n'est disponible que pour les bâtiments Optee.",
        );
      }

      if (this.isInFavorites.value()) {
        await trpcClient.pros.removeLocationFromFavorites.mutate(location.uuid);
      } else {
        await trpcClient.pros.addLocationToFavorites.mutate(location.uuid);
      }

      this.isInFavorites.reload();
    } catch (error) {
      this.toastService.openError("Ajout aux favoris", error);
    }
  }

  private isSimulatedLocationUuid(uuid: string): boolean {
    return uuid.startsWith("temp-uuid");
  }

  async openNewOperationDialog(location: Location, clientUuid: ClientUuid) {
    try {
      if (!location || !clientUuid) {
        throw new Error(
          `Informations manquantes pour créer un projet. ${tryAgainOrContactUs}`,
        );
      }

      const { res } = await this.dialogService.open(
        NewOperationByProComponent,
        {
          data: {
            location,
            clientUuid,
            hsPrestationId: this.activeOperation(),
            redirectToDashboard: false,
            title: "Proposer un nouveau projet",
            description:
              "Déposez un devis pour démarrer un nouveau projet avec ce client. Un échange en amont pour bien cerner ses besoins augmente vos chances de conversion.",
          },
        },
      );
      if (!res) {
        return;
      }

      this.activeCyclope.set({
        mode: CyclopeMode.BOUGHT_LEAD,
        locationUuid: res.locationUuid,
        operationUuid: res.operationUuid,
      });
    } catch (error) {
      this.toastService.openError("Création d'un projet", error);
    }
  }

  createClientProject(
    location: Location | null | undefined,
    clientUuid: ClientUuid | null | undefined,
  ) {
    if (!location || !clientUuid || !isOpteeLocation(location)) {
      return;
    }
    this.openNewOperationDialog(location, clientUuid);
  }

  async onBuyLocationContact(
    locationUuid: LocationUuid | LocationBdnbUuid,
    type: "external" | "optee",
  ) {
    try {
      const bought = await this.buyLocationContact(locationUuid, type);
      if (!bought) {
        return;
      }
      this.proLocationAssociations.reload();
      this.activeTab.set("contacts");
    } catch (error) {
      this.toastService.openError("Achat de contact", error);
    }
  }

  async onBuyLead() {
    const cyclope = this.activeCyclope();
    if (!cyclope || cyclope?.mode !== CyclopeMode.BUY_LEAD) {
      return;
    }

    const boughtLead = await this.buyLead(this.leadCost());

    if (!boughtLead) {
      return;
    }

    this.operationLead.reload();
    this.proLocationAssociations.reload();
    this.proHasAccessToOperation.reload();
  }

  private async buyLead(cost: number) {
    const cyclope = this.activeCyclope();
    if (!cyclope || cyclope.mode !== CyclopeMode.BUY_LEAD) {
      return false;
    }
    try {
      const { res: confirmed } = await this.dialogService.open(
        BuyContactDialogComponent,
        {
          data: { cost },
        },
      );

      if (!confirmed) {
        return false;
      }

      await trpcClient.pros.getLead.mutate(cyclope.operationUuid);
      this.proService.refresh();
      this.operationService.refresh();
      this.activeCyclope.set({
        ...cyclope,
        mode: CyclopeMode.BOUGHT_LEAD,
      });
      return true;
    } catch (error) {
      this.toastService.openError("Positionnement sur l'opération", error);
      return false;
    }
  }

  private async buyLocationContact(
    locationUuid: LocationUuid | LocationBdnbUuid,
    type: "external" | "optee",
  ) {
    const description =
      type === "optee"
        ? "En validant votre intérêt, un agent Optee étudiera votre demande pour être mis en relation avec le client"
        : "En validant votre intérêt, vous serez crédité et obtiendrez les contacts du propriétaire, gestionnaire ou exploitant du bâtiment.";
    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "circle-plus",
          title: "Ce bâtiment vous intéresse ?",
          description,
        },
      },
    );

    if (!confirmed) {
      return false;
    }

    try {
      await trpcClient.locations.connectWithLocation.mutate({
        locationUuid,
        type,
      });

      if (type === "optee") {
        this.toastService.open(
          "success",
          "Demande de contact",
          "Votre demande a été envoyée. Un agent Optee vous contactera rapidement. Vous pouvez suivre l'état de votre demande dans votre tableau de bord.",
        );
      } else {
        this.proService.refresh();
      }
      return true;
    } catch (error) {
      this.toastService.openError("Demande de contact", error);
      return false;
    }
  }
}
