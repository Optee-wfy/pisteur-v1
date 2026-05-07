import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type { OperationHubspotPrestationId } from "@optee/constants";
import { CTA } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconEnveloppeComponent } from "@optee/icons";
import type {
  ClientUuid,
  ContactUuid,
  LocationUuid,
  OperationUuid,
} from "@optee/models";
import { Location } from "@optee/models";
import type { AppRouter } from "@optee/trpc-client";
import { FieldComponent } from "@optee/ui/components/molecules/form/field/field.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import type { inferProcedureInput } from "@trpc/server";
import { Select } from "primeng/select";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { OperationService } from "../../../services/operation.service";
import { ProService } from "../../../services/pro.service";
import { DropboxComponent } from "../../dropbox/dropbox.component";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";
@Component({
  selector: "mkp-new-operation-by-pro",
  template: `
    <op-dialog-wrapper
      class="!w-[680px] overflow-scroll"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
    >
      <op-dialog-heading
        [heading]="data.title ?? 'Créer un nouveau projet pour un client'"
      >
        <icon-enveloppe class="text-primary-500 size-10" iconSlot />

        <span>
          {{
            data.description ??
              "Accélérez la mise en œuvre d’un projet en déposant directement un devis pour l’un de vos clients existants."
          }}
        </span>
      </op-dialog-heading>

      <div class="flex max-w-screen-sm flex-col gap-6">
        @if (!data.location) {
          <oui-field name="client" label="Client">
            <p-select
              appendTo="body"
              optionLabel="name"
              optionValue="uuid"
              placeholder="Sélectionner"
              [(ngModel)]="clientUuid"
              [disabled]="
                proService.availableClients().length === 0 || !!data.clientUuid
              "
              [filter]="true"
              [options]="proService.availableClients()"
            />
          </oui-field>

          <oui-field name="location" label="Site concerné">
            <p-select
              appendTo="body"
              optionLabel="name"
              placeholder="Sélectionner"
              [(ngModel)]="location"
              [disabled]="locationOptions().length === 0 || !!data.location"
              [filter]="true"
              [options]="locationOptions()"
            >
              <ng-template #item let-option>
                <div class="flex flex-col gap-1">
                  <p>{{ option.name }}</p>
                  <span class="text-xs text-gray-600">
                    {{ option.streetNumber }}
                    {{ option.streetName }}, {{ option.zipcode }}
                    {{ option.city }}
                  </span>
                </div>
              </ng-template>
            </p-select>
          </oui-field>
        }

        <oui-field
          name="hsPrestationId"
          label="Type d'opération"
          optionLabel="name"
        >
          <p-select
            appendTo="body"
            filterBy="label"
            optionLabel="label"
            optionValue="hsPrestationId"
            placeholder="Sélectionner une opération"
            [(ngModel)]="hsPrestationId"
            [disabled]="operationsTypes().length === 0"
            [filter]="true"
            [group]="true"
            [options]="operationsTypes()"
          >
            <ng-template #group let-group>
              <mkp-operation-tag [operationType]="group" />
            </ng-template>
          </p-select>
        </oui-field>
      </div>

      <mkp-dropbox
        class="max-w-screen-lg flex-1"
        heading="Informations devis"
        muteUploadNotification
        (dataSubmitted)="createOperation($event)"
        (signatorySelected)="signatoryUuid.set($event)"
        [clientUuid]="clientUuid()"
        [locationUuid]="location()?.uuid ?? null"
        [optionalFields]="['signatories']"
      />
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    Select,
    FormsModule,
    FieldComponent,
    OperationTagComponent,
    IconEnveloppeComponent,
    DropboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOperationByProComponent extends StronglyTypedDialog<
  {
    location?: Location | null;
    clientUuid?: ClientUuid | null;
    hsPrestationId?: OperationHubspotPrestationId | null;
    redirectToDashboard: boolean;
    title?: string;
    description?: string;
  },
  {
    locationUuid: LocationUuid;
    operationUuid: OperationUuid;
  }
> {
  private readonly router = inject(Router);
  protected readonly operationService = inject(OperationService);
  protected readonly proService = inject(ProService);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  protected readonly CTA = CTA;

  protected readonly location = signal<Location | null>(
    this.data?.location ?? null,
  );

  protected readonly hsPrestationId =
    signal<OperationHubspotPrestationId | null>(
      this.data?.hsPrestationId ?? null,
    );

  protected readonly clientUuid = signal<ClientUuid | null>(
    this.data?.clientUuid ?? null,
  );

  protected readonly signatoryUuid = signal<ContactUuid | null>(null);

  protected readonly operationsTypes = computed(() => {
    const location = this.location();
    return location
      ? this.operationService.getCompatibleOperationsByLocation(location)
      : [];
  });

  protected readonly locationOptions = computed(() => {
    const rows = this.proService.clientsAndLocationsByPro();
    const clientUuid = this.clientUuid();

    if (!clientUuid || !rows || rows.length === 0) {
      return [];
    }

    const locationSet = new Set<LocationUuid>();

    return rows
      .filter((row) => row.client.uuid === clientUuid)
      .map((row) => Location.init(row.location))
      .filter(isNotNullish)
      .filter((loc) => {
        if (locationSet.has(loc.uuid)) {
          return false;
        }
        locationSet.add(loc.uuid);
        return true;
      });
  });

  async createOperation(
    data: inferProcedureInput<
      AppRouter["pros"]["createClientProject"]
    >["quoteInformation"],
  ) {
    const contextMessage = "Création d'un projet client";
    const hsPrestationId = this.hsPrestationId();
    const locationUuid =
      this.location()?.uuid ?? this.data.location?.uuid ?? null;
    const signatoryUuid = this.signatoryUuid();

    try {
      if (!hsPrestationId || !locationUuid || !signatoryUuid) {
        throw new Error("Merci de renseigner tous les champs");
      }

      this.modalFadedOut.set(true);

      this.appService.isLoading.set(true);
      const operationUuid = await trpcClient.pros.createClientProject.mutate({
        hsPrestationId,
        locationUuid,
        signatoryUuid,
        quoteInformation: data,
      });
      this.toastService.open(
        "success",
        contextMessage,
        "Projet créé avec succès !",
      );
      this.operationService.refresh();
      if (this.data.redirectToDashboard) {
        this.router.navigate(["/pro/dashboard"]);
      }

      this.dialogRef.close({
        locationUuid: locationUuid,
        operationUuid,
      });
    } catch (error) {
      this.modalFadedOut.set(false);
      this.toastService.openError(contextMessage, error);
    } finally {
      this.appService.isLoading.set(false);
    }
  }
}
