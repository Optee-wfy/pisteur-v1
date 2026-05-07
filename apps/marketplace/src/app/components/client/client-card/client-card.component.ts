import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { ClientType } from "@optee/constants";
import { IconInfoComponent, IconUserComponent } from "@optee/icons";

export type ClientDisplayedData = {
  client: {
    name: string | null;
    siret: string | null;
    accountType: ClientType | null;
    address: string | null;
    phone: string | null;
  };
  contacts: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    jobTitle: string | null;
  }[];
};
@Component({
  selector: "mkp-client-card",
  host: { class: "flex flex-col gap-8" },
  template: `
    <!-- Block entreprise -->
    <div
      class="bg-primary-100 flex flex-col gap-6 rounded-xl px-6 py-8 sm:px-12"
    >
      <h2 class="text-xl font-bold">Entreprise</h2>

      <div class="flex flex-wrap items-start justify-start gap-8">
        @if (data(); as data) {
          <div class="flex items-center gap-4">
            <icon-info class="text-primary-700 size-10" colorMode="current" />
            <div class="flex flex-col items-start justify-start gap-2">
              <h3 class="font-semibold">
                {{
                  data.client.name?.toLocaleUpperCase() ?? "Entreprise sans nom"
                }}
              </h3>
              <span>{{ data.client.address ?? "Adresse inconnue" }}</span>
            </div>
          </div>

          <div class="flex flex-col items-start justify-start gap-2">
            <span class="text-gray-600">Type</span>

            <span class="max-w-48">
              {{ data.client.accountType ?? "NC" }}
            </span>
          </div>

          <div class="flex flex-col items-start justify-start gap-2">
            <span class="text-gray-600">Siret</span>

            <span>{{ data.client.siret ?? "NC" }}</span>
          </div>

          <div class="flex flex-col items-start justify-start gap-2">
            <span class="text-gray-600">Téléphone</span>

            <span>{{ data.client.phone ?? "NC" }}</span>
          </div>
        } @else {
          <ng-container *ngTemplateOutlet="noClient" />
        }
      </div>
    </div>

    <div class="flex flex-col gap-6 sm:mx-6">
      <h2 class="text-xl font-bold">Contacts</h2>
      <!-- Block administrators -->
      <table>
        <thead>
          <tr class="text-gray-600">
            <td></td>
            <td>Nom</td>
            <td>Poste</td>
            <td>Mail</td>
            <td>Téléphone</td>
          </tr>
        </thead>
        <tbody>
          @if (data(); as data) {
            @for (contact of data.contacts; track contact.email ?? $index) {
              <tr class="py-2">
                <td>
                  <icon-user
                    class="ml-2 size-6 text-gray-600"
                    colorMode="current"
                  />
                </td>
                <td>
                  <span class="font-semibold">
                    {{ contact.firstName }} {{ contact.lastName }}
                  </span>
                </td>
                <td>
                  {{ contact.jobTitle ?? "NC" }}
                </td>
                <td class="text-primary select-all underline">
                  {{ contact.email ?? "NC" }}
                </td>
                <td class="select-all">
                  {{ contact.phone ?? "NC" }}
                </td>
              </tr>
            }
          } @else {
            <ng-container *ngTemplateOutlet="noContacts" />
          }
        </tbody>
      </table>
    </div>

    <ng-template #noClient>
      <div class="flex items-center gap-4">
        <icon-info class="text-primary-700 size-10" colorMode="current" />
        <div class="flex flex-col items-start justify-start gap-2 blur-sm">
          <h3 class="font-semibold">Entreprise sans nom</h3>
          <span>Adresse inconnue</span>
        </div>
      </div>

      <div class="flex flex-col items-start justify-start gap-2">
        <span class="text-gray-600">Type</span>

        <span class="max-w-48 blur-sm">NC</span>
      </div>

      <div class="flex flex-col items-start justify-start gap-2">
        <span class="text-gray-600">Siret</span>

        <span class="blur-sm">NC</span>
      </div>

      <div class="flex flex-col items-start justify-start gap-2">
        <span class="text-gray-600">Téléphone</span>

        <span class="blur-sm">NC</span>
      </div>
    </ng-template>

    <ng-template #noContacts>
      <tr class="py-2">
        <td>
          <icon-user class="ml-2 size-6 text-gray-600" colorMode="current" />
        </td>
        <td>
          <span class="font-semibold blur-sm">Nom Prénom</span>
        </td>
        <td>
          <span class="blur-sm">poste</span>
        </td>
        <td class="text-primary select-all underline">
          <span class="blur-sm">email&#64;exemple.com</span>
        </td>
        <td class="select-all">
          <span class="blur-sm">0102030405</span>
        </td>
      </tr>
    </ng-template>
  `,
  styles: `
    :host tbody td {
      padding-block: 0.5rem;
    }
    :host tbody tr:nth-child(even) {
      background-color: var(--p-primary-200);
    }
  `,
  imports: [IconUserComponent, IconInfoComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCardComponent {
  readonly data = input.required<ClientDisplayedData | null>();
}
