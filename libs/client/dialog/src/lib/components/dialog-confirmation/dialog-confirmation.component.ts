import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  IconCirclePlusComponent,
  IconCompanyComponent,
  IconUserComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { StronglyTypedDialog } from "../../directives/typed-dialog.directive";
import { DialogHeadingComponent } from "../dialog-heading/dialog-heading.component";
import { DialogWrapperComponent } from "../dialog-wrapper/dialog-wrapper.component";

@Component({
  selector: "op-dialog-confirmation",
  template: `
    <op-dialog-wrapper
      class="max-w-prose items-center text-center"
      (crossClick)="dialogRef.close(null)"
    >
      <op-dialog-heading [heading]="data.title">
        @if (data.icon) {
          <div iconSlot>
            @switch (data.icon) {
              @case ("circle-plus") {
                <icon-circle-plus class="text-primary-700 size-10" iconSlot />
              }
              @case ("company") {
                <icon-company
                  class="size-12 rounded-xl bg-green-200 p-2 text-green-600"
                  iconSlot
                />
              }
              @case ("person") {
                <icon-user
                  class="size-12 rounded-xl bg-yellow-200 p-2 text-yellow-600"
                  iconSlot
                />
              }
            }
          </div>
        }

        <p class="whitespace-pre-line">{{ data.description }}</p>
      </op-dialog-heading>

      <footer class="flex flex-col items-center justify-center gap-6">
        @if (data.reverse) {
          @if (!data.hideCancel) {
            <oui-button
              type="submit"
              (click)="dialogRef.close(false)"
              [variant]="data.actionColor ?? 'primary'"
            >
              {{ data.cancelButtonLabel ?? "Quitter" }}
            </oui-button>
          }

          <a
            class="cursor-pointer text-red-500 underline"
            (click)="dialogRef.close(true)"
          >
            {{ data.action ?? "Quitter" }}
          </a>
        } @else {
          <oui-button
            type="submit"
            (click)="dialogRef.close(true)"
            [variant]="data.actionColor ?? 'primary'"
          >
            {{ data.action ?? "Confirmer" }}
          </oui-button>

          @if (!data.hideCancel) {
            <div class="link" (click)="dialogRef.close(false)">
              {{ data.cancelButtonLabel ?? "Annuler" }}
            </div>
          }
        }
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [
    ButtonComponent,
    DialogWrapperComponent,
    DialogHeadingComponent,
    IconCirclePlusComponent,
    IconCompanyComponent,
    IconUserComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmationComponent extends StronglyTypedDialog<
  {
    title: string;
    description?: string;
    action?: string;
    cancelButtonLabel?: string;
    actionColor?: "primary" | "danger" | "standard" | "green";
    reverse?: boolean;
    hideCancel?: boolean;
    icon?: "circle-plus" | "company" | "person";
  },
  boolean
> {}
