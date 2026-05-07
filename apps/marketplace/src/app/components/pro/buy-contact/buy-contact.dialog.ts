import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import {
  IconInfoComponent,
  IconMailComponent,
  IconPhoneComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

@Component({
  selector: "mkp-buy-contact-dialog",
  template: `
    <op-dialog-wrapper
      class="min-w-96 gap-8"
      (crossClick)="dialogRef.close(false)"
    >
      <div class="flex flex-col items-start justify-start gap-6">
        <div class="flex flex-col gap-2">
          <h3 class="w-full text-xl font-semibold leading-7">
            {{ subtitle }}
          </h3>
          <p class="max-w-prose text-gray-600">{{ description }}</p>
        </div>

        <ul class="mt-4 flex flex-col gap-2 sm:mx-6">
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
      </div>

      <footer class="flex w-full items-center justify-end">
        <oui-button variant="primary" (click)="dialogRef.close(true)">
          Accéder
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogWrapperComponent,
    IconInfoComponent,
    ButtonComponent,
    IconPhoneComponent,
    IconMailComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyContactDialogComponent extends StronglyTypedDialog<
  { cost: number },
  boolean
> {
  protected readonly subtitle = "Se positionner sur l’opportunité";
  protected readonly description =
    "Positionnez-vous sur cette opportunité et accédez instantanément aux données du client et de l’opération. Cette dernière sera ajoutée à votre tableau de bord.";

  protected readonly sellingPoints = [
    {
      icon: "info",
      label:
        "Informations relatives à l’opération (brief complet, données bâtiment).",
    },
    {
      icon: "mail",
      label:
        "Mail du professionnel (propriétaire, gestionnaire ou exploitant du bâtiment).",
    },
    {
      icon: "phone",
      label: "Numéro de téléphone.",
    },
  ] as const;
}
