import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MailCardComponent } from "../mail-card/mail-card.component";

@Component({
  selector: "mkp-mail-settings",
  host: {
    class: "flex w-full flex-col gap-6",
  },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Messagerie</h1>
      <p class="text-sm text-gray-600">
        Connectez une boîte mail pour envoyer des emails automatiques depuis
        votre compte.
      </p>
    </header>

    <mkp-mail-card />
  `,
  imports: [MailCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailSettingsComponent {}
