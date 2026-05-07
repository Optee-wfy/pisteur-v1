import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";

import { AsyncPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import type { OperationHubspotPrestationId } from "@optee/constants";
import { CTA, getTypeByHubspotPrestationId } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogService,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconProjectComponent } from "@optee/icons";
import type { OperationRow } from "@optee/models";
import { Location } from "@optee/models";
import { FieldComponent } from "@optee/ui/components/molecules/form/field/field.component";
import { OptionCardComponent } from "@optee/ui/components/organisms/option-card/option-card.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { Select } from "primeng/select";
import { from, map, shareReplay } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AppService } from "../../../services/app.service";
import { OperationService } from "../../../services/operation.service";
import { DialogIntegrationOperationComponent } from "../dialog-integration-operation/dialog-integration-operation.component";
import { IconOperationLaunchComponent } from "../icon-operation-launch/icon-operation-launch.component";
import { IconOperationPlanComponent } from "../icon-operation-plan/icon-operation-plan.component";
import { LaunchOperationComponent } from "../launch-operation.component/launch-operation.component";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";

@Component({
  selector: "mkp-new-operation-by-client",
  template: `
    <op-dialog-wrapper
      class="!w-[680px]"
      showCircle
      variant="primary-100"
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
    >
      <op-dialog-heading [heading]="CTA.newOperation">
        <icon-project class="text-primary-700 size-10" iconSlot />

        Choisissez le mode de lancement
        <span class="font-semibold">adapté à votre besoin.</span>
      </op-dialog-heading>

      @if (!data.operation) {
        <div class="flex max-w-screen-sm flex-col gap-6">
          <oui-field name="location" label="Site concerné">
            <p-select
              appendTo="body"
              optionLabel="name"
              placeholder="Sélectionner"
              [(ngModel)]="location"
              [filter]="true"
              [options]="(availableLocations$ | async) ?? undefined"
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
      }

      <div class="relative flex flex-col gap-4 overflow-auto lg:flex-row">
        <oui-option-card
          class="flex-1"
          buttonVariant="primary"
          heading="Lancer maintenant"
          highlight
          subtitle="Recevez des devis en quelques jours via notre réseau certifié."
          (click)="launchOperation()"
          [buttonText]="CTA.launchCallForTender"
          [class]="invalidFormClasses()"
          [sellingPoints]="[
            'Brief auto-généré',
            'Mise en concurrence rapide',
            'Réception de devis sans délai',
          ]"
        >
          <mkp-icon-operation-launch class="text-primary-700 size-8" />
        </oui-option-card>

        <oui-option-card
          class="flex-1"
          buttonVariant="litePrimary"
          heading="Planifier pour plus tard"
          subtitle="Ajoutez cette opération à votre tableau de bord."
          (click)="addOperation()"
          [buttonText]="CTA.planThisOperation"
          [class]="invalidFormClasses()"
          [sellingPoints]="[
            'Modifiable à tout moment',
            'Aucun engagement immédiat',
            'Idéal pour préparer un plan',
          ]"
        >
          <mkp-icon-operation-plan class="text-primary-700 size-8" />
        </oui-option-card>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    OptionCardComponent,
    IconOperationPlanComponent,
    IconOperationLaunchComponent,
    DialogHeadingComponent,
    Select,
    IconProjectComponent,
    FormsModule,
    FieldComponent,
    OperationTagComponent,
    AsyncPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOperationByClientComponent extends StronglyTypedDialog<
  {
    operation: OperationRow | null;
  },
  void
> {
  protected readonly dialogService = inject(DialogService);
  protected readonly operationService = inject(OperationService);
  protected readonly toastService = inject(ToastService);
  protected readonly appService = inject(AppService);

  location = signal<Location | null>(this.data.operation?.location ?? null);
  hsPrestationId = signal<OperationHubspotPrestationId | null>(
    this.data.operation?.prestationId ?? null,
  );

  isFormValid = computed(() => {
    const hsPrestationId = this.hsPrestationId();
    const location = this.location();
    return !!hsPrestationId && !!location;
  });

  invalidFormClasses = computed(() => {
    return this.isFormValid() ? "" : "opacity-35 pointer-events-none";
  });

  protected readonly operationsTypes = computed(() => {
    const location = this.location();
    return location
      ? this.operationService.getCompatibleOperationsByLocation(location)
      : [];
  });

  CTA = CTA;

  availableLocations$ = from(trpcClient.locations.getAllForClient.query()).pipe(
    map((l) => l.map((l) => Location.init(l)).filter(isNotNullish)),
    shareReplay(1),
  );

  async launchOperation() {
    const hsPrestationId = this.hsPrestationId();
    const location = this.location();

    if (!hsPrestationId || !location) {
      return;
    }

    const canLaunch = await this.operationService.canLaunchOperation({
      hsPrestationId,
      locationUuid: location.uuid,
    });

    if (!canLaunch) {
      this.dialogRef.close();
      return;
    }

    const operationUuid = await this.operationService.createByClient({
      hsPrestationId,
      isFunding: false,
      locationUuid: location.uuid,
    });

    this.dialogRef.close();

    await this.dialogService.open(LaunchOperationComponent, {
      data: {
        operationUuid,
        locationUuid: location.uuid,
        contactOnSite: location.contactOnSite,
        hsPrestationId,
      },
    });
  }

  async addOperation() {
    const hsPrestationId = this.hsPrestationId();
    const location = this.location();

    if (!hsPrestationId || !location) {
      return;
    }

    const canLaunch = await this.operationService.canLaunchOperation({
      hsPrestationId,
      locationUuid: location.uuid,
    });

    this.dialogRef.close();

    if (!canLaunch) {
      return;
    }

    const typeInfo = getTypeByHubspotPrestationId(hsPrestationId);

    if (!typeInfo) {
      throw new Error(`Impossible de trouver l'opération: ${hsPrestationId}`);
    }

    await this.dialogService.open(DialogIntegrationOperationComponent, {
      data: {
        hsPrestationId,
        locationUuid: location.uuid,
        formattedSentence: typeInfo.formattedSentence,
      },
      disableClose: true,
    });
  }
}
