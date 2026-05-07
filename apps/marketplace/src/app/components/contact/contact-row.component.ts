import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { UserType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import { IconXmarkComponent } from "@optee/icons";
import type {
  HubspotClient,
  HubspotContact,
  HubspotPro,
  UserUuid,
} from "@optee/models";
import { Location } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish } from "@optee/utils";
import { TooltipModule } from "primeng/tooltip";
import trpcClient from "../../../trpc-client";
import { ClientContactFormComponent } from "../permission/client-contact-form.component";

@Component({
  selector: "mkp-contact-row",
  host: { class: "table-row align-middle p-2 odd:bg-primary-50" },
  template: `
    <td class="px-3 py-2">
      <a
        class="text-primary-700 underline"
        rel="noopener"
        target="_blank"
        [href]="contact().id"
      >
        {{ contact().firstName ?? "-" }} {{ contact().lastName ?? "-" }}
      </a>
      <br />
      <span class="text-xs">{{ contact().email }}</span>
    </td>
    <td class="px-3 py-2">
      <div class="flex gap-2">
        <p class="flex flex-col justify-center gap-1">
          {{ client()?.name ?? pro()?.name ?? "Non renseignée" }}
          @if (role()) {
            <span
              class="bg-primary-700 py-.5 w-fit rounded-lg px-1 text-xs text-white"
            >
              {{ role() }}
            </span>
          }
        </p>
        @if (duplicatedAssociations()) {
          <span
            pTooltip="Ce contact dispose d'associations en double. Ses accès sont sans doute corrompus. 🔥"
            tooltipPosition="bottom"
            tooltipStyleClass="warning"
          >
            ⚠️
          </span>
        }
      </div>
    </td>
    <td class="px-3 py-2">
      @if (user(); as user) {
        <div class="flex flex-col">
          <span class="text-sm">
            Ajouté le
            <span class="font-medium">{{ user.createdAt | date }}</span>
          </span>
          @if (user.lastSignInAt) {
            <span class="text-sm">
              Dernière connexion
              <span class="font-medium">{{ user.lastSignInAt | date }}</span>
            </span>
          } @else {
            <span class="text-sm text-red-500">Jamais connecté</span>
          }
        </div>
      } @else {
        <icon-xmark
          class="size-6 text-red-500"
          pTooltip="Ce contact n'a pas encore accès à la plateforme"
        />
      }
    </td>

    <td class="px-3 py-2">
      <span
        tooltipPosition="left"
        tooltipStyleClass="p-tooltip--warning"
        [pTooltip]="getTooltipButtonText()"
      >
        @if (user(); as user) {
          @if (!user.lastSignInAt) {
            <oui-button variant="outline" (click)="reSendInvitation()">
              Renvoyer l'invitation
            </oui-button>
          }
        } @else {
          <oui-button
            variant="primary"
            (click)="openInviteContactModal()"
            [disabled]="!canPerformAction()"
          >
            Inviter
          </oui-button>
        }
      </span>
    </td>
  `,
  imports: [ButtonComponent, TooltipModule, IconXmarkComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactRowComponent {
  contact = input.required<HubspotContact>();

  user = input<{
    uuid: UserUuid;
    email: string;
    createdAt: Date | null;
    lastSignInAt: Date | null;
  } | null>();

  pro = input<HubspotPro | null>();

  client = input<HubspotClient | null>();

  duplicatedAssociations = input<boolean>();
  role = input<string | null>();

  protected readonly dialogService = inject(DialogService);
  protected readonly toastService = inject(ToastService);

  modalFadedOut = signal(false);

  canPerformAction = computed(() => {
    const contact = this.contact();
    return !!(contact.email && contact.firstName && contact.lastName);
  });

  protected async openInviteContactModal() {
    const actionAttempted = "Invitation";

    try {
      const contact = this.contact();
      const client = this.client();
      const pro = this.pro();

      const email = contact.email;
      if (!email) {
        throw new Error("Le contact n'a pas d'email");
      }

      if (client) {
        const contactDto = {
          uuid: contact.uuid,
          email,
          firstName: contact.firstName ?? "",
          lastName: contact.lastName ?? "",
          role: null,
          locations: [],
        };

        const clientLocations =
          await trpcClient.locations.getAllByClientForAdmin.query({
            uuid: client.uuid,
          });

        return this.dialogService.open(ClientContactFormComponent, {
          data: {
            contact: contactDto,
            modalType: "invite" as const,
            locationsToSelectFrom: clientLocations
              .map((location) => Location.init(location))
              .filter(isNotNullish),
            clientUuid: client.uuid,
          },
        });
      }

      if (pro) {
        await trpcClient.pros.grantPlatformAccess.mutate({
          uuid: contact.uuid,
          proUuid: pro.uuid,
        });

        this.toastService.open(
          "success",
          actionAttempted,
          "L'invitation a bien été envoyée",
        );

        return;
      }

      throw new Error("Aucun client ou pro trouvé pour ce contact");
    } catch (error) {
      this.toastService.openError(actionAttempted, error);
      return;
    }
  }

  protected async reSendInvitation() {
    const actionAttempted = "Envoyer de nouveau l'invitation";

    try {
      const contact = this.contact();

      if (!contact || !contact.email || !contact.userUuid) {
        throw new Error(
          "Le contact n'a pas d'email ou n'est attaché à aucun utilisateur",
        );
      }

      await trpcClient.contacts.sendInvitationEmailToContactWithUser.mutate({
        email: contact.email,
        userType: this.pro() ? UserType.PRO : UserType.CLIENT,
        userUuid: contact.userUuid,
      });

      this.toastService.open(
        "success",
        actionAttempted,
        "L'invitation a bien été ré-envoyée",
      );
    } catch (error) {
      this.toastService.openError(actionAttempted, error);
    }
  }

  getTooltipButtonText = computed(() => {
    if (!this.canPerformAction()) {
      return "Un contact doit avoir un prénom, un nom et une adresse email pour être invité";
    }
    if (!this.pro()) {
      return undefined;
    }
    return ["Actif", "Inactif"].find((s) => s === this.pro()?.status)
      ? "Invitation plateforme"
      : "Invitation onboarding";
  });
}
