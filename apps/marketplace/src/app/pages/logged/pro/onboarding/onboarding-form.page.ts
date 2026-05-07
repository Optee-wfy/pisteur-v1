import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { contactEmail, REQUIRED_FILES_LABELS } from "@optee/constants";
import { DialogConfirmationComponent, DialogService } from "@optee/dialog";
import {
  IconRegisteredDocumentComponent,
  IconSuccessComponent,
} from "@optee/icons";
import { CircleComponent } from "@optee/ui/components/atoms/circle/circle.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { combineLatest } from "rxjs";
import { z } from "zod";
import { ContactService } from "../../../../services/contact.service";
import { ProService } from "../../../../services/pro.service";

export const ContactSchemaValid = z.object({
  firstName: z.string(),
  lastName: z.string(),
  jobTitle: z.string().nullish(),
  phone: z.string(),
  email: z.string(),
});

export const CompanySchemaValid = z.object({
  name: z.string(),
  street: z.string(),
  zipcode: z.string(),
  city: z.string(),
  siret: z.string(),
  mailContact: z.string().nullish(),
  phoneContact: z.string().nullish(),
  description: z.string().nullish(),
  website: z.string().nullish(),
  interventionZones: z.string(),
});

export const ExpertiseSchemaValid = z.object({
  interventionSectors: z.string(),
  prestations: z.string(),
  eligibilityCee: z.boolean(),
});

export const DocumentsSchemaValid = z
  .enum(REQUIRED_FILES_LABELS)
  .array()
  .length(REQUIRED_FILES_LABELS.length);

enum Tab {
  GENERAL_INFO = "general_info",
  COMPANY = "company",
  EXPERTISE = "expertise",
  DOCUMENTS = "documents",
}

const INITIAL_TABS = [
  {
    type: Tab.GENERAL_INFO,
    label: "Informations",
    isCompleted: false,
    schema: ContactSchemaValid,
  },
  {
    type: Tab.COMPANY,
    label: "Entreprise",
    isCompleted: false,
    schema: CompanySchemaValid,
  },
  {
    type: Tab.EXPERTISE,
    label: "Expertises",
    isCompleted: false,
    schema: ExpertiseSchemaValid,
  },
  {
    type: Tab.DOCUMENTS,
    label: "Documents",
    isCompleted: false,
    schema: DocumentsSchemaValid,
  },
];

