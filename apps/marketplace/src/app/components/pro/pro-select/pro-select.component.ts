import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
  signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { UserType } from "@optee/constants";
import type { ProUuid } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { AutoCompleteModule } from "primeng/autocomplete";
import { debounceTime, of, switchMap } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { ProService } from "../../../services/pro.service";

@Component({
  selector: "mkp-pro-select",
  template: `
    <p-autocomplete
      optionLabel="name"
      (completeMethod)="query.set($event.query)"
      (onSelect)="select($event.value)"
      [(ngModel)]="activeProText"
      [suggestions]="(suggestions$ | async) ?? []"
    />
  `,
  imports: [AsyncPipe, AutoCompleteModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProSelectComponent {
  private readonly proService = inject(ProService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly query = signal<string>("");
  protected readonly activeProText = model<string>("");

  protected readonly suggestions$ = toObservable(this.query).pipe(
    debounceTime(300),
    switchMap((filter) =>
      filter.length > 1 ? trpcClient.pros.getAll.query({ filter }) : of([]),
    ),
  );

  private readonly subProOnLoad = this.proService.pro$
    .pipe(takeUntilDestroyed())
    .subscribe((pro) => {
      this.activeProText.set(pro?.name ?? "");
    });

  protected async select(pro: { uuid: ProUuid; name: string }) {
    const ctxMessage = "Changement de pro";
    try {
      await trpcClient.pros.setCurrentUserAsProAdmin.mutate({
        proUuid: pro.uuid,
      });

      this.authService.changeUserType(UserType.PRO);
      this.proService.refresh();

      this.toastService.open(
        "success",
        ctxMessage,
        `Vous êtes désormais un contact du pro "${pro.name}"`,
      );
    } catch (error) {
      this.toastService.openError(ctxMessage, error);
    }
  }
}
