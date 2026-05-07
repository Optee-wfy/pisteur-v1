import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { OperationHubspotPrestationId } from "@optee/constants";
import { buildAssetUrl, OPERATION_TYPES_ARR } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { IconUploadComponent } from "@optee/icons";
import { LocationSimulatorSchema } from "@optee/models";
import type { RouterOutput } from "@optee/trpc-client";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { FileService } from "@optee/ui/services/file.service";
import { ToastService } from "@optee/ui/services/toast.service";
import { sleep } from "@optee/utils";
import { Select } from "primeng/select";
import { z } from "zod";
import trpcClient from "../../../../trpc-client";
import { CSVService } from "../../../services/csv/csv.service";
import { OperationTagComponent } from "../../operation/operation-tag/operation-tag.component";

@Component({
  selector: "mkp-location-simulation",
  template: `
    <op-dialog-wrapper (crossClick)="dialogRef.close(null)">
      <op-dialog-heading heading="Générateur de simulation">
        A partir d'un CSV, vous pouvez générer des simulations d'opérations sur
        des sites.
      </op-dialog-heading>

      @if (!loading()) {
        <p-select
          appendTo="body"
          filterBy="label"
          optionLabel="label"
          optionValue="hsPrestationId"
          placeholder="Sélectionner une opération"
          [(ngModel)]="selectedOperation"
          [filter]="true"
          [group]="true"
          [options]="operationsTypes"
        >
          <ng-template #group let-group>
            <mkp-operation-tag [operationType]="group" />
          </ng-template>
        </p-select>
        <oui-dropzone
          showExtensions
          (filesChanged)="upload($event)"
          [extensions]="['.csv']"
        >
          <icon-upload class="size-36" colorMode="colored" />
        </oui-dropzone>
        <hr />
        <p>
          NB: Voici un exemple de format de fichier attendu:
          <a
            class="text-primary-700 underline"
            download
            [href]="csvSimulatorMarketing"
          >
            fichier d'exemple
          </a>
        </p>
      } @else {
        <p class="text-center text-sm">
          Génération des simulations en cours, merci de ne pas fermer cette
          fenêtre.
        </p>
        <span
          class="bg-primary-200 text-primary-700 block rounded-lg p-4 text-center text-lg font-bold"
        >
          {{ simulationsRemaining() }} adresse(s) restante(s)
        </span>
        <p class="text-primary-400 text-center italic">
          Une fois terminé, un fichier CSV sera automatiquement téléchargé.
        </p>
      }
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    DialogHeadingComponent,
    DropzoneComponent,
    IconUploadComponent,
    Select,
    FormsModule,
    OperationTagComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatedLocationGeneratorComponent extends StronglyTypedDialog<
  null,
  null
> {
  protected readonly CSVService = inject(CSVService);
  protected readonly toastService = inject(ToastService);
  protected readonly fileService = inject(FileService);

  protected readonly loading = signal(false);
  protected readonly simulationsRemaining = signal(0);
  protected readonly selectedOperation =
    model<OperationHubspotPrestationId | null>(null);

  protected readonly operationsTypes = OPERATION_TYPES_ARR.map((ot) => ({
    ...ot,
    items: ot.subTypes,
  }));

  csvSimulatorMarketing = buildAssetUrl("csv/simulator-marketing.csv");

  async upload(files: FileDto[]) {
    const input = files[0];

    if (!input) {
      throw new Error("Aucun fichier sélectionné");
    }

    this.loading.set(true);

    try {
      const file = await this.CSVService.parse(input.file);
      const simulations = z.array(LocationSimulatorSchema).parse(file);
      this.simulationsRemaining.set(simulations.length);

      const updated: RouterOutput["simulator"]["create"][] = [];
      const selectedOperation = this.selectedOperation();

      for (const simulation of simulations) {
        const result = await trpcClient.simulator.create.mutate({
          locationToSimulate: simulation,
          selectedOperationId: selectedOperation,
        });
        this.simulationsRemaining.set(this.simulationsRemaining() - 1);
        await sleep(200);
        updated.push(result);
      }

      const blob = this.CSVService.arrayToCSV(updated);
      if (!blob) {
        throw new Error("Failed to generate CSV");
      }

      this.fileService.downloadFile(blob, "simulations.csv");
      this.loading.set(false);
      this.dialogRef.close(null);
    } catch (error) {
      this.loading.set(false);
      this.toastService.openError("Génération des simulations", error);
    }
  }
}
