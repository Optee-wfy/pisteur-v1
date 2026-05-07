import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  resource,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  IconSearchComponent,
  IconSpinnerComponent,
  IconUpdateComponent,
} from "@optee/icons";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { LoaderComponent } from "@optee/ui/components/molecules/pister-loader/loader.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { ToastService } from "@optee/ui/services/toast.service";
import { Checkbox } from "primeng/checkbox";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { InputText } from "primeng/inputtext";
import { Select } from "primeng/select";
import { debounceTime, startWith } from "rxjs";
import trpcClient from "../../../trpc-client";
import { ContactRowComponent } from "./contact-row.component";

@Component({
  selector: "mkp-contacts-list-admin",
  template: `
    <oui-bob heading="Contacts ({{ target() }})">
      <div class="flex items-start justify-between gap-4 py-2">
        <p-iconfield class="mb-3 max-w-screen-sm flex-1">
          <p-inputicon class="size-4">
            <icon-search />
          </p-inputicon>

          <input
            class="p-inputnumber-gray"
            fluid
            pInputText
            placeholder="Rechercher par mot clé"
            role="searchbox"
            type="search"
            variant="filled"
            [formControl]="searchControl"
          />
        </p-iconfield>

        <div class="flex gap-4" postTitle>
          <div>
            <p-select
              appendTo="body"
              placeholder="Sélectionnez une limite"
              [(ngModel)]="contactListLimit"
              [options]="limitOptions"
            />
          </div>

          <div>
            <p-checkbox
              inputId="multiple-assoc"
              [(ngModel)]="duplicatedAssociations"
              [binary]="true"
            />
            <label
              class="ml-2 text-sm text-gray-600"
              for="multiple-assoc"
              pTooltip="Cette option permet de filtrer les contacts qui ont des associations en double au niveau du compte ou des bâtiments associés."
            >
              Contacts avec
              <br />
              associations multiples
            </label>
          </div>

          <oui-button
            variant="primary"
            (click)="cleanupAssociations()"
            [class.hidden]="!duplicatedAssociations()"
            [disabled]="cleaningDuplicates()"
          >
            @if (cleaningDuplicates()) {
              <icon-spinner class="mr-2 size-6 animate-spin" />
            } @else {
              <icon-update class="mr-2 size-6" />
            }
            Nettoyer les associations
          </oui-button>
        </div>
      </div>

      @if (contactsResource.isLoading()) {
        <oui-loader label="Chargement des contacts..." />
      } @else {
        @let rows = contactsResource.value();
        @if (rows?.length) {
          <table class="w-full table-fixed border-separate border-spacing-y-4">
            <thead
              class="font-display text-left text-sm tracking-tight text-gray-600"
            >
              <tr>
                <th class="max-w-80 px-2">Nom</th>
                <th class="max-w-80 px-2">Compte</th>
                <th class="max-w-80 px-2">Connexion</th>
                <th class="w-44">Actions</th>
              </tr>
            </thead>

            <tbody>
              @for (row of rows; track row.contact.uuid) {
                <mkp-contact-row
                  class="w-full"
                  [client]="row.client"
                  [contact]="row.contact"
                  [duplicatedAssociations]="row.hasDuplicatedAssociations"
                  [pro]="row.pro"
                  [role]="row.role"
                  [user]="row.user"
                />
              }
            </tbody>
          </table>
        } @else {
          @if (contactsResource.error(); as error) {
            <oui-message
              severity="error"
              summary="Une erreur est survenue lors de la récupération des contacts"
            >
              {{ error }}
            </oui-message>
          } @else {
            <p class="text-primary-900 text-center text-lg">
              {{
                searchControl.value || duplicatedAssociations()
                  ? "Aucun contact trouvé avec les filtres appliqués ..."
                  : "Aucun contact disponible ... "
              }}
              🤔
            </p>
          }
        }
      }
    </oui-bob>
  `,
  imports: [
    ReactiveFormsModule,
    BobComponent,
    IconField,
    IconSearchComponent,
    InputIcon,
    InputText,
    ContactRowComponent,
    MessageComponent,
    ButtonComponent,
    IconUpdateComponent,
    FormsModule,
    Checkbox,
    Select,
    IconSpinnerComponent,
    LoaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactsListAdminComponent {
  target = input.required<"pros" | "clients">();

  protected readonly searchControl = new FormControl("");

  protected readonly toastService = inject(ToastService);

  protected readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(400), startWith("")),
  );

  readonly duplicatedAssociations = signal(false);
  readonly cleaningDuplicates = signal(false);
  readonly contactListLimit = model(50);

  limitOptions = [
    { label: "50 contacts", value: 50 },
    { label: "100 contacts", value: 100 },
    { label: "150 contacts", value: 150 },
    { label: "200 contacts", value: 200 },
    { label: "250 contacts", value: 250 },
    { label: "300 contacts", value: 300 },
    { label: "350 contacts", value: 350 },
    { label: "400 contacts", value: 400 },
    { label: "450 contacts", value: 450 },
    { label: "500 contacts", value: 500 },
  ];

  protected readonly contactsResource = resource({
    params: () => ({
      term: this.searchTerm(),
      target: this.target(),
      duplicatedAssociations: this.duplicatedAssociations(),
      limit: this.contactListLimit(),
    }),
    loader: async ({ params }) => {
      if (params.target === "pros") {
        const res = await trpcClient.contacts.getAllWithPro.query(params);

        return res.map((row) => ({
          ...row,
          hasDuplicatedAssociations: false,
          role: null,
          client: null,
        }));
      }

      const res =
        await trpcClient.contacts.getAllWithClientAndAssociations.query(params);

      return res.map((row) => ({
        ...row,
        pro: null,
      }));
    },
  });

  async cleanupAssociations() {
    this.cleaningDuplicates.set(true);
    const contextMessage = "Nettoyage des associations des contacts";
    try {
      const res =
        await trpcClient.contacts.cleanupDuplicatedAssociations.query();
      this.toastService.open("success", contextMessage, res);
      this.contactsResource.reload();
    } catch (error) {
      this.toastService.openError(contextMessage, error);
    } finally {
      this.cleaningDuplicates.set(false);
    }
  }
}
