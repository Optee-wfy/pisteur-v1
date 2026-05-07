import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { ProSubscription } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import type { ProUuid } from "@optee/models";
import { ProMembersComponent } from "../../../components/pro/forms/pro-members/pro-members.component";

@Component({
  selector: "mkp-admin-pro-members-dialog",
  template: `
    <op-dialog-wrapper
      class="!max-h-[90vh] !w-[80vw] !max-w-screen-lg"
      (crossClick)="dialogRef.close(undefined)"
      [spaceless]="true"
    >
      <op-dialog-heading heading="Membres du pro">
        <p class="text-sm text-gray-600">
          {{ data.proName ?? "Pro sans nom" }}
        </p>
      </op-dialog-heading>
      <div class="max-h-[70vh] overflow-y-auto p-6">
        <mkp-pro-members
          [canInvite]="true"
          [canRemoveMembers]="true"
          [canSetMainContact]="true"
          [isAccountOwner]="false"
          [proSubscription]="data.proSubscription"
          [proUuid]="data.proUuid"
        />
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    DialogHeadingComponent,
    DialogWrapperComponent,
    ProMembersComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProMembersDialogComponent extends StronglyTypedDialog<
  {
    proUuid: ProUuid;
    proName: string | null;
    proSubscription: ProSubscription | null;
  },
  void
> {}
