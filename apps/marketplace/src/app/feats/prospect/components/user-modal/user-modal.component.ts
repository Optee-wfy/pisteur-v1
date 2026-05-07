import { NgComponentOutlet } from "@angular/common";
import type { Type } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  resource,
  signal,
} from "@angular/core";
import { DialogWrapperComponent, StronglyTypedDialog } from "@optee/dialog";
import {
  IconAuditComponent,
  IconBoltComponent,
  IconCompanyComponent,
  IconDevisComponent,
  IconPersonComponent,
  IconUsersComponent,
} from "@optee/icons";
import { ToastService } from "@optee/ui/services/toast.service";
import trpcClient from "../../../../../trpc-client";
import { MailSettingsComponent } from "../../../../components/account/mail-settings/mail-settings.component";
import { ProCompanyFormComponent } from "../../../../components/pro/forms/pro-company-form/pro-company-form.component";
import { ProExpertiseFormComponent } from "../../../../components/pro/forms/pro-expertise-form/pro-expertise-form.component";
import { ProMembersComponent } from "../../../../components/pro/forms/pro-members/pro-members.component";
import { ContactFormProspectComponent } from "../contact-form/contact-form.component";
import { ProInvoiceListComponent } from "../pro-invoice-list/pro-invoice-list.component";
import { ProSubscriptionFormComponent } from "../pro-subscription-form/pro-subscription-form.component";

type Tab =
  | "settings"
  | "subscription"
  | "company"
  | "expertise"
  | "invoices"
  | "messaging"
  | "members";

type TabConfig = {
  slug: Tab;
  label: string;
  icon: Type<unknown>;
};

@Component({
  selector: "mkp-user-modal",
  template: `
    <op-dialog-wrapper
      class="!max-h-[unset] !w-[80vw] !max-w-screen-lg"
      (crossClick)="dialogRef.close(null)"
      [fadedOut]="modalFadedOut()"
      [spaceless]="true"
    >
      <div class="flex h-full flex-col md:flex-row">
        <section
          class="bg-granite-50 w-full shrink-0 p-6 md:w-64"
          role="navigation"
        >
          <nav aria-label="Settings tabs">
            <h2 class="text-granite-400 p-2 text-xs font-medium">Paramètres</h2>
            @if (currentUserIsOwner.isLoading()) {
              <p class="text-sm text-gray-600">Chargement des onglets ...</p>
            } @else {
              <menu class="flex flex-col gap-1">
                @for (tab of tabs; track tab.slug) {
                  <li>
                    <button
                      class="hover:bg-granite-100 text-granite-900 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                      (click)="currentView.set(tab.slug)"
                      [class.bg-granite-100]="currentView() === tab.slug"
                    >
                      <div class="size-4">
                        <ng-container *ngComponentOutlet="tab.icon" />
                      </div>
                      {{ tab.label }}
                    </button>
                  </li>
                }
              </menu>
            }
          </nav>
        </section>
        <div class="h-[70dvh] w-full overflow-y-auto p-6">
          @let isAccountOwner = !!currentUserIsOwner.value();
          @switch (currentView()) {
            @case ("settings") {
              <mkp-contact-form-prospect />
            }
            @case ("subscription") {
              <mkp-pro-subscription-form [editable]="isAccountOwner" />
            }
            @case ("company") {
              <mkp-pro-company-form [editable]="isAccountOwner" />
            }
            @case ("members") {
              <mkp-pro-members [isAccountOwner]="isAccountOwner" />
            }
            @case ("expertise") {
              <mkp-pro-expertise-form />
            }
            @case ("invoices") {
              <mkp-pro-invoice-list />
            }
          }
        </div>
      </div>
    </op-dialog-wrapper>
  `,
  imports: [
    ContactFormProspectComponent,
    ProSubscriptionFormComponent,
    DialogWrapperComponent,
    ProCompanyFormComponent,
    ProExpertiseFormComponent,
    ProInvoiceListComponent,
    ProMembersComponent,
    MailSettingsComponent,
    NgComponentOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserModalComponent extends StronglyTypedDialog<
  { activeTab?: Tab } | null,
  boolean | null
> {
  protected readonly currentView = signal<Tab>(
    this.data?.activeTab ?? "settings",
  );

  private readonly toastService = inject(ToastService);

  readonly currentUserIsOwner = resource({
    loader: async () => {
      try {
        const role = await trpcClient.pros.getCurrentRoleOfUser.query();
        return role === "MAIN_CONTACT";
      } catch (error) {
        this.toastService.openError(
          "Récupération du rôle de l'utilisateur",
          error,
        );
        return null;
      }
    },
  });

  protected readonly tabs: ReadonlyArray<TabConfig> = [
    {
      slug: "settings",
      label: "Info. personnelles",
      icon: IconPersonComponent,
    },
    { slug: "company", label: "Entreprise", icon: IconCompanyComponent },
    { slug: "members", label: "Membres", icon: IconUsersComponent },
    { slug: "expertise", label: "Expertise", icon: IconAuditComponent },
    { slug: "subscription", label: "Abonnement", icon: IconBoltComponent },
    { slug: "invoices", label: "Factures", icon: IconDevisComponent },
  ];
}
