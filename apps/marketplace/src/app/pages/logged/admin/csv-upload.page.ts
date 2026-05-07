import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from "@angular/core";
import { DialogService } from "@optee/dialog";
import type { ContactUuid } from "@optee/models";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import type { FileDto } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { DropzoneComponent } from "@optee/ui/components/organisms/dropzone/dropzone.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { isNotNullish, normalize } from "@optee/utils";
import z from "zod";
import trpcClient from "../../../../trpc-client";
import { ContactsListComponent } from "../../../components/contacts/contacts-list.component";

import { LocationCreateFormDialogComponent } from "../../../components/location/location-form-dialog/location-create-form-dialog.component";
import { ClientService } from "../../../services/client.service";
import { CSVService } from "../../../services/csv/csv.service";

const CsvLocationSchema = z.object({
  streetNumber: z.string().optional().default(""),
  streetName: z.string().min(1, "Le nom de rue est obligatoire"),
  zipcode: z.string().optional().default(""),
  city: z.string().min(1, "La ville est obligatoire"),
  contactEmail: z
    .string()
    .email("L'email doit être valide")
    .min(1, "L'email de contact est obligatoire")
    .optional(),
});

type CsvLocationData = z.infer<typeof CsvLocationSchema>;

@Component({
  selector: "mkp-csv-upload",
  template: `
    <oui-eve class="flex flex-col gap-4">
      <h2 class="font-display text-primary-900 text-2xl font-semibold">
        <span class="text-primary-700">
          {{ (clientService.self$ | async)?.name }}
        </span>
        - Import de bâtiments
      </h2>

      <div class="text-sm text-gray-600">
        <p>Uploadez un fichier CSV avec les colonnes suivantes :</p>
        <ul class="mt-2 list-disc pl-10">
          <li><strong>streetNumber</strong></li>
          <li><strong>streetName</strong></li>
          <li><strong>zipcode</strong></li>
          <li><strong>city</strong></li>
          <li>
            <strong>contactEmail</strong>
            (optionnel. Si cette colonne est présente, elle sera utilisée pour
            associer le contact au bâtiment en tant que gestionnaire)
          </li>
        </ul>
      </div>

      <oui-dropzone
        showExtensions
        showMaxFileSize
        (filesChanged)="onFilesChanged($event)"
        [extensions]="['.csv']"
        [maxFileSize]="10"
      >
        <h3 class="mb-2 text-lg font-medium">Upload CSV de bâtiments</h3>
      </oui-dropzone>

      @if (errors().length > 0) {
        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 class="mb-2 font-medium text-red-800">Erreurs détectées :</h3>
          <ul class="text-sm text-red-700">
            @for (error of errors(); track $index) {
              <li>• {{ error }}</li>
            }
          </ul>
        </div>
      }

      @if (needsContactCreation()) {
        <mkp-contacts-list
          (contactCreated)="contactsExistence.reload()"
          [contactsInfo]="contactsInfo()"
        />
      } @else if (csvLocations().length > 0) {
        <table class="w-full">
          <thead
            class="font-display sticky top-0 z-10 bg-white text-left text-sm tracking-tight text-gray-600"
          >
            <tr>
              <th>Adresse CSV</th>
              <th></th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            @for (location of csvLocations(); track $index) {
              <tr class="border border-gray-300 align-middle">
                <td class="text-primary-900 p-4 text-sm font-semibold">
                  {{ location.csvAddress }}
                </td>
                <td class="text-primary-900 py-4 text-sm font-semibold">
                  @if (location.exists) {
                    @if (location.dbAddress) {
                      {{ location.dbAddress }}
                    } @else {
                      Déjà créé
                    }
                  } @else {
                    <oui-button
                      variant="primary"
                      (click)="
                        createLocationAndAssociate(
                          location.csvAddress,
                          location.contactUuid
                        )
                      "
                    >
                      @if (!!location.contactEmail) {
                        Créer et associer à...
                      } @else {
                        Créer sans l'associer
                      }
                    </oui-button>
                  }
                </td>
                <td class="p-4">
                  <div class="font-semibold">
                    {{ location.contactEmail }}
                  </div>
                  {{ location.contactUuid }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </oui-eve>
  `,
  imports: [
    AsyncPipe,
    EveComponent,
    DropzoneComponent,
    ButtonComponent,
    ContactsListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CsvUploadPageComponent {
  protected readonly csvService = inject(CSVService);
  protected readonly dialogService = inject(DialogService);
  protected readonly clientService = inject(ClientService);

  protected readonly csvData = signal<CsvLocationData[]>([]);
  protected readonly errors = signal<string[]>([]);

  // CONTACTS

  contactEmails = computed(() => {
    return Array.from(
      new Set(this.csvData().map((locationData) => locationData.contactEmail)),
    ).filter(isNotNullish);
  });

  contactsExistence = resource({
    params: () => this.contactEmails(),
    loader: async ({ params: emails }) => {
      const contactsExistence =
        await trpcClient.contacts.checkExistenceByEmails.query({
          emails,
        });

      return contactsExistence;
    },
  });

  contactsInfo = computed(() => {
    const contactsExistence = this.contactsExistence.value();

    if (!contactsExistence) {
      return [];
    }

    return contactsExistence.map((result) => ({
      email: result.email,
      exists: result.exists,
      contactUuid: result.contactUuid,
    }));
  });

  protected readonly needsContactCreation = computed(() => {
    return this.contactsInfo().some((c) => c.contactUuid === null);
  });

  // LOCATIONS

  protected readonly clientLocations = resource({
    loader: async () => {
      const client = await trpcClient.clients.getByLoggedUser.query();
      if (!client) {
        return [];
      }

      return trpcClient.locations.getAllByClientForAdmin.query({
        uuid: client.uuid,
      });
    },
  });

  csvLocations = computed(() => {
    const clientLocations = this.clientLocations.value();

    if (!clientLocations) {
      return [];
    }

    const contactsInfo = this.contactsInfo();

    return this.csvData().map((data) => {
      const csvNormalizedShortAddress = normalize(
        Location.makeShortAddress(data),
      );
      const csvNormalizedAddress = normalize(Location.makeAddress(data));

      const existingLocation = clientLocations.find(
        (l) =>
          normalize(Location.makeShortAddress(l)) ===
            csvNormalizedShortAddress ||
          normalize(l.sourceAddress) === csvNormalizedAddress,
      );

      return {
        csvAddress: Location.makeAddress(data),
        dbAddress: existingLocation
          ? Location.makeAddress(existingLocation)
          : null,
        exists: !!existingLocation,
        contactEmail: data.contactEmail,
        contactUuid: contactsInfo.find((c) => c.email === data.contactEmail)
          ?.contactUuid,
      };
    });
  });

  protected async onFilesChanged(files: FileDto[]) {
    const file = files[0];

    if (!file) {
      this.csvData.set([]);
      return;
    }

    await this.parseCsvFile(file);
  }

  private async parseCsvFile(fileDto: FileDto) {
    try {
      // Use CSVService to parse the file
      const csvData = await this.csvService.parse(fileDto.file);

      // Validate data with Zod schema like in simulated-location-generator
      const validatedData = z.array(CsvLocationSchema).parse(csvData);
      this.errors.set([]);
      this.csvData.set(validatedData);
    } catch (error) {
      this.errors.set([`Erreur lors de la validation du fichier: ${error}`]);
    }
  }

  protected async createLocationAndAssociate(
    csvAddress: string,
    contactUuid?: ContactUuid | null,
  ) {
    const { res: locationUuid } = await this.dialogService.open(
      LocationCreateFormDialogComponent,
      {
        data: {
          source: "Admin > CSV upload",
          mode: "create",
          sourceAddress: csvAddress,
        },
      },
    );

    if (locationUuid) {
      if (contactUuid) {
        await trpcClient.locations.makeContactAdmin.mutate({
          contactUuid,
          locationUuid,
        });
      }

      this.clientLocations.reload();
    }
  }
}
