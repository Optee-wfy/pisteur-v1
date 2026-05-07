import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import type { ContactUuid } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../trpc-client";

type ContactInfo = {
  email: string;
  exists: boolean;
  contactUuid: ContactUuid | null;
};

@Component({
  selector: "mkp-contacts-list",
  host: {
    class: "bg-primary-50 rounded-lg p-4",
  },
  template: `
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-medium text-gray-800">
        {{ contactsInfo().length }} contacts trouvés
      </h3>
      @if (missingContactsCount() > 0) {
        <oui-button
          variant="primary"
          (click)="createMissingContacts()"
          [disabled]="isCreatingContacts()"
        >
          @if (isCreatingContacts()) {
            Création en cours...
          } @else {
            Créer {{ missingContactsCount() }} contact{{
              missingContactsCount() > 1 ? "s" : ""
            }}
          }
        </oui-button>
      }
    </div>

    <ul class="space-y-2 text-sm">
      @for (contactInfo of contactsInfo(); track contactInfo.email) {
        <li
          class="flex items-center justify-between rounded-md bg-white p-3 shadow-sm"
        >
          <span class="font-medium text-gray-900">
            {{ contactInfo.email }}
          </span>
          <div class="flex items-center space-x-2">
            @if (contactInfo.exists) {
              <span class="flex items-center space-x-1 text-green-600">
                <span class="text-xs font-medium">Existe en BDD</span>
              </span>
            } @else {
              <span class="flex items-center space-x-1 text-red-600">
                <span class="text-xs font-medium">N'existe pas en BDD</span>
              </span>
            }
          </div>
        </li>
      }
    </ul>
  `,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListComponent {
  contactCreated = output<void>();

  readonly contactsInfo = input.required<ContactInfo[]>();

  protected readonly toastService = inject(ToastService);

  protected readonly isCreatingContacts = signal(false);

  protected readonly missingContactsCount = computed(() => {
    return this.contactsInfo().filter((info) => !info.exists).length;
  });

  protected async createMissingContacts() {
    const actionAttempted = "Création des contacts";

    try {
      this.isCreatingContacts.set(true);

      // Get all missing contacts
      const missingContactsEmails = this.contactsInfo()
        .filter((info) => !info.exists)
        .map((info) => info.email);

      // Create all contacts in parallel
      await trpcClient.contacts.createMany.mutate({
        emails: missingContactsEmails,
      });

      this.contactCreated.emit();

      this.toastService.open(
        "success",
        actionAttempted,
        `${missingContactsEmails.length} contact(s) créé(s) avec succès`,
      );
    } catch (error) {
      console.error("Erreur lors de la création des contacts:", error);
      this.toastService.open(
        "error",
        actionAttempted,
        "Une erreur est survenue lors de la création des contacts",
      );
    } finally {
      this.isCreatingContacts.set(false);
    }
  }
}