@Component({
  selector: "mkp-pro-onboarding-form",
  host: {
    class: "flex flex-wrap gap-6 max-w-app m-auto justify-center my-8",
  },
  template: `
    <oui-bob class="flex w-full max-w-screen-lg lg:w-fit">
      <div class="flex w-[800px] gap-10 md:p-10">
        <div class="flex shrink-0 flex-col items-start gap-2">
          @for (tab of TABS(); track $index) {
            <a
              class="hover:bg-primary-50 font-display flex h-12 w-full select-none items-center justify-between gap-2 rounded-2xl px-6 text-center font-medium transition-all"
              (click)="handleTabClick($index)"
              [class.bg-primary-50]="selectedTab() === tab.type"
              [class.cursor-not-allowed]="!canNavigateToTab($index)"
              [class.cursor-pointer]="canNavigateToTab($index)"
              [class.opacity-50]="!canNavigateToTab($index)"
              [class.text-primary-700]="selectedTab() === tab.type"
            >
              {{ tab.label }}
              @if (tab.isCompleted) {
                <icon-success class="size-4" colorMode="colored" />
              }
            </a>
          }
        </div>

        <!-- @if (contactService.self$ | async; as contact) {
          @let pro = proService.pro$ | async;
          @switch (selectedTab()) {
            @case (Tab.COMPANY) {
              <mkp-pro-company-form
                (formSubmitted)="goToNextTab(Tab.COMPANY)"
                [contact]="contact"
                [pro]="pro"
              />
            }
            @case (Tab.EXPERTISE) {
              <mkp-pro-expertise-form
                (formSubmitted)="goToNextTab(Tab.EXPERTISE)"
                [pro]="pro"
              />
            }
            @case (Tab.DOCUMENTS) {
              <mkp-pro-onboarding-form-documents
                (formSubmitted)="goToNextTab(Tab.DOCUMENTS)"
                [pro]="pro"
              />
            }
            @default {
              <mkp-pro-onboarding-form-general-info
                (formSubmitted)="goToNextTab(Tab.GENERAL_INFO)"
                [contact]="contact"
              />
            }
          }
        } -->
      </div>
    </oui-bob>
    <div
      class="bg-primary-700 relative h-fit w-72 overflow-hidden rounded-[2rem]"
    >
      <oui-circle
        class="-right-20 -top-36 z-10 size-64 rotate-180"
        theme="light"
      />

      <div class="relative z-20 flex flex-col justify-center gap-8 p-6">
        <div class="align-start flex flex-col gap-4 text-center">
          <h3 class="font-display text-lg font-bold text-white">
            Bienvenue chez Optee !
          </h3>
          <p class="text-sm text-white">
            Complétez vos informations pour accéder aux opportunités et
            rejoindre le réseau Optee. Une question ? Notre équipe est là pour
            vous aider.
          </p>
        </div>
        <icon-registered-document
          class="m-auto size-5/12 text-white lg:size-7/12"
        />
        <a
          class="text-center text-sm font-medium text-white underline underline-offset-1"
          href="mailto:{{ email }}"
        >
          Contacter Optee
        </a>
      </div>
    </div>
  `,
  imports: [
    BobComponent,
    IconRegisteredDocumentComponent,
    IconSuccessComponent,
    CircleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OnboardingProFormComponent {
  protected readonly contactService = inject(ContactService);
  protected readonly proService = inject(ProService);
  protected readonly dialogService = inject(DialogService);

  protected readonly email = contactEmail;

  protected readonly selectedTab = signal(Tab.GENERAL_INFO);

  protected readonly formSource = toSignal(
    combineLatest([this.contactService.self$, this.proService.pro$]),
  );

  protected readonly Tab = Tab;
  protected readonly TABS = linkedSignal(() => {
    const sources = this.formSource();
    if (!sources) {
      return INITIAL_TABS;
    }

    const [contactInfo, proInfo] = sources;

    const dataMap = {
      [Tab.GENERAL_INFO]: contactInfo,
      [Tab.COMPANY]: proInfo,
      [Tab.EXPERTISE]: proInfo,
      [Tab.DOCUMENTS]: {},
    };

    return INITIAL_TABS.map((tab) => {
      const validationResult = tab.schema.safeParse(dataMap[tab.type]);
      return { ...tab, isCompleted: validationResult.success };
    });
  });

  goToNextTab(currentTab: Tab): void {
    const tabs = this.TABS();
    const updatedTabs = tabs.map((t) =>
      t.type === currentTab ? { ...t, isCompleted: true } : t,
    );
    this.TABS.set(updatedTabs);

    const currentIndex = tabs.findIndex(
      (tab) => tab.type === this.selectedTab(),
    );
    if (currentIndex < tabs.length - 1) {
      const tab = tabs[currentIndex + 1];
      if (tab) {
        this.selectedTab.set(tab.type);
      }
    }
  }

  canNavigateToTab(index: number) {
    const tabs = this.TABS();
    if (index === 0) {
      return true;
    }

    const previousTabsCompleted = tabs
      .slice(0, index)
      .every((tab) => tab.isCompleted);

    return previousTabsCompleted;
  }

  async handleTabClick(index: number): Promise<void> {
    const tabs = this.TABS();
    const targetTab = tabs[index];
    const currentTab = this.selectedTab();

    if (!targetTab || targetTab.type === currentTab) {
      return;
    }

    if (currentTab === Tab.DOCUMENTS) {
      try {
        const result = await this.dialogService.open(
          DialogConfirmationComponent,
          {
            data: {
              title: "Attention",
              description:
                "Si vous quittez cette page maintenant, les documents déjà importés seront perdus. Pour les enregistrer, veuillez importer tous les documents obligatoires et cliquer sur “Créer mon compte”.",
              cancelButtonLabel: "Rester sur la page",
              action: "Changer d’onglet",
              reverse: true,
            },
          },
        );

        if (!result.res) {
          return;
        }
      } catch (error) {
        console.error("Error opening confirmation dialog:", error);
        return;
      }
    }

    const canNavigate = this.canNavigateToTab(index);

    if (canNavigate) {
      this.selectedTab.set(targetTab.type);
    }
  }
}
