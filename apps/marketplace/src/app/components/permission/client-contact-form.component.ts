import { AsyncPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import type { Role } from "@optee/constants";
import {
  CLIENT_ROLES,
  getRoleLabel,
  getRolePermissions,
} from "@optee/constants";
import { StronglyTypedDialog } from "@optee/dialog";
import { IconChevronRightComponent, IconSpinnerComponent } from "@optee/icons";
import type {
  ClientUuid,
  ContactUuid,
  Location,
  LocationUuid,
} from "@optee/models";
import { ButtonIconComponent } from "@optee/ui/components/atoms/button/button-icon/button-icon.component";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { FormFieldComponent } from "@optee/ui/components/molecules/form/form-field/form-field.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { DrawerComponent } from "@optee/ui/components/organisms/drawer/drawer.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isNotNullish, removeDuplicate, sleep } from "@optee/utils";
import { InputText } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectModule } from "primeng/select";
import { SelectButtonModule } from "primeng/selectbutton";
import { TagModule } from "primeng/tag";
import { filter, map, of, shareReplay, startWith, tap } from "rxjs";
import trpcClient from "../../../trpc-client";
import { ClientService } from "../../services/client.service";
import { LocationService } from "../../services/location.service";
import { PermissionService } from "../../services/permission.service";
import { TrackingService } from "../../services/tracking.service";

export type ClientContactEditDto = {
  uuid: ContactUuid;
  firstName: string;
  lastName: string;
  email: string;
  locations: { uuid: LocationUuid; name: string | null }[];
  role: Role | null;
};

