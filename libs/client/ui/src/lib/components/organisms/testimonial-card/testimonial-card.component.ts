import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Avatar } from "primeng/avatar";
import { EveComponent } from "../eve/eve.component";

export interface Testimonial {
  name: string;
  intro: string;
  text: string;
  avatar: string;
}

@Component({
  selector: "oui-testimonial-card",
  host: {
    class: "block h-full",
  },
  template: `
    <oui-eve class="flex h-full flex-col gap-4">
      <p-avatar
        alt="Photo de la personne"
        image="{{ testimonial().avatar }}"
        shape="circle"
        size="large"
      />

      <div class="text-primary-900 font-display text-lg font-bold">
        {{ testimonial().name }}
      </div>

      <div class="text-primary-900 text-sm font-bold">
        {{ testimonial().intro }}
      </div>

      <div class="text-gray-600">
        {{ testimonial().text }}
      </div>
    </oui-eve>
  `,
  imports: [EveComponent, Avatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialCardComponent {
  testimonial = input.required<Testimonial>();
}
