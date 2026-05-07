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
import type { ClientUuid } from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { AutoCompleteModule } from "primeng/autocomplete";
import { debounceTime, of, switchMap } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { AuthService } from "../../../services/auth.service";
import { ClientService } from "../../../services/client.service";

@Component({
  selector: "mkp-client-select",
  template: `
    <p-autocomplete
      optionLabel="name"
      (completeMethod)="query.set($event.query)"
      (onSelect)="select($event.value)"
      [(ngModel)]="activeClientText"
      [suggestions]="(suggestions$ | async) ?? []"
    />
  `,
  imports: [AsyncPipe, AutoCompleteModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientSelectComponent {
  private readonly clientService = inject(ClientService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  protected readonly query = signal<string>("");
  protected readonly activeClientText = model<string>("");

  protected readonly suggestions$ = toObservable(this.query).pipe(
    debounceTime(300),
    switchMap((filter) =>
      filter.length > 1 ? trpcClient.clients.getAll.query({ filter }) : of([]),
    ),
  );

  private readonly subClientOnLoad = this.clientService.self$
    .pipe(takeUntilDestroyed())
    .subscribe((client) => {
      this.activeClientText.set(client?.name ?? "");
    });

  protected async select(client: { uuid: ClientUuid; name: string }) {
    const ctxMessage = "Changement de client";
    try {
      await trpcClient.clients.setCurrentUserAsClientAdmin.mutate(client.uuid);

      this.authService.changeUserType(UserType.CLIENT);
      this.clientService.refresh();

      this.toastService.open(
        "success",
        ctxMessage,
        `Vous êtes désormais un contact de type Administrateur du client "${client.name}"`,
      );
    } catch (error) {
      this.toastService.openError(ctxMessage, error);
    }
  }
}
