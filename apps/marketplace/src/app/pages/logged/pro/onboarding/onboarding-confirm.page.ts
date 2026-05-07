import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { ALEXIA_CALENDLY, THAIS_CALENDLY, UserType } from "@optee/constants";
import { IconSuccessComponent } from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { FileService } from "@optee/ui/services/file.service";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../../../services/auth.service";
import { ProService } from "../../../../services/pro.service";

export const ProGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const proService = inject(ProService);

  const userTypes = await firstValueFrom(authService.userTypes$);
  if (!userTypes.includes(UserType.PRO)) {
    router.navigate(["/client"]);
    return false;
  }

  const proStatus = (await firstValueFrom(proService.pro$))?.status;
  if (proStatus !== "Compte en attente de validation") {
    router.navigate([`/pro`]);
    return false;
  }

  return true;
};

@Component({
  selector: "mkp-pro-onboarding-confirm",
  host: {
    class: "flex flex-wrap gap-6 max-w-app m-auto justify-center my-8",
  },
  template: `
    <oui-bob class="max-w-screen-sm">
      <header class="flex flex-col items-center gap-2">
        <icon-success class="size-12" colorMode="colored" preTitle />
        <h1
          class="text-primary-900 font-display text-2xl font-semibold leading-loose"
        >
          Lancez votre premier projet
        </h1>
      </header>
      <p
        class="max-w-prose text-center text-sm leading-tight tracking-tight text-gray-600"
      >
        Félicitations, vous faites désormais parti de notre réseau de
        professionnels. La confirmation de signature de vos contrats vous sera
        envoyée par mail. Prenez rendez-vous avec un de nos experts et trouvez
        votre première opportunité.
      </p>
      <div class="mt-8 flex flex-col items-center justify-start gap-4">
        <!--<p class="text-center text-sm leading-tight tracking-tight">
          {{
            pro()?.eligibilityCee
              ? "Téléchargez vos contrats au format PDF."
              : "Téléchargez votre contrat au format PDF."
          }}
        </p>
        <div class="flex flex-col gap-2">
          @for (contract of contracts(); track contract.id) {
            <a
              class="text-primary-700 flex cursor-pointer items-center gap-2 underline underline-offset-4"
              (click)="downloadContract(contract.id)"
            >
              <icon-download
                class="size-6 shrink-0 rounded-full bg-gray-100 p-1"
                colorMode="colored"
              />
              {{ contract.documentName }}
            </a>
          }
        </div> -->
        <oui-button
          class="mt-4"
          rel="noopener"
          target="_blank"
          variant="primary"
          [href]="getCalendlyLink()"
        >
          Prendre rendez-vous
        </oui-button>
      </div>
    </oui-bob>
  `,
  imports: [BobComponent, IconSuccessComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProConfirmComponent {
  protected readonly proService = inject(ProService);
  protected readonly fileService = inject(FileService);

  pro = toSignal(this.proService.pro$);

  // Commented in case actually needed asap
  // protected readonly contracts = computed(() => {
  //   const contracts: { id: ContractType; documentName: string }[] = [
  //     {
  //       id: "partnership" as const,
  //       documentName: "Accord de partenariat Optee",
  //     },
  //   ];

  //   if (this.pro()?.eligibilityCee) {
  //     contracts.push({
  //       id: "cee" as const,
  //       documentName: "Contrat de valorisation CEE",
  //     });
  //   }
  //   return contracts;
  // });

  // protected async downloadContract(contractId: ContractType) {
  //   // download via hubspot ? get url from id ?
  // }

  protected getCalendlyLink() {
    return Math.random() > 0.5 ? THAIS_CALENDLY : ALEXIA_CALENDLY;
  }
}
