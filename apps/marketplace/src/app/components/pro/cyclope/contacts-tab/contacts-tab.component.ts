import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import {
  IconInfoComponent,
  IconMailComponent,
  IconPhoneComponent,
} from "@optee/icons";
import { CyclopeService } from "../../../../services/cyclope.service";
import { ClientCardComponent } from "../../../client/client-card/client-card.component";

@Component({
  selector: "mkp-contacts-tab",
  host: { class: "flex flex-col gap-8" },
  template: `
    @if (!isUnblocked()) {
      @if (isInterested() && isOpteeLocation()) {
        <div class="bg-primary-50 rounded-lg p-4">
          <span class="text-primary-700 text-lg italic">
            Votre demande de contact a été envoyée. Un agent Optee vous
            contactera rapidement.
          </span>
        </div>
      }

      <article
        class="flex flex-col items-start justify-start gap-10 rounded-lg bg-gray-100 px-10 py-12"
      >
        <header class="flex flex-col gap-4">
          <h3 class="w-full text-xl font-semibold leading-7">
            {{ subtitle }}
          </h3>
          <p class="max-w-prose text-gray-600">{{ description }}</p>
        </header>

        <ul class="flex flex-col gap-4">
          @for (point of sellingPoints; track $index) {
            <li class="flex items-center justify-start gap-3">
              @switch (point.icon) {
                @case ("info") {
                  <icon-info
                    class="text-primary-700 size-6"
                    colorMode="current"
                  />
                }
                @case ("phone") {
                  <icon-phone
                    class="text-primary-700 size-6"
                    colorMode="current"
                  />
                }
                @case ("mail") {
                  <icon-mail
                    class="text-primary-700 size-6"
                    colorMode="current"
                  />
                }
              }
              <span>{{ point.label }}</span>
            </li>
          }
        </ul>
      </article>
    } @else {
      @if (cyclopeService.contacts.value(); as contactsData) {
        <mkp-client-card [data]="contactsData.data" />
      } @else if (cyclopeService.contacts.isLoading()) {
        <div class="flex w-full items-center justify-center py-20">
          Chargement des contacts...
        </div>
      } @else if (cyclopeService.contacts.error()) {
        <div class="flex w-full items-center justify-center py-20">
          Erreur lors du chargement des contacts. Veuillez réessayer plus tard.
          Si le problème persiste, contactez le support.
        </div>
      } @else {
        <div
          class="flex w-full items-center justify-center py-20 text-gray-600"
        >
          Aucun contact disponible pour ce bâtiment.
        </div>
      }
    }
  `,

  imports: [
    ClientCardComponent,
    IconMailComponent,
    IconPhoneComponent,
    IconInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsTabComponent {
  protected readonly cyclopeService = inject(CyclopeService);

  readonly isUnblocked = input.required<boolean>();
  readonly isInterested = input.required<boolean>();
  readonly locationType = input.required<"external" | "optee">();

  protected readonly isOpteeLocation = computed(
    () => this.locationType() === "optee",
  );

  protected readonly subtitle = "Obtenir les informations de contact";
  protected readonly description =
    "Accédez instantanément aux informations de contact des propriétaires, exploitants ou gestionnaires de ce bâtiment.";

  protected readonly sellingPoints = [
    {
      icon: "info",
      label:
        "Identité du propriétaire, gestionnaire ou exploitant du bâtiment.",
    },
    {
      icon: "mail",
      label: "Mail professionnel.",
    },
    {
      icon: "phone",
      label: "Numéro de téléphone.",
    },
  ] as const;
}
