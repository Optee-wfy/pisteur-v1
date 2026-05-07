import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import type { Role } from "@optee/constants";
import { CLIENT_ROLES } from "@optee/constants";
import { DialogService, StronglyTypedDialog } from "@optee/dialog";
import { IconChevronRightComponent, IconPlusComponent } from "@optee/icons";
import type { ClientUuid, Contact } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { SearchInputComponent } from "@optee/ui/components/molecules/form/search-input/search-input.component";
import { DrawerComponent } from "@optee/ui/components/organisms/drawer/drawer.component";
import { isEmailFromOptee, isNotNullish, sleep } from "@optee/utils";
import { TabsModule } from "primeng/tabs";
import type { Observable } from "rxjs";
import { combineLatest, map, shareReplay, tap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ClientService } from "../../services/client.service";
import { ContactService } from "../../services/contact.service";
import { LocationService } from "../../services/location.service";
import { PermissionService } from "../../services/permission.service";
import { TrackingService } from "../../services/tracking.service";
import { ClientContactFormComponent } from "./client-contact-form.component";

type RoleGroup = {
  role: Role | null;
  contacts: (Contact & { editable?: boolean })[];
};

@Component({
  selector: "mkp-right-management-form",
  template: `
    @if (!modalFadedOut()) {
      <oui-drawer (closed)="close()">
        <div class="flex flex-col gap-1" heading>
          <h2 class="text-2xl font-semibold leading-loose">
            Gestion des droits
          </h2>
          <p class="text-sm leading-tight text-gray-600">
            Gérez les rôles et les accès à la gestion des bâtiments de votre
            parc.
          </p>
        </div>

        <nav class="flex min-h-11 items-start justify-between gap-4">
          <oui-search-input
            class="h-full"
            full
            placeholder="Rechercher un contact"
            [(activeSearchTerm)]="activeSearchTerm"
          />

          @if (permissionService.canInviteAnyone()) {
            <oui-button variant="primary" (click)="openInvitationModal()">
              <icon-plus class="size-4" />
              Inviter
            </oui-button>
          }
        </nav>

        @let groupByRole = filteredGroup();

        @if (!groupByRole.length) {
          <p class="py-3 text-center text-lg font-medium">
            Chargement des membres du compte.
          </p>
        }

        <p-tabs class="flex-auto" scrollable [(value)]="currentTab">
          <p-tablist>
            @for (group of groupByRole; track $index) {
              <p-tab [value]="group.role ?? noRole">
                {{ (group.role ?? noRole) + (!!group.role ? "s" : "") }}
                <span
                  class="ml-2 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600"
                  [class.bg-gray-300]="currentTab() === group.role"
                >
                  {{ group.contacts.length }}
                </span>
              </p-tab>
            }
          </p-tablist>

          <div class="relative flex-auto">
            <p-tabpanels class="absolute inset-0 -mx-3 h-full overflow-y-auto">
              @for (group of groupByRole; track group.role) {
                <p-tabpanel [value]="group.role ?? noRole">
                  <div class="flex flex-col gap-2">
                    @for (contact of group.contacts; track contact.uuid) {
                      @let canEditContact =
                        (currentUserContact()?.uuid === contact.uuid &&
                          contact.role !== "LOCATION_VIEWER") ||
                        contact.editable;
                      <div
                        class="bg-primary-50 hover:bg-primary-100 flex justify-between rounded-lg px-4 py-2 text-gray-600"
                        (click)="
                          canEditContact
                            ? openEditContactModal(
                                contact,
                                contact.userUuid ? 'edit' : 'invite'
                              )
                            : null
                        "
                        [class.cursor-pointer]="canEditContact"
                      >
                        <label class="text-primary-900">
                          {{ contact.firstName }} {{ contact.lastName }}
                        </label>

                        <div class="inline-flex items-center gap-2 text-xs">
                          @if (contact.role === "CLIENT_ADMINISTRATOR") {
                            <span>Tous les sites</span>
                          } @else {
                            @if (
                              contact.locations.length;
                              as contactLocations
                            ) {
                              <span>
                                {{
                                  contactLocations +
                                    " " +
                                    (contactLocations > 1 ? "sites" : "site")
                                }}
                              </span>
                            } @else {
                              <span>Aucun site</span>
                            }
                          }

                          @if (canEditContact) {
                            <icon-chevron-right class="size-4" />
                          }
                        </div>
                      </div>
                    }
                  </div>
                </p-tabpanel>
              }
            </p-tabpanels>
          </div>
        </p-tabs>
      </oui-drawer>
    }
  `,
  imports: [
    IconPlusComponent,
    IconChevronRightComponent,
    ButtonComponent,
    DrawerComponent,
    FormsModule,
    SearchInputComponent,
    TabsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightManagementFormComponent extends StronglyTypedDialog<
  { clientUuid?: ClientUuid } | null,
  boolean
> {
  protected readonly dialogService = inject(DialogService);
  protected readonly contactService = inject(ContactService);
  protected readonly clientService = inject(ClientService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly trackingService = inject(TrackingService);
  protected readonly authService = inject(AuthService);
  protected readonly locationService = inject(LocationService);

  protected readonly noRole = "Sans rôle";
  protected readonly currentTab = signal(this.noRole);

  protected readonly activeSearchTerm = signal("");
  protected readonly filteredGroup = computed(() =>
    this.contactsGroupedByRole().map((group) => ({
      ...group,
      contacts: group.contacts.filter((contact) =>
        [contact.firstName, contact.lastName, contact.email]
          .map((s) => s?.toLocaleLowerCase())
          .filter(isNotNullish)
          .some((s) => s.includes(this.activeSearchTerm().toLocaleLowerCase())),
      ),
    })),
  );

  protected readonly clientHasOnlyOneAdmin = computed(
    () =>
      this.filteredGroup().find(
        (group) => group.role === "CLIENT_ADMINISTRATOR",
      )?.contacts.length === 1,
  );

  private readonly trackEffect = effect(() => {
    this.trackingService.trackClient("right_management_open");
  });

  private readonly syncTabsWithFilteredGroups = effect(() => {
    const sorted = [...this.filteredGroup()].sort(
      (a, b) => b.contacts.length - a.contacts.length,
    );
    if (this.activeSearchTerm() && this.activeSearchTerm().length > 0) {
      if (sorted.length > 0) {
        this.currentTab.set(sorted[0]?.role ?? this.currentTab());
      }
    } else {
      this.currentTab.set(this.filteredGroup()[0]?.role ?? this.noRole);
    }
  });

  private readonly contactsGroupedByRole$: Observable<RoleGroup[]> =
    combineLatest([
      this.clientService.contacts$,
      this.locationService.allForClient$,
    ]).pipe(
      map(([contacts, locations]) => {
        contacts = contacts
          .filter((contact) => !isEmailFromOptee(contact.email))
          .filter(
            (contact) =>
              contact.role === "CLIENT_ADMINISTRATOR" ||
              locations
                .map((l) => l.uuid)
                .some((uuid) => contact.locations.some((l) => l.uuid === uuid)),
          )
          .map((contact) => {
            return {
              ...contact,
              editable: !contact.role
                ? this.permissionService.can("INVITE_CONTACT_WITHOUT_RIGHTS")
                : this.permissionService.can(
                    `CONTACT_UPDATE_${contact.role}_RIGHTS`,
                  ),
            };
          });

        const contactGroupedObject = contacts.reduce<Record<string, Contact[]>>(
          (groups, contact) => {
            const roleLabel =
              contact.role &&
              CLIENT_ROLES.find(
                (roleOption) => roleOption.slug === contact.role,
              )?.labelApp;
            const groupKey = roleLabel || this.noRole;
            groups[groupKey] = groups[groupKey] || [];

            groups[groupKey].push(contact);
            return groups;
          },
          {},
        );

        // Transform to array and sort by ROLES order putting contacts without role at the end.
        return Object.keys(contactGroupedObject)
          .map((role) => ({
            role: role as Role,
            contacts: contactGroupedObject[role] ?? [],
          }))
          .sort((a, b) => {
            const aIndex = CLIENT_ROLES.findIndex(
              (option) => option.labelApp === a.role,
            );
            const bIndex = CLIENT_ROLES.findIndex(
              (option) => option.labelApp === b.role,
            );

            // If a role is not found, it should be placed at the end
            if (aIndex === -1) {
              return 1;
            }
            if (bIndex === -1) {
              return -1;
            }
            return aIndex - bIndex;
          });
      }) ?? [],
      tap((data) =>
        this.currentTab.set(data[0]?.role ?? "CLIENT_ADMINISTRATOR"),
      ),
      shareReplay(1),
    );

  private readonly contactsGroupedByRole = toSignal(
    this.contactsGroupedByRole$,
    { initialValue: [] },
  );

  protected readonly currentUserContact = toSignal(this.authService.contact$, {
    initialValue: null,
  });

  protected async openEditContactModal(
    contact: Contact & { editable?: boolean },
    modalType: "edit" | "invite",
  ) {
    const contactDto = {
      uuid: contact.uuid,
      email: contact.email || "",
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      role: contact.role || null,
      locations:
        contact.locations.map((l) => ({ uuid: l.uuid, name: l.name })) || [],
    };
    this.modalFadedOut.set(true);

    await this.dialogService.open(ClientContactFormComponent, {
      data: {
        contact: contactDto,
        modalType,
        lastAdmin: this.clientHasOnlyOneAdmin(),
      },
    });

    this.modalFadedOut.set(false);
  }

  protected async openInvitationModal() {
    this.modalFadedOut.set(true);
    await this.dialogService.open(ClientContactFormComponent, {
      data: { contact: null, modalType: "invite" },
    });
    this.modalFadedOut.set(false);
  }

  protected async close() {
    this.modalFadedOut.set(true);
    await sleep(200);
    this.dialogRef.close(null);
  }
}