@Component({
  selector: "mkp-client-contact-form",
  template: `
    @if (!modalFadedOut()) {
      @let currentContactRole = selectedRole$ | async;
      <oui-drawer hideCloseIcon>
        <div class="flex items-center gap-3" heading>
          <oui-button-icon class="size-8" (click)="close(false)">
            <icon-chevron-right class="size-4 rotate-180 text-gray-600" />
          </oui-button-icon>
          <div class="flex flex-col gap-1">
            <h2 class="text-2xl font-semibold leading-loose">{{ heading }}</h2>
            @if (data.modalType === "edit") {
              <p class="text-sm leading-tight text-gray-600">
                {{ editingContactRole }} ・
                {{ data.contact?.email }}
              </p>
            }
          </div>
        </div>

        <form
          class="flex flex-auto flex-col gap-4"
          (ngSubmit)="submit()"
          [formGroup]="contactForm"
        >
          <!-- Contact Role -->
          <div class="flex flex-col gap-2">
            <oui-form-field
              class="flex-1"
              name="role"
              label="Rôle"
              [control]="contactForm.controls.role"
            >
              <p-selectButton
                class="p-selectButton--expanded"
                optionLabel="labelApp"
                optionValue="slug"
                aria-labelledby="basic"
                [formControl]="contactForm.controls.role"
                [options]="roleOptions()"
              />
            </oui-form-field>

            @if (data.lastAdmin) {
              <oui-message
                severity="warn"
                summary="Vous êtes actuellement le seul administrateur du compte. Pour modifier votre rôle, merci de nommer un autre administrateur au préalable."
              />
            } @else if (!editorHasFullAccessToLocations()) {
              <oui-message
                severity="warn"
                summary="Vous ne pouvez pas modifier le rôle de cet utilisateur car vous n’avez pas accès à l’ensemble des bâtiments de son portefeuille. Rapprochez-vous d’un administrateur pour effectuer ce changement."
              />
            }

            <oui-message
              class="min-h-44 w-full"
              severity="info"
              summary="Droits d'un {{
                currentContactRole?.labelApp?.toLocaleLowerCase()
              }}"
            >
              <span class="text-xs italic">
                {{ currentContactRole?.description }}
              </span>
              <ul class="mt-1 list-inside list-disc">
                @for (
                  permissionDescription of currentContactRole?.summary ?? [];
                  track $index
                ) {
                  <li>
                    {{ permissionDescription }}
                  </li>
                }
              </ul>
            </oui-message>
          </div>

          <!-- First and Last Name -->
          <div class="flex w-full flex-wrap gap-2">
            <oui-form-field
              class="flex-1"
              name="firstName"
              label="Prénom"
              [control]="contactForm.controls.firstName"
            >
              <input
                id="firstName"
                name="firstName"
                fluid
                pInputText
                type="text"
                [formControl]="contactForm.controls.firstName"
              />
            </oui-form-field>

            <oui-form-field
              class="flex-1"
              name="lastName"
              label="Nom"
              [control]="contactForm.controls.lastName"
            >
              <input
                id="lastName"
                name="lastName"
                fluid
                pInputText
                type="text"
                [formControl]="contactForm.controls.lastName"
              />
            </oui-form-field>
          </div>

          <!-- Email -->
          <oui-form-field
            name="email"
            label="Adresse email"
            [control]="contactForm.controls.email"
          >
            <input
              id="email"
              name="email"
              fluid
              pInputText
              type="email"
              [formControl]="contactForm.controls.email"
            />
          </oui-form-field>

          <!-- Contacts Locations -->
          @if (selectedRole$ | async; as selectedRole) {
            <oui-form-field
              name="locations"
              label="Site(s) associé(s)"
              [control]="contactForm.controls.locationUuids"
            >
              @let currentUserLocations = availableLocations();
              @if (selectedRoleIsClientAdmin$ | async) {
                <oui-message class="mt-1" severity="note" summary="Rappel">
                  <span>
                    Les administrateurs de compte gèrent l’ensemble du parc
                    immobilier. Ils sont donc associés à tous les sites.
                  </span>
                </oui-message>
              } @else if (currentUserLocations?.length) {
                <p-multiSelect
                  class="w-full"
                  display="comma"
                  fluid
                  optionDisabled="disabled"
                  optionLabel="name"
                  optionValue="uuid"
                  placeholder="Sélectionner un ou plusieurs sites"
                  selectedItemsLabel="{0} site(s) associé(s)"
                  showClear
                  [formControl]="contactForm.controls.locationUuids"
                  [options]="currentUserLocations ?? []"
                />
              } @else {
                <p class="text-gray-600">
                  Vous devez être associé à un ou plusieurs sites pour y inviter
                  un utilisateur.
                </p>
              }
            </oui-form-field>
          }

          <footer class="mt-auto flex flex-wrap gap-4">
            <oui-button
              class="flex-1"
              full
              variant="outline"
              (click)="close(false)"
            >
              Annuler
            </oui-button>

            <oui-button
              class="flex-1"
              full
              type="submit"
              variant="primary"
              [disabled]="contactForm.invalid || loading()"
            >
              @if (loading()) {
                <icon-spinner
                  class="size-4 animate-spin text-transparent"
                  colorMode="colored"
                />
              }
              {{ data.modalType === "edit" ? "Enregistrer" : "Inviter" }}
            </oui-button>
          </footer>
        </form>
      </oui-drawer>
    }
  `,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    FormFieldComponent,
    SelectModule,
    MultiSelectModule,
    AsyncPipe,
    TagModule,
    InputText,
    IconSpinnerComponent,
    IconChevronRightComponent,
    ButtonIconComponent,
    SelectButtonModule,
    MessageComponent,
    DrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientContactFormComponent extends StronglyTypedDialog<
  {
    contact: ClientContactEditDto | null;
    modalType: "edit" | "invite";
    locationsToSelectFrom?: Location[];
    clientUuid?: ClientUuid;
    lastAdmin?: boolean;
    minimalRole?: Role;
    minimalLocations?: LocationUuid[];
  },
  { email: string } | null
> {
  private readonly toastService = inject(ToastService);
  private readonly locationService = inject(LocationService);
  private readonly clientService = inject(ClientService);
  private readonly permissionService = inject(PermissionService);
  private readonly trackingService = inject(TrackingService);

  protected readonly loading = signal(false);

  protected readonly heading = this.data.contact
    ? `${this.data.contact.firstName} ${this.data.contact.lastName}`
    : "Inviter un nouveau collaborateur";

  private readonly availableLocations$ = this.data.locationsToSelectFrom
    ? of(
        this.data.locationsToSelectFrom?.map((l) => ({
          ...l,
          disabled: this.data.minimalLocations
            ? this.data.minimalLocations.includes(l.uuid)
            : false,
        })) ?? [],
      )
    : this.locationService.allForClient$.pipe(
        map((editorLocationsInput) => {
          const editorLocations = editorLocationsInput.map((location) => ({
            ...location,
            disabled: false,
          }));

          const contactLocations =
            this.data.contact?.locations.map((location) => ({
              ...location,
              disabled: true,
            })) ?? [];
          return removeDuplicate([...editorLocations, ...contactLocations]).map(
            (l) => ({
              ...l,
              disabled: this.data.minimalLocations
                ? this.data.minimalLocations.includes(l.uuid)
                : l.disabled,
            }),
          );
        }),
      );

  protected readonly availableLocations = toSignal(this.availableLocations$, {
    initialValue: [],
  });

  protected readonly editorHasFullAccessToLocations = computed(
    () =>
      (this.data.contact?.locations.length ?? 0) === 0 ||
      !this.availableLocations().some((l) => l.disabled),
  );

  protected readonly contactHasLocations = computed(
    () => this.availableLocations().length > 0,
  );

  protected readonly roleOptions = computed(() =>
    CLIENT_ROLES.filter(({ slug }) => {
      const additionalCheck = this.data.minimalRole
        ? CLIENT_ROLES.findIndex((r) => r.slug === slug) <=
          CLIENT_ROLES.findIndex((r) => r.slug === this.data.minimalRole)
        : true;

      return this.permissionService.can(`INVITE_${slug}`) && additionalCheck;
    }),
  );

  protected readonly editingContactRole = getRoleLabel(this.data.contact?.role);

  protected readonly contactForm = new FormGroup({
    firstName: new FormControl(
      {
        value: this.data.contact?.firstName ?? "",
        disabled: !!this.data.contact,
      },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    lastName: new FormControl(
      {
        value: this.data.contact?.lastName ?? "",
        disabled: !!this.data.contact,
      },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    email: new FormControl(
      { value: this.data.contact?.email ?? "", disabled: !!this.data.contact },
      {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      },
    ),
    role: new FormControl<Role>(
      {
        value: this.data.contact?.role ?? "LOCATION_ADMINISTRATOR",
        disabled:
          !!this.data.lastAdmin || !this.editorHasFullAccessToLocations(),
      },
      {
        nonNullable: true,
        validators: [Validators.required],
      },
    ),
    locationUuids: new FormControl<LocationUuid[]>(
      [
        ...(this.data.contact?.locations?.map((l) => l.uuid) ?? []),
        ...(this.data.minimalLocations ?? []),
      ],
      {
        nonNullable: true,
      },
    ),
  });

  protected readonly selectedRole$ =
    this.contactForm.controls.role.valueChanges.pipe(
      startWith(this.contactForm.controls.role.value),
      map((role) =>
        CLIENT_ROLES.find((roleOption) => roleOption.slug === role),
      ),
      tap((role) => {
        this.contactForm.controls.locationUuids.setValidators(
          role?.slug === "CLIENT_ADMINISTRATOR" ? [] : [Validators.required],
        );
        this.contactForm.controls.locationUuids.updateValueAndValidity();
      }),
      filter(isNotNullish),
      shareReplay(1),
    );

  protected readonly selectedRolePermissions$ = this.selectedRole$.pipe(
    map((role) => getRolePermissions(role.slug)),
    map((permissions) =>
      Array.from(new Set(permissions.map((p) => p.description))),
    ),
  );

  protected readonly selectedLocationsUuids$ =
    this.contactForm.controls.locationUuids.valueChanges.pipe(
      filter(isNotNullish),
      startWith(this.data.contact?.locations?.map((l) => l.uuid) ?? []),
      shareReplay(1),
    );

  protected readonly selectedRoleIsClientAdmin$ = this.selectedRole$.pipe(
    map((role) => role.slug === "CLIENT_ADMINISTRATOR"),
    shareReplay(1),
  );

  protected removeLocation(locationUuid: LocationUuid) {
    const locationUuids = this.contactForm.controls.locationUuids.value;

    if (locationUuids) {
      const newLocationsUuids = locationUuids.filter(
        (lUuid) => lUuid !== locationUuid,
      );

      this.contactForm.controls.locationUuids.setValue(newLocationsUuids);
    }
  }

  protected async submit() {
    this.loading.set(true);
    try {
      if (this.data.modalType === "edit") {
        await this.editContact();
      }
      if (this.data.modalType === "invite") {
        await this.sendInvitation();
      }
    } catch (error) {
      this.toastService.openError(
        `${this.data.modalType === "invite" ? "Invitation" : "Édition"} du contact`,
        error,
      );
    } finally {
      this.clientService.refreshContacts$.next();
      this.loading.set(false);
      this.close(true);
    }
  }

  protected async close(valid: boolean) {
    this.modalFadedOut.set(true);
    await sleep(200);
    this.dialogRef.close(
      valid ? { email: this.contactForm.controls.email.value } : null,
    );
  }

  private async editContact() {
    const actionAttempted = "Édition du contact";

    if (this.data.modalType === "invite") {
      throw new Error("Impossible d'éditer en mode création");
    }

    const { locationUuids, role } = this.contactForm.getRawValue();

    if (!this.data.contact?.uuid) {
      throw new Error(
        "Impossible de trouver l'identifiant du contact à éditer",
      );
    }

    await trpcClient.clients.updateContactRole.mutate({
      contactUuid: this.data.contact.uuid,
      locationUuids: role === "CLIENT_ADMINISTRATOR" ? [] : locationUuids,
      role,
      clientUuid: this.data.clientUuid,
    });

    this.trackingService.trackClient("right_management_update");

    this.toastService.open(
      "success",
      actionAttempted,
      "Le contact a bien été mis à jour.",
    );
  }

  private async sendInvitation() {
    const actionAttempted = "Invitation de contact";

    if (this.data.modalType === "edit") {
      throw new Error("Impossible d'inviter en mode édition");
    }

    const { locationUuids, email, firstName, lastName, role } =
      this.contactForm.getRawValue();

    if (this.contactForm.invalid) {
      throw new Error(
        "Le formulaire semble invalide. Veuillez renseigner tous les champs",
      );
    }

    await trpcClient.clients.sendInvitation.mutate({
      email,
      firstName,
      lastName,
      role,
      locationUuids: role === "CLIENT_ADMINISTRATOR" ? [] : locationUuids,
      clientUuid: this.data.clientUuid,
    });

    this.trackingService.trackClient("right_management_invite");

    this.toastService.open(
      "success",
      actionAttempted,
      "L'invitation a bien été envoyée",
    );

    this.clientService.refreshContacts$.next();

    this.dialogRef.close({ email });
  }
}
