import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { FormHubspotComponent } from "../form-hubspot/form-hubspot.component";

@Component({
  selector: "swc-meet-form",
  template: `
    <oui-eve class="relative overflow-hidden">
      <oui-circle
        class="-right-[500px] -top-[300px] hidden w-[1000px] md:block"
        theme="light"
      />

      <h3
        class="text-primary-700 mb-10 max-w-[700px] text-2xl font-bold leading-snug lg:text-4xl"
      >
        {{ heading() }}
      </h3>
      <div class="flex flex-col gap-4 lg:w-[500px]">
        <p class="text-gray-600">
          Prenez contact avec l’un de nos energy managers pour accéder
          gratuitement à notre plateforme.
        </p>
        <swc-form-hubspot [type]="formType()" />
      </div>
    </oui-eve>
  `,
  imports: [FormHubspotComponent, EveComponent, CircleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetFormComponent {
  readonly heading = input<string>(
    "Vous souhaitez réaliser un rendez-vous de démo avec un expert ?",
  );

  readonly formType = input<"demo" | "lite">("lite");
}
