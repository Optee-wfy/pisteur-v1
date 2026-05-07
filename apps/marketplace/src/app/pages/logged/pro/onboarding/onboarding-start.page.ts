import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router } from "@angular/router";

import { buildAssetUrl } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";

@Component({
  selector: "mkp-pro-onboarding-start",
  host: {
    class: "flex items-center h-full",
  },
  template: `
    <oui-bob class="m-auto flex max-w-screen-sm">
      <div class="flex flex-col items-center justify-center gap-10 p-8">
        <div class="flex flex-col gap-8">
          <img class="h-8 w-auto" alt="Logo de Optee" [src]="logoLight" />
          <div class="flex flex-col gap-2">
            <h2 class="text-center text-2xl font-semibold">
              Rejoignez plus de 200 professionnels engagés pour le climat et
              boostez votre chiffre d'affaires
            </h2>
            <p class="text-center text-sm text-gray-600">
              Renseignez vos informations en quelques minutes et accédez aux
              opportunités proposées par Optee. Vous pouvez enregistrer votre
              avancement et revenir ici quand vous le souhaitez.
            </p>
          </div>
        </div>
        <div class="flex flex-col items-start gap-4">
          @for (step of steps; track $index) {
            <div class="flex items-center justify-center gap-2">
              <div
                class="border-primary-200 flex size-6 items-center justify-center rounded-full border"
              >
                <span class="text-primary-700 text-xs font-medium">
                  {{ step.number }}
                </span>
              </div>
              <span class="text-primary-900">
                {{ step.title }}
              </span>
            </div>
          }
        </div>
        <oui-button
          class="text-center"
          variant="primary"
          (click)="startOnboarding()"
        >
          Commencer
        </oui-button>
      </div>
    </oui-bob>
  `,
  imports: [BobComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProComponent {
  private readonly router = inject(Router);
  private readonly proService = inject(ProService);

  logoLight = buildAssetUrl("logo-light-theme.svg");

  steps = [
    {
      number: 1,
      title: "Renseignez vos informations générales",
    },
    {
      number: 2,
      title: "Créez votre profil d’entreprise",
    },
    {
      number: 3,
      title: "Indiquez vos expertises",
    },
    {
      number: 4,
      title: "Importez vos documents légaux",
    },
  ];

  async startOnboarding() {
    await trpcClient.pros.updateStatus.mutate("Onboarding plateforme");
    this.proService.refresh();

    this.router.navigate(["/pro/onboarding/onboarding-form"]);
  }
}
