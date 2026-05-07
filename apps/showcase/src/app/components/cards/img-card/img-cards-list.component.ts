import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { PublicAssetPath } from "@optee/constants";
import { ImgCardComponent } from "./img-card.component";

export interface ShowcaseCard {
  title: string;
  description: string;
  publicAssetPath: PublicAssetPath;
  imgDescription: string;
}

@Component({
  selector: "swc-img-cards-list",
  host: { class: "flex flex-col gap-10 p-6 md:p-10 xl:gap-20 xl:py-20" },
  template: `
    <h3
      class="m-auto text-center text-2xl font-semibold xl:max-w-3xl xl:text-4xl"
    >
      {{ title() }}
    </h3>

    <div class="flex flex-wrap justify-center gap-6">
      @for (card of cards(); track card.title) {
        <swc-img-card
          [description]="card.description"
          [imgDescription]="card.imgDescription"
          [publicAssetPath]="card.publicAssetPath"
          [title]="card.title"
        />
      }
    </div>
  `,
  imports: [ImgCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgCardsListComponent {
  readonly cards = input.required<ShowcaseCard[]>();
  readonly title = input.required<string>();
}
