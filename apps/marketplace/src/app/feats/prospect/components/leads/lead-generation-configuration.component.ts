import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  model,
  resource,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormsModule } from "@angular/forms";
import { CONTACT_PRO_ASSOCIATIONS } from "@optee/constants";
import {
  IconBoltComponent,
  IconChecklistComponent,
  IconInfoComponent,
} from "@optee/icons";
import { DividerHorizontalComponent } from "@optee/ui/components/atoms/divider/divider-horizontal/divider-horizontal.component";
import { SliderComponent } from "@optee/ui/components/molecules/form/slider/slider.component";
import { Select } from "primeng/select";
import trpcClient from "../../../../../trpc-client";

type ProMember = Awaited<
  ReturnType<typeof trpcClient.pros.getMembers.query>
>[number];

type RecipientOption = {
  email: string;
  isMainContact: boolean;
  label: string;
  name: string;
  value: string;
};

@Component({
  selector: "mkp-lead-generation-configuration",
  host: { class: "flex w-full" },
  template: `
    <section
      class="w-full rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 md:p-6"
    >
      <div class="flex flex-col gap-5">
        <div class="flex items-start gap-4">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-purple-600 shadow-sm"
          >
            <icon-checklist class="size-4 text-white" />
          </div>

          <div class="min-w-0">
            <h2 class="text-primary-900 text-base font-semibold md:text-[1.2rem]">
              Configuration de génération de leads
            </h2>
            <p class="text-granite-400 mt-1 text-sm">
              Paramétrez vos préférences de réception
            </p>
          </div>
        </div>

        <oui-divider-horizontal />

        <div class="mt-1 flex flex-col gap-8">
          <div class="flex flex-col gap-3">
          <label
            class="text-base font-semibold text-purple-900"
            for="lead-generation-recipient-contact"
          >
            Adresse email de réception des leads
          </label>

          <p-select
            class="w-full"
            appendTo="body"
            emptyMessage="Aucun contact avec email disponible"
            inputId="lead-generation-recipient-contact"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisissez un contact lié à ce compte"
            (ngModelChange)="recipientContactUuid.set($event)"
            [loading]="recipientContacts.isLoading()"
            [ngModel]="recipientContactUuid()"
            [options]="recipientOptions()"
          >
            <ng-template #selectedItem let-selectedOption>
              @if (selectedOption) {
                <div class="flex min-w-0 flex-col py-1">
                  <span class="truncate font-semibold text-slate-900">
                    {{ selectedOption.name }}
                  </span>
                  <span class="truncate text-sm text-purple-700">
                    {{ selectedOption.email }}
                  </span>
                </div>
              }
            </ng-template>

            <ng-template #item let-option>
              <div class="flex min-w-0 flex-col py-1">
                <span class="truncate font-semibold text-slate-900">
                  {{ option.name }}
                </span>
                <span class="truncate text-sm text-purple-700">
                  {{ option.email }}
                </span>
              </div>
            </ng-template>
          </p-select>

          @if (recipientContacts.error()) {
            <p class="text-sm text-rose-700">
              Impossible de charger les contacts liés à ce pro.
            </p>
          } @else if (
            !recipientContacts.isLoading() && !recipientOptions().length
          ) {
            <p class="text-sm text-purple-700">
              Aucun contact avec email n'est lié à ce pro pour le moment.
            </p>
          } @else if (selectedRecipient(); as selectedRecipient) {
            <p class="text-sm text-purple-700">
              Les listes de leads seront envoyées à
              <span class="font-semibold text-purple-900">
                {{ selectedRecipient.email }}
              </span>
            </p>
          }
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <article
            class="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm"
          >
            <div class="mb-6 flex items-center justify-between gap-4">
              <span class="text-base font-semibold text-purple-900">
                Nombre de leads à générer
              </span>
              <strong class="text-2xl font-bold text-purple-600">
                {{ leadsToGenerate() }}
              </strong>
            </div>

            <oui-slider
              alwaysActiveMode
              sliderMode="single"
              [control]="leadsToGenerateControl"
              [max]="10"
              [min]="1"
              [showValueLabel]="false"
            />

            <p class="mt-6 text-sm text-purple-700">
              Nombre de leads par envoi
            </p>
          </article>

          <article
            class="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm"
          >
            <div class="mb-6 flex items-center justify-between gap-4">
              <span class="text-base font-semibold text-purple-900">
                Fréquence d'envoi
              </span>
              <strong class="text-2xl font-bold text-purple-600">
                {{ frequency() }}x / semaine
              </strong>
            </div>

            <oui-slider
              alwaysActiveMode
              sliderMode="single"
              [control]="frequencyControl"
              [max]="5"
              [min]="1"
              [showValueLabel]="false"
            />

            <p class="mt-6 text-sm text-purple-700">Envois hebdomadaires</p>
          </article>
        </div>

        <article
          class="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-purple-600"
            >
              <span class="text-lg font-bold text-white">✓</span>
            </div>

            <div class="min-w-0 text-base text-purple-900">
              <p class="font-semibold">Résumé de votre configuration</p>
              <p class="mt-2 text-sm text-purple-700">
                Vous recevrez
                <span class="font-semibold text-purple-900">
                  {{ leadsToGenerate() }} lead(s)
                </span>
                par envoi,
                <span class="font-semibold text-purple-900">
                  {{ frequency() }} fois par semaine
                </span>
                @if (selectedRecipient(); as selectedRecipient) {
                  <span>
                    pour
                    <span class="font-semibold text-purple-900">
                      {{ selectedRecipient.name }}
                    </span>
                    à l'adresse
                    <span class="font-semibold text-purple-900">
                      {{ selectedRecipient.email }}
                    </span>
                  </span>
                }
                . Total estimé :
                <span class="font-semibold text-purple-900">
                  {{ weeklyCredits() }} crédits par semaine
                </span>
                .
              </p>
            </div>
          </div>
        </article>

        <article
          class="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm"
        >
          <div class="mb-6 flex items-start gap-4">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md"
            >
              <icon-bolt class="size-7 text-white" />
            </div>

            <div>
              <h3 class="text-lg font-semibold text-amber-950">
                Coût en crédits
              </h3>
              <p class="mt-1 text-sm text-amber-700">
                1 lead = {{ LEAD_MAIL_COST }} crédits
              </p>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <article class="rounded-2xl border border-amber-200 bg-white p-5">
              <p class="text-sm text-amber-700">Par envoi</p>
              <p class="mt-3 text-3xl font-bold text-amber-600">
                {{ leadsToGenerate() * LEAD_MAIL_COST }}
                <span class="text-lg font-medium text-amber-700">crédits</span>
              </p>
            </article>

            <article class="rounded-2xl border border-amber-200 bg-white p-5">
              <p class="text-sm text-amber-700">Par semaine</p>
              <p class="mt-3 text-3xl font-bold text-orange-600">
                {{ weeklyCredits() }}
                <span class="text-lg font-medium text-orange-700">crédits</span>
              </p>
            </article>

            <article class="rounded-2xl border border-amber-200 bg-white p-5">
              <p class="text-sm text-amber-700">Par mois (~4 semaines)</p>
              <p class="mt-3 text-3xl font-bold text-orange-700">
                {{ monthlyCredits() }}
                <span class="text-lg font-medium text-orange-800">crédits</span>
              </p>
            </article>
          </div>

          <div class="mt-6 rounded-2xl border border-amber-200 bg-white p-4">
            <div class="flex items-center gap-3 text-amber-900">
              <icon-info class="size-5 shrink-0 text-amber-600" />
              <p class="text-sm text-amber-800">
                <span class="font-semibold">Important :</span>
                Vos crédits seront consommés automatiquement à chaque génération
                de leads. Assurez-vous d'avoir suffisamment de crédits avant de
                lancer la génération.
              </p>
            </div>
          </div>
        </article>
        </div>
      </div>
    </section>
  `,
  imports: [
    FormsModule,
    DividerHorizontalComponent,
    Select,
    SliderComponent,
    IconBoltComponent,
    IconChecklistComponent,
    IconInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeadGenerationConfigurationComponent {
  protected readonly LEAD_MAIL_COST = 10;
  readonly recipientContactUuid = model<string | null>(null);
  readonly recipientEmail = model("");
  readonly leadsToGenerate = model(7);
  readonly frequency = model(3);

  protected readonly leadsToGenerateControl = new FormControl<number | null>(7);
  protected readonly frequencyControl = new FormControl<number | null>(3);
  protected readonly recipientContacts = resource({
    params: () => true,
    loader: () => trpcClient.pros.getMembers.query(),
  });

  protected readonly recipientOptions = computed<RecipientOption[]>(() =>
    (this.recipientContacts.value() ?? [])
      .filter((member) => !!member.contact.email)
      .map((member) => this.mapMemberToRecipientOption(member)),
  );

  protected readonly selectedRecipient = computed(() => {
    const selectedRecipientContactUuid = this.recipientContactUuid();
    const selectedRecipientEmail = this.recipientEmail();
    const options = this.recipientOptions();

    if (selectedRecipientContactUuid) {
      return (
        options.find(
          (option) => option.value === selectedRecipientContactUuid,
        ) ?? null
      );
    }

    if (selectedRecipientEmail) {
      return (
        options.find((option) => option.email === selectedRecipientEmail) ??
        null
      );
    }

    return null;
  });

  protected readonly weeklyCredits = computed(
    () => this.leadsToGenerate() * this.frequency() * this.LEAD_MAIL_COST,
  );

  protected readonly monthlyCredits = computed(() => this.weeklyCredits() * 4);

  constructor() {
    this.leadsToGenerateControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (typeof value === "number") {
          this.leadsToGenerate.set(value);
        }
      });

    this.frequencyControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (typeof value === "number") {
          this.frequency.set(value);
        }
      });

    effect(() => {
      const leadsToGenerate = this.leadsToGenerate();
      if (this.leadsToGenerateControl.value !== leadsToGenerate) {
        this.leadsToGenerateControl.setValue(leadsToGenerate, {
          emitEvent: false,
        });
      }
    });

    effect(() => {
      const frequency = this.frequency();
      if (this.frequencyControl.value !== frequency) {
        this.frequencyControl.setValue(frequency, { emitEvent: false });
      }
    });

    effect(() => {
      const selectedRecipient = this.selectedRecipient();
      if (selectedRecipient) {
        if (this.recipientContactUuid() !== selectedRecipient.value) {
          this.recipientContactUuid.set(selectedRecipient.value);
        }
        if (this.recipientEmail() !== selectedRecipient.email) {
          this.recipientEmail.set(selectedRecipient.email);
        }
        return;
      }

      const availableRecipients = this.recipientOptions();
      if (availableRecipients.length === 0) {
        if (this.recipientContactUuid() !== null) {
          this.recipientContactUuid.set(null);
        }
        if (this.recipientEmail() !== "") {
          this.recipientEmail.set("");
        }
        return;
      }

      const defaultRecipient =
        availableRecipients.find((option) => option.isMainContact) ??
        availableRecipients[0];

      if (defaultRecipient) {
        this.recipientContactUuid.set(defaultRecipient.value);
        this.recipientEmail.set(defaultRecipient.email);
      }
    });
  }

  private mapMemberToRecipientOption(member: ProMember): RecipientOption {
    const fullName = [member.contact.firstName, member.contact.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const email = member.contact.email ?? "";
    const isMainContact =
      member.role === CONTACT_PRO_ASSOCIATIONS.MAIN_CONTACT.id;
    const name = fullName || email;

    return {
      email,
      isMainContact,
      label: isMainContact ? `${name} (contact principal)` : name,
      name,
      value: member.contact.uuid,
    };
  }
}
