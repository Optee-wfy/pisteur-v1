import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  resource,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import type { OperationCreatedBy } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import type { ContactUuid, OperationUuid, QuoteUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isEmailFromOptee, isNotNullish } from "@optee/utils";
import { Checkbox } from "primeng/checkbox";
import { filter, map } from "rxjs";
import trpcClient from "../../../trpc-client";
import { AuthService } from "../../services/auth.service";
import { QuoteService } from "../../services/quote.service";
import { OperationSignatoryComponent } from "../operation/operation-signatory/operation-signatory.component";
import { QuoteValidationDialogComponent } from "./quote-validation.component";

@Component({
  selector: "mkp-quote-sidebar-pending",
  host: {
    class: "flex flex-col gap-6 w-full",
  },
  template: `
    @if (currentUserIsSignatory()) {
      <p class="font-regular text-white">
        Veuillez prendre connaissances de toutes les pages du document, et
        cocher chacune des cases.
      </p>

      <form class="flex flex-col gap-6 text-white" [formGroup]="checkBoxesForm">
        <div class="w-full">
          <p-checkbox
            class="light-checkbox"
            id="readDocument"
            formControlName="readDocument"
            required
            [binary]="true"
          />

          <label class="ml-2 text-sm" for="readDocument">
            J’atteste avoir lu tous les documents
          </label>
        </div>

        <div class="w-full">
          <p-checkbox
            class="light-checkbox"
            id="acceptCgv"
            formControlName="acceptCgv"
            required
            [binary]="true"
          />
          <label class="ml-2 text-sm" for="acceptCgv">
            J’accepte les
            <a class="underline underline-offset-2" href="#">
              conditions et CGV Optee
            </a>
          </label>
        </div>

        <div class="w-full">
          <p-checkbox
            class="light-checkbox"
            id="validateQuote"
            formControlName="validateQuote"
            required
            [binary]="true"
          />
          <label class="ml-2 text-sm" for="validateQuote">
            Valider le devis m’engage à payer l’acompte demandé
          </label>
        </div>
      </form>

      <div class="flex w-full flex-col gap-4">
        <oui-button
          full
          (click)="validateQuote()"
          [disabled]="checkBoxesForm.invalid"
        >
          Valider le devis
        </oui-button>

        <oui-button
          class="w-full text-white"
          full
          variant="litePrimaryReverse"
          (click)="rejectQuote()"
        >
          Refuser ce devis
        </oui-button>
      </div>
    } @else {
      <p class="flex flex-col gap-1 text-white">
        <span>Ce devis est actuellement en attente de signature.</span>
        <mkp-operation-signatory
          prefix="Le signataire actuel est"
          showEmail
          whiteLink
          (signatoryChanged)="signatoryUuid.set($event?.uuid ?? null)"
          [operationUuid]="operationUuid()"
          [signatory]="currentSignatoryContact.value() ?? null"
        />
      </p>
    }
  `,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    Checkbox,
    OperationSignatoryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteSidebarPendingComponent {
  readonly quoteUuid = input.required<QuoteUuid>();
  readonly signatoryUuid = model.required<ContactUuid | null>();
  readonly operationUuid = input.required<OperationUuid>();
  readonly operationCreatedBy = input.required<OperationCreatedBy | null>();

  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly quoteService = inject(QuoteService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  protected readonly currentSignatoryContact = resource({
    params: () => ({
      contactUuid: this.signatoryUuid(),
      operationUuid: this.operationUuid(),
    }),
    loader: async ({ params }) => {
      if (!params.contactUuid) {
        return null;
      }

      try {
        const [signatoryContact, updatable] = await Promise.all([
          params.contactUuid
            ? trpcClient.contacts.get.query(params.contactUuid)
            : Promise.resolve(null),
          trpcClient.operations.operationSignatoryCanBeUpdated.query(
            params.operationUuid,
          ),
        ]);
        return signatoryContact
          ? { ...signatoryContact, updatable }
          : { updatable };
      } catch (error) {
        this.toastService.openError("Récupération du signataire", error);
        return null;
      }
    },
  });

  protected readonly currentUserContact = toSignal(
    this.authService.contact$.pipe(
      filter(isNotNullish),
      map((contact) => ({
        uuid: contact.uuid,
        adminOptee: isEmailFromOptee(contact.email),
      })),
    ),
    {
      initialValue: { uuid: null as unknown as ContactUuid, adminOptee: false },
    },
  );

  protected readonly currentUserIsSignatory = computed(
    () => this.signatoryUuid() === this.currentUserContact().uuid,
  );

  protected readonly checkBoxesForm = new FormGroup({
    readDocument: new FormControl(false, [Validators.requiredTrue]),
    acceptCgv: new FormControl(false, [Validators.requiredTrue]),
    validateQuote: new FormControl(false, [Validators.requiredTrue]),
  });

  protected async validateQuote() {
    await this.dialogService.open(QuoteValidationDialogComponent, {
      data: {
        quoteUuid: this.quoteUuid(),
        operationCreatedBy: this.operationCreatedBy(),
      },
    });
  }

  protected async rejectQuote() {
    const rejected = await this.quoteService.rejectQuote(this.quoteUuid());
    if (rejected !== null) {
      this.router.navigate(["/client/quotes"]);
    }
  }
}
