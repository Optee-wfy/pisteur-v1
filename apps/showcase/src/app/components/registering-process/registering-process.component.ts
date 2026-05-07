import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from "@angular/core";
import { CTA, getOnboardingPath } from "@optee/constants";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";

@Component({
  selector: "swc-registering-process",
  host: {
    class:
      "flex flex-col lg:flex-row gap-6 lg:gap-20 rounded-2xl bg-white px-6 py-10 lg:items-center",
  },
  template: `
    <div class="flex flex-col gap-4 lg:max-w-[480px]">
      <div
        class="font-display text-primary-700 text-2xl font-bold leading-snug lg:text-4xl"
      >
        {{
          altVersion()
            ? "Générez un plan d’action, en moins de 30 secondes"
            : "Inscrivez-vous, en moins de 30 secondes"
        }}
      </div>
      <div
        class="font-display text-primary-900 text-xl font-bold leading-snug lg:text-2xl"
      >
        Accédez gratuitement à toute la puissance d’Optee en 3 étapes
      </div>
      <div class="text-gray-600">
        Optee vous permet d’identifier, structurer et lancer vos projets de
        rénovation énergétique en toute autonomie. Gagnez du temps, sécurisez
        vos décisions et mobilisez les meilleures entreprises, sans frais ni
        engagement.
      </div>

      <oui-button
        class="mt-4"
        keepQueryParams
        variant="accent"
        [href]="onboardingUrl"
      >
        {{
          altVersion() ? "Générer un plan d’action" : CTA.launchMyCallForTender
        }}
      </oui-button>
    </div>

    <div class="font-display text-primary-900 flex flex-auto flex-col gap-6">
      @for (step of steps; let i = $index; track step.title) {
        <oui-eve class="flex items-center gap-6">
          <div class="text-2xl font-bold">{{ i + 1 }}.</div>
          <div class="flex flex-col gap-2">
            <div class="font-semibold">{{ step.title }}</div>
            <div class="text-sm font-light">
              {{ step.description }}
            </div>
          </div>
        </oui-eve>
      }
    </div>
  `,
  imports: [ButtonComponent, EveComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisteringProcessComponent {
  onboardingUrl = getOnboardingPath({
    step: "contact",
    variant: "2025",
    useAbsoluteUrl: true,
  });

  CTA = CTA;

  altVersion = input(false, { transform: booleanAttribute });

  steps = [
    {
      title: "Inscription express et gratuite.",
      description:
        "Remplissez un formulaire en moins de 30 secondes pour débloquer l’accès à l’ensemble des fonctionnalités Optee, sans engagement.",
    },
    {
      title: "Analysez vos projets, instantanément.",
      description:
        "Explorez notre marketplace, consultez les projets adaptés à vos bâtiments avec leurs briefs techniques, estimations de coût, subventions mobilisables et retour sur investissement.",
    },
    {
      title: "Verifiez votre profil et lancez vos projets, facilement.",
      description:
        "Un energy manager dédié valide votre projet par téléphone en 10 minutes. Vous pouvez ensuite consulter et comparer les offres des entreprises qualifiées.",
    },
  ];
}
