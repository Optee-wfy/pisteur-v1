import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AssociationProExternalContactType } from "@optee/constants";
import type {
  ContactUuid,
  ExternalContactUuid,
  LegalEntityUuid,
} from "@optee/models";
import { ToastService } from "@optee/ui/services/toast.service";
import { shareReplay, startWith, Subject, switchMap } from "rxjs";
import trpcClient from "../../trpc-client";

@Injectable({ providedIn: "root" })
export class ContactService {
  private readonly refresh$ = new Subject<void>();
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  /**
   * @deprecated Use 'AuthService.contact$' instead
   */
  self$ = this.refresh$.pipe(
    startWith(""),
    switchMap(() => trpcClient.contacts.getByLoggedUser.query()),
    shareReplay(1),
  );

  refresh() {
    this.refresh$.next();
  }

  formatSignatories(
    signatories: Array<{
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      uuid: ContactUuid;
    }>,
  ) {
    return signatories.map((signatory) => {
      const fullName = [signatory.firstName, signatory.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        label: fullName.length ? fullName : "utilisateur inconnu",
        firstName: signatory.firstName ?? "",
        lastName: signatory.lastName ?? "",
        email: signatory.email ?? "",
        value: signatory.uuid,
      };
    });
  }

  async activateContactsWithPro(
    contactsUuids: ExternalContactUuid[],
    legalEntityUuid: LegalEntityUuid,
  ) {
    const ctxMessage = "Activation des contacts";

    if (!contactsUuids.length) {
      return false;
    }
    try {
      const result = await trpcClient.externalContacts.associateWithPro.mutate({
        contactsUuids,
        type: AssociationProExternalContactType.NONE,
      });
      if (!result.success) {
        this.toastService.open(
          "warn",
          ctxMessage,
          `${result.succeeded} contact(s) activé(s) avec succès, ${result.failed} échec(s).`,
        );
        return false;
      }
      this.router.navigate(["/pro/pisteur/address-book/contacts"], {
        queryParams: {
          associationType: [AssociationProExternalContactType.NONE],
          legalEntityUuids: [legalEntityUuid],
        },
      });
      this.toastService.open(
        "success",
        ctxMessage,
        `${result.succeeded} contact(s) activé(s) avec succès.`,
      );
      return true;
    } catch (error) {
      this.toastService.openError(
        ctxMessage,
        "Une erreur est survenue lors de l'activation des contacts. Veuillez réessayer.",
      );
    }
    return false;
  }
}
