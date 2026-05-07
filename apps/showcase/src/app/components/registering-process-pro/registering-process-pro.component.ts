import { ChangeDetectionStrategy, Component } from "@angular/core";
import { DemoButtonComponent } from "@optee/ui/components/atoms/button/demo-button/demo-button.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";

@Component({
  selector: "swc-registering-process-pro",
  host: {
    class:
      "flex flex-col lg:flex-row gap-6 lg:gap-20 rounded-2xl bg-white px-6 py-10 lg:items-center",
  },
  template: `
    <div class="flex flex-col gap-4 lg:max-w-[480px]">
      <div
        class="font-display text-primary-700 text-2xl font-bold leading-snug lg:text-4xl"
      >
        Générez vos premiers projets qualifiés, en 30 secondes.
      </div>
      <div
        class="font-display text-primary-900 text-xl font-bold leading-snug lg:text-2xl"
      >
        Inscrivez-vous gratuitement et commencez à recevoir vos premiers briefs
        techniques
      </div>
      <div class="text-gray-600">
        Optee identifie automatiquement les projets adaptés à votre zone, génère
        les dossiers techniques complets et vous connecte aux donneurs d’ordre
        qualifiés. En moins d’une minute, vous accédez à une marketplace de
        chantiers prêts à être signés.
      </div>

      <oui-demo-button />
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
  imports: [EveComponent, DemoButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisteringProcessProComponent {
  protected readonly steps = [
    {
      title: "Créez votre compte gratuit en 30 secondes.",
      description:
        "Débloquez l’accès aux projets de votre zone, à notre simulateur et à votre espace personnalisé.",
    },
    {
      title: "Recevez vos premiers projets qualifiés.",
      description:
        "Découvrez les dossiers prêts à chiffrer : lots, aides mobilisables, ROI, et volumes de travaux.",
    },
    {
      title: "Lancez vos premiers chantiers en quelques clics.",
      description:
        "Un expert Optee valide votre compte en 10 min. Vous accédez à votre portefeuille de projets.",
    },
  ];
}
