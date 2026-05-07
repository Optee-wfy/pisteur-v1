import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  CONTACT_PRO_ASSOCIATIONS,
  getMaxSeatsAllowed,
  type ProSubscription,
} from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import { IconRefreshComponent, IconStarComponent } from "@optee/icons";
import type { ProUuid } from "@optee/models";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { isEmailFromOptee } from "@optee/utils";
import { TableModule } from "primeng/table";
import { Tooltip } from "primeng/tooltip";
import { debounceTime, startWith } from "rxjs";
import trpcClient from "../../../../../trpc-client";
import { ProService } from "../../../../services/pro.service";

type AdminContactSearchResult = Awaited<
  ReturnType<typeof trpcClient.contacts.searchForAdmin.query>
>[number];
type ProMemberRow = Awaited<
  ReturnType<typeof trpcClient.pros.getMembers.query>
>[number];
type SetMainContactForAdminInput = Parameters<
  typeof trpcClient.pros.setMainContactForAdmin.mutate
>[0];

@Component({
  selector: "mkp-pro-members",
  host: {
    class: "flex flex-col items-start gap-6",
  },
  template: `
    <header class="flex flex-col items-start justify-center gap-2">
      <h1 class="text-2xl font-semibold">Membres</h1>
      <p class="text-sm text-gray-600">
        Retrouvez ici la liste des membres de votre équipe ayant accès à
        Pisteur.
      </p>
    </header>

    @if (canInviteMembers()) {
      <div class="flex w-full flex-col gap-2">
        <h2 class="text-sm font-medium">Inviter un membre</h2>

        <form
          class="flex w-full gap-2"
          tooltipPosition="bottom"
          [pTooltip]="
            hasReachedMaxMembers()
              ? 'Vous avez atteint le nombre maximum de membres pour votre abonnement.'
              : undefined
          "
        >
          <input
            class="text-granite-900 border-granite-100 hover:border-granite-400 flex-1 shrink rounded-lg border px-2 py-1 text-sm font-medium placeholder-gray-600 transition-all"
            placeholder="email du membre à inviter"
            type="email"
            [disabled]="submitting() || hasReachedMaxMembers()"
            [formControl]="emailInputForm.controls.email"
          />
          <button
            class="prospect-button"
            type="button"
            (click)="inviteMember()"
            [disabled]="
              emailInputForm.invalid || submitting() || hasReachedMaxMembers()
            "
          >
            @if (submitting()) {
              <icon-refresh class="size-4 animate-spin text-white" />
            }
            Inviter
          </button>
        </form>
        <p class="mt-2 text-center text-sm italic text-gray-600">
          @if (maxMembersSeats() > 0) {
            Vous pouvez avoir
            {{ maxMembersSeats() }} membres maximum avec votre abonnement
            actuel.
          } @else {
            Vous ne pouvez pas ajouter de membres avec votre abonnement actuel.
          }
        </p>
      </div>
    }

    @if (canManageMainContact()) {
      <div
        class="flex w-full flex-col gap-3 rounded-lg border border-slate-200 p-3"
      >
        <h2 class="text-sm font-medium">Contact principal</h2>

        @if (currentMainMember(); as currentMain) {
          <p class="text-sm text-gray-600">
            Actuel:
            <span class="font-medium">
              {{ currentMain.contact.firstName }}
              {{ currentMain.contact.lastName }}
            </span>
            ({{ currentMain.contact.email }})
          </p>
        } @else {
          <p class="text-sm text-gray-600">Aucun contact principal défini.</p>
        }

        <div class="flex flex-col gap-2">
          <p class="text-sm font-medium">Depuis les membres du pro</p>
          @if (mainContactCandidates().length === 0) {
            <p class="text-sm text-gray-600">Aucun autre membre disponible.</p>
          } @else {
            <div class="flex flex-wrap gap-2">
              @for (
                member of mainContactCandidates();
                track member.contact.uuid
              ) {
                <button
                  class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  (click)="defineMainContact(member.contact.uuid)"
                  [disabled]="
                    settingMainContactContactUuid() === member.contact.uuid
                  "
                >
                  @if (
                    settingMainContactContactUuid() === member.contact.uuid
                  ) {
                    Définition...
                  } @else {
                    @if (member.contact.firstName || member.contact.lastName) {
                      {{ member.contact.firstName }}
                      {{ member.contact.lastName }}
                    } @else {
                      {{ member.contact.email }}
                    }
                  }
                </button>
              }
            </div>
          }
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-sm font-medium">Rechercher dans la base de contacts</p>
          <input
            class="text-granite-900 border-granite-100 hover:border-granite-400 w-full rounded-lg border px-2 py-1 text-sm font-medium placeholder-gray-600 transition-all"
            placeholder="Nom ou email"
            type="text"
            [formControl]="mainContactSearchControl"
          />

          @let searchTerm = trimmedMainContactSearchTerm();
          @if (searchTerm.length < 2) {
            <p class="text-xs text-gray-500">
              Saisissez au moins 2 caractères pour rechercher.
            </p>
          } @else if (contactSearch.isLoading()) {
            <p class="text-xs text-gray-500">Recherche en cours...</p>
          } @else if (contactSearch.value()?.length === 0) {
            <p class="text-xs text-gray-500">Aucun contact trouvé.</p>
          } @else {
            <div
              class="max-h-56 overflow-auto rounded-md border border-slate-200"
            >
              @for (contact of contactSearchResults(); track contact.uuid) {
                <div
                  class="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
                >
                  <div class="min-w-0">
                    <p class="truncate font-medium">
                      {{ contact.firstName }} {{ contact.lastName }}
                    </p>
                    <p class="truncate text-xs text-gray-600">
                      {{ contact.email ?? "Email non renseigné" }}
                    </p>
                  </div>
                  <button
                    class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    (click)="defineMainContact(contact.uuid)"
                    [disabled]="
                      settingMainContactContactUuid() === contact.uuid
                    "
                  >
                    @if (settingMainContactContactUuid() === contact.uuid) {
                      Définition...
                    } @else {
                      {{
                        isContactAlreadyMember(contact.uuid)
                          ? "Définir principal"
                          : "Associer + définir"
                      }}
                    }
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }

    <div class="flex w-full flex-col gap-2">
      <h2 class="text-sm font-medium">Liste des membres</h2>
      @if (members.isLoading()) {
        <oui-loader label="Chargement des membres..." />
      } @else if (members.value()?.length === 0) {
        <div class="text-sm italic text-gray-600">
          Aucun membre n'a encore rejoint ce compte.
        </div>
      } @else {
        <p-table styleClass="text-sm" [value]="members.value() ?? []">
          <ng-template #header>
            <tr>
              <th class="text-sm">Nom</th>
              <th class="text-sm">Email</th>
              <th class="whitespace-nowrap text-sm">Dernière connexion</th>
              @if (canManageMainContact() || canRemoveTeamMembers()) {
                <th class="text-sm">Action</th>
              }
            </tr>
          </ng-template>
          <ng-template #body let-member>
            <tr>
              <td>
                <div class="flex flex-1 items-center gap-1 text-sm">
                  <span class="font-medium">
                    {{ member.contact.firstName }}
                    {{ member.contact.lastName }}
                  </span>
                  @if (member.role === mainContactId) {
                    <icon-star
                      class="size-4 text-green-500"
                      pTooltip="Contact principal"
                    />
                  }
                </div>
              </td>
              <td class="text-xs text-gray-600">{{ member.contact.email }}</td>
              <td
                class="text-sm"
                [class.text-gray-600]="member.contact.lastSignInAt === null"
              >
                {{
                  member.contact.lastSignInAt
                    ? (member.contact.lastSignInAt | date: "short")
                    : "Jamais connecté"
                }}
              </td>
              @if (canManageMainContact() || canRemoveTeamMembers()) {
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    @if (canManageMainContact()) {
                      @if (member.role === mainContactId) {
                        <span class="text-xs font-medium text-green-700">
                          Principal
                        </span>
                      } @else {
                        <button
                          class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          (click)="defineMainContact(member.contact.uuid)"
                          [disabled]="
                            settingMainContactContactUuid() ===
                              member.contact.uuid ||
                            removingMemberContactUuid() === member.contact.uuid
                          "
                        >
                          @if (
                            settingMainContactContactUuid() ===
                            member.contact.uuid
                          ) {
                            Définition...
                          } @else {
                            Définir principal
                          }
                        </button>
                      }
                    }

                    @if (canRemoveTeamMembers()) {
                      <button
                        class="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        tooltipPosition="left"
                        (click)="confirmAndRemoveMember(member)"
                        [pTooltip]="getRemoveMemberTooltip(member)"
                        [disabled]="
                          removingMemberContactUuid() === member.contact.uuid ||
                          settingMainContactContactUuid() === member.contact.uuid
                        "
                        [class.opacity-60]="isLastMember()"
                        [class.cursor-not-allowed]="isLastMember()"
                      >
                        @if (removingMemberContactUuid() === member.contact.uuid) {
                          Suppression...
                        } @else {
                          Supprimer
                        }
                      </button>
                    }
                  </div>
                </td>
              }
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `,
  imports: [
    IconStarComponent,
    Tooltip,
    ReactiveFormsModule,
    DatePipe,
    TableModule,
    LoaderComponent,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProMembersComponent {
  readonly isAccountOwner = input.required<boolean>();
  readonly canInvite = input<boolean | null>(null);
  readonly canRemoveMembers = input<boolean | null>(null);
  readonly canSetMainContact = input(false);
  readonly proUuid = input<ProUuid | null>(null);
  readonly proSubscription = input<ProSubscription | null>(null);

  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);
  private readonly proService = inject(ProService);

  protected readonly mainContactId = CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id;

  protected readonly emailInputForm = new FormGroup({
    email: new FormControl<string>("", {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ],
    }),
  });

  protected readonly submitting = signal(false);
  protected readonly settingMainContactContactUuid = signal<string | null>(
    null,
  );
  protected readonly removingMemberContactUuid = signal<string | null>(null);

  protected readonly mainContactSearchControl = new FormControl("", {
    nonNullable: true,
  });

  protected readonly mainContactSearchTerm = toSignal(
    this.mainContactSearchControl.valueChanges.pipe(
      debounceTime(250),
      startWith(""),
    ),
  );

  protected readonly trimmedMainContactSearchTerm = computed(() =>
    (this.mainContactSearchTerm() ?? "").trim(),
  );

  protected readonly members = resource({
    params: () => this.proUuid(),
    loader: async ({ params: proUuid }) => {
      try {
        if (proUuid) {
          return trpcClient.pros.getMembersByPro.query({ proUuid });
        }
        return trpcClient.pros.getMembers.query();
      } catch (err) {
        this.toastService.openError("Récupération des membres du compte", err);
        throw err;
      }
    },
  });

  protected readonly canInviteMembers = computed(() => {
    const explicitCanInvite = this.canInvite();
    if (explicitCanInvite !== null) {
      return explicitCanInvite;
    }
    return this.isAccountOwner();
  });

  protected readonly canManageMainContact = computed(
    () => this.canSetMainContact() && !!this.proUuid(),
  );

  protected readonly canRemoveTeamMembers = computed(() => {
    const explicitCanRemove = this.canRemoveMembers();
    if (explicitCanRemove !== null) {
      return explicitCanRemove;
    }
    return this.isAccountOwner();
  });

  protected readonly maxMembersSeats = computed(() => {
    const subscription =
      this.proSubscription() ?? this.proService.subscription();
    if (!subscription) {
      return 0;
    }
    return getMaxSeatsAllowed(subscription);
  });

  protected readonly nonOpteeMembersCount = computed(
    () =>
      (this.members.value() ?? []).filter(
        (member) => !isEmailFromOptee(member.contact.email),
      ).length,
  );

  protected readonly hasReachedMaxMembers = computed(
    () => this.nonOpteeMembersCount() >= this.maxMembersSeats(),
  );

  protected readonly membersCount = computed(() => this.members.value()?.length ?? 0);

  protected readonly currentMainMember = computed(() =>
    (this.members.value() ?? []).find(
      (member) => member.role === this.mainContactId,
    ),
  );

  protected readonly mainContactCandidates = computed(() =>
    (this.members.value() ?? []).filter(
      (member) => member.role !== this.mainContactId,
    ),
  );

  protected readonly memberContactUuidSet = computed(
    () =>
      new Set(
        (this.members.value() ?? []).map(
          (member) => member.contact.uuid as string,
        ),
      ),
  );

  protected readonly contactSearch = resource({
    params: () => {
      const enabled = this.canManageMainContact();
      if (!enabled) {
        return { enabled, term: null as string | null };
      }

      return {
        enabled,
        term: this.trimmedMainContactSearchTerm(),
      };
    },
    loader: async ({ params }) => {
      if (!params.enabled || !params.term || params.term.length < 2) {
        return [] as AdminContactSearchResult[];
      }

      try {
        return await trpcClient.contacts.searchForAdmin.query({
          term: params.term,
          limit: 10,
        });
      } catch (err) {
        this.toastService.openError("Recherche de contacts", err);
        throw err;
      }
    },
  });

  protected readonly contactSearchResults = computed(() => {
    const rows = this.contactSearch.value() ?? [];
    const seen = new Set<string>();

    return rows.filter((row) => {
      const key = row.uuid as string;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  });

  protected isContactAlreadyMember(contactUuid: string) {
    return this.memberContactUuidSet().has(contactUuid);
  }

  protected async inviteMember() {
    const email = this.emailInputForm.controls.email.value.trim();
    if (!email || this.emailInputForm.invalid) {
      return;
    }
    this.submitting.set(true);
    try {
      const targetProUuid = this.proUuid();
      const sent = targetProUuid
        ? await trpcClient.pros.inviteMemberByPro.mutate({
            proUuid: targetProUuid,
            email,
          })
        : await trpcClient.pros.inviteMember.mutate({ email });
      if (sent) {
        this.toastService.open(
          "success",
          "Invitation à rejoindre le compte",
          `Invitation envoyée à ${email} avec succès !`,
        );
        this.emailInputForm.controls.email.setValue("");
        this.members.reload();
      }
    } catch (err) {
      this.toastService.openError("Invitation à rejoindre le compte", err);
    } finally {
      this.submitting.set(false);
    }
  }

  protected async defineMainContact(
    contactUuid: SetMainContactForAdminInput["contactUuid"],
  ) {
    const targetProUuid = this.proUuid();
    if (!targetProUuid || !this.canManageMainContact()) {
      return;
    }

    if (this.settingMainContactContactUuid()) {
      return;
    }

    this.settingMainContactContactUuid.set(contactUuid as string);
    try {
      await trpcClient.pros.setMainContactForAdmin.mutate({
        proUuid: targetProUuid,
        contactUuid,
      });
      this.toastService.open(
        "success",
        "Contact principal mis à jour",
        "Le contact principal a été défini avec succès.",
      );
      await this.members.reload();
    } catch (err) {
      this.toastService.openError("Définition du contact principal", err);
    } finally {
      this.settingMainContactContactUuid.set(null);
    }
  }

  protected async confirmAndRemoveMember(member: ProMemberRow) {
    if (!this.canRemoveTeamMembers()) {
      return;
    }

    if (this.removingMemberContactUuid()) {
      return;
    }

    if (this.isLastMember()) {
      this.toastService.open(
        "warn",
        "Suppression impossible",
        "Impossible de supprimer le dernier membre du compte.",
      );
      return;
    }

    const { res: confirmed } = await this.dialogService.open(
      DialogConfirmationComponent,
      {
        data: {
          icon: "company",
          title: "Supprimer ce membre ?",
          description: this.buildRemoveMemberDescription(member),
          action: "Supprimer le membre",
          cancelButtonLabel: "Annuler",
          actionColor: "danger",
        },
      },
    );

    if (!confirmed) {
      return;
    }

    const contactUuid = member.contact.uuid;
    const contactUuidKey = contactUuid as string;
    this.removingMemberContactUuid.set(contactUuidKey);
    try {
      const targetProUuid = this.proUuid();
      if (targetProUuid) {
        await trpcClient.pros.removeMemberByPro.mutate({
          proUuid: targetProUuid,
          contactUuid,
        });
      } else {
        await trpcClient.pros.removeMember.mutate({
          contactUuid,
        });
      }

      this.toastService.open(
        "success",
        "Membre supprimé",
        member.contact.email ??
          `${member.contact.firstName ?? ""} ${member.contact.lastName ?? ""}`.trim(),
      );
      await this.members.reload();
    } catch (error) {
      this.toastService.openError("Suppression du membre", error);
    } finally {
      this.removingMemberContactUuid.set(null);
    }
  }

  private buildRemoveMemberDescription(member: ProMemberRow) {
    const fullName =
      `${member.contact.firstName ?? ""} ${member.contact.lastName ?? ""}`.trim();
    const identity = fullName || member.contact.email || member.contact.uuid;

    return [
      `Vous allez supprimer définitivement le membre "${identity}".`,
      "",
      "Workflow appliqué :",
      "- Suppression du contact.",
      "- Suppression automatique des associations liées (pro/client/bâtiment).",
      member.role === this.mainContactId
        ? "- Ce membre est actuellement le contact principal."
        : null,
      "",
      "Cette action est irréversible.",
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
  }

  protected isLastMember() {
    return this.membersCount() <= 1;
  }

  protected getRemoveMemberTooltip(member: ProMemberRow) {
    if (this.isLastMember()) {
      return "Impossible de supprimer le dernier membre du compte.";
    }

    if (member.role === this.mainContactId) {
      return "Contact principal: suppression autorisée car d'autres membres existent.";
    }

    return "Supprime ce membre, son contact et ses associations liées.";
  }
}
