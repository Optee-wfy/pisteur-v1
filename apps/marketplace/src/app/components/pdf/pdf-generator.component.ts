import { AsyncPipe, CurrencyPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  resource,
  signal,
} from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { buildAssetUrl } from "@optee/constants";
import { IconCalendarComponent } from "@optee/icons";
import { Location, Operation } from "@optee/models";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { PrintDirective } from "@optee/ui/directives/print.directive";
import { ToastService } from "@optee/ui/services/toast.service";
import { addMonth, formatZodError, isNotNullish } from "@optee/utils";
import { AutoComplete } from "primeng/autocomplete";
import { DatePicker } from "primeng/datepicker";
import { SelectModule } from "primeng/select";
import { debounceTime, of, switchMap } from "rxjs";
import trpcClient from "../../../trpc-client";
import {
  PDF_TEMPLATES,
  pdfDataValidators,
  PdfTemplateComponents,
  type PdfTemplate,
} from "./pdf.constant";

type OperationHydrated = Awaited<
  ReturnType<typeof trpcClient.operations.getAllByAdmin.query>
>[number];

@Component({
  selector: "mkp-pdf-generator",
  template: `
    <oui-bob heading="Générateur de PDF">
      <div class="flex">
        <aside
          class="bg-primary-50 flex w-full max-w-sm flex-col gap-6 rounded-md p-4"
        >
          <div class="flex flex-col gap-2">
            <p class="text-primary-900 mb-3 text-sm font-medium">
              Sélectionnez l'opération
            </p>
            <p-autocomplete
              class="w-full"
              optionLabel="name"
              (completeMethod)="operationSearchTerm.set($event.query)"
              (onSelect)="activeOperation.set($event.value)"
              [suggestions]="(filteredOperations$ | async) ?? []"
            />
            <span class="text-xs italic text-gray-600">
              La recherche peut être faite par nom d'opération ou par id (ex:
              15708731328)
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <p class="text-primary-900 text-sm font-medium">
              Sélection du template
            </p>
            <p-select
              class="w-full md:w-56"
              appendTo="body"
              placeholder="Sélectionner un template"
              [(ngModel)]="activeTemplate"
              [disabled]="!activeOperation()"
              [group]="true"
              [options]="groupedTemplates"
            >
              <ng-template #group let-group>
                <span class="text-primary-700">{{ group.label }}</span>
              </ng-template>
            </p-select>
          </div>

          @if (activeOperation(); as operation) {
            <div class="flex flex-col gap-2">
              <p class="text-primary-900 text-sm font-medium">
                Date personnalisée
              </p>
              <p-datepicker
                class="block w-full"
                appendTo="body"
                iconDisplay="input"
                required
                showIcon
                [(ngModel)]="selectedDate"
                [minDate]="today"
              >
                <ng-template #inputicon>
                  <icon-calendar class="size-4" colorMode="colored" />
                </ng-template>
              </p-datepicker>
              <p class="text-xs italic text-gray-600">
                Cette date sera réutilisé dans les templates
              </p>
            </div>
            @let templateSlug = activeTemplate()?.slug;
            @if (
              templateSlug &&
              templatesThatRequireProSelection.includes(templateSlug)
            ) {
              <div class="flex flex-col gap-2">
                <p class="text-primary-900 text-sm font-medium">
                  Sélection du Professionnel
                </p>
                <p-select
                  class="w-full md:w-56"
                  appendTo="body"
                  optionLabel="pro.name"
                  placeholder="Sélectionner un pro"
                  [(ngModel)]="activeQuote"
                  [disabled]="!activeOperation()"
                  [options]="relatedProsAndQuotes.value()"
                />
              </div>
            }

            <div class="flex flex-col gap-2">
              <p class="text-primary-900 text-sm font-medium">
                Informations sur l'opération
              </p>
              <div class="flex flex-col gap-3 px-3">
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs text-gray-600">Nom de l'opération</span>
                  <span class="text-primary-900 text-sm font-medium">
                    {{ operation.prestationId }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs text-gray-600">
                    Professionnel associé
                  </span>
                  <span class="text-primary-900 text-sm font-medium">
                    {{
                      activeQuote()?.pro?.name ??
                        operation.pro?.name ??
                        "Non renseigné"
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs text-gray-600">Devis</span>
                  <span class="text-primary-900 text-sm font-medium">
                    Financement
                    {{
                      operation.quote?.fundingAmount
                        | currency: "EUR" : "symbol" : "1.0-0"
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-1">
                  <span class="text-xs text-gray-600">Fiche CEE</span>
                  <span class="text-primary-900 text-sm font-medium">
                    {{ this.ceeFileName() ?? "Aucune fiche" }}
                  </span>
                </div>
              </div>
            </div>
          }
        </aside>
        <!-- Template Preview -->
        <div class="flex w-full flex-col items-center gap-2 px-8 pb-6">
          @if (activeTemplate(); as template) {
            <header
              class="bg-primary-50 flex w-full flex-wrap items-center justify-between gap-4 px-6 py-3"
            >
              <h1 class="text-xl font-semibold">Aperçu du template</h1>
              <oui-button
                ouiPrint
                printSectionId="print-content"
                variant="primary"
                (click)="runTemplateAction()"
                [disabled]="!templateSate().valid"
                [printTitle]="
                  templateSate().documentName ?? 'Document sans titre'
                "
              >
                Générer
              </oui-button>
            </header>
            <div
              class="print-section bg-primary-50 h-full max-h-[60vh] w-full overflow-y-auto rounded p-6 shadow-lg"
              id="print-content"
            >
              @if (activeOperation(); as operation) {
                @let data = templateSate().data;
                @if (!templateSate().valid) {
                  <oui-message
                    class="w-sm mx-auto"
                    severity="error"
                    summary="Informations manquantes"
                  >
                    @for (error of templateSate().errors; track $index) {
                      <span class="text-xs">{{ error }}</span>
                    }
                  </oui-message>
                } @else if (data) {
                  @switch (template.slug) {
                    @case ("contribution-neutral") {
                      @if (
                        templateDataValidators.isNeutralContributionData(data)
                      ) {
                        <mkp-neutral-contribution-template [data]="data" />
                      }
                    }

                    @case ("provision-sdc") {
                      @if (templateDataValidators.isProvisionData(data)) {
                        <mkp-provision-template type="sdc" [data]="data" />
                      }
                    }

                    @case ("provision-deposit") {
                      @if (templateDataValidators.isProvisionData(data)) {
                        <mkp-provision-template type="deposit" [data]="data" />
                      }
                    }

                    @case ("sworn-certificate") {
                      @if (
                        templateDataValidators.isSwornCertificateData(data)
                      ) {
                        <mkp-sworn-certificate-template [data]="data" />
                      }
                    }

                    @default {
                      <p
                        class="text-primary-900 mt-6 text-center text-xl font-semibold"
                      >
                        Ce template n'est pas encore pris en charge .
                      </p>
                    }
                  }
                }
              }
            </div>
            <p
              class="w-full rounded bg-orange-400 px-4 py-2 text-center text-sm text-white"
            >
              Attention ! Cet affichage n'est pas fidèle à 100% au résultat
              final. (les espacements, et taille de police peuvent varier ..)
            </p>
          } @else {
            <div
              class="mx-auto flex max-w-screen-sm flex-col items-center justify-center gap-4"
            >
              <p class="text-primary-900 mb-4 mt-6 text-xl font-semibold">
                Aucun template sélectionné
              </p>
              <p class="text-center italic text-gray-600">
                Sélectionnez une opération et un template pour voir la preview
                associée
              </p>
              <oui-message
                severity="warn"
                summary="A lire avant de générer des PDFs"
              >
                <p>
                  Cette fonctionnalité est disponible
                  <strong>uniquement sur Chrome</strong>
                  . De plus, votre configuration d'impression (cmd + p -> plus
                  de paramètres) doit correspondre à celle ci-dessous:
                </p>
              </oui-message>
              <img
                alt="Paramètres d'impression recommandés"
                [src]="printSettingsPng"
              />
            </div>
          }
        </div>
      </div>
    </oui-bob>
  `,
  imports: [
    BobComponent,
    AutoComplete,
    FormsModule,
    SelectModule,
    AsyncPipe,
    CurrencyPipe,
    MessageComponent,
    ButtonComponent,
    PrintDirective,
    ...PdfTemplateComponents,
    DatePicker,
    IconCalendarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfGeneratorComponent {
  private readonly toastService = inject(ToastService);

  protected readonly operationSearchTerm = signal("");

  printSettingsPng = buildAssetUrl("images/print-settings.png");

  protected readonly filteredOperations$ = toObservable(
    this.operationSearchTerm,
  ).pipe(
    debounceTime(300),
    switchMap((filter) =>
      filter.length > 1
        ? trpcClient.operations.getAllByAdmin.query({ filter })
        : of([]),
    ),
  );

  templatesThatRequireProSelection: PdfTemplate["slug"][] = [
    "contribution-neutral",
    "sworn-certificate",
  ];

  relatedProsAndQuotes = resource({
    params: () => ({
      operationUuid: this.activeOperation()?.uuid,
      activeTemplate: this.activeTemplate(),
    }),
    loader: async ({ params }) => {
      const operationUuid = params.operationUuid;
      if (
        !operationUuid ||
        !params.activeTemplate?.slug ||
        !this.templatesThatRequireProSelection.includes(
          params.activeTemplate?.slug,
        )
      ) {
        return Promise.resolve([]);
      }
      const quotes = await trpcClient.quotes.getAllWithProByOperationUuid.query(
        {
          operationUuid,
        },
      );
      if (quotes.length) {
        this.activeQuote.set(quotes[0]);
      }
      return quotes;
    },
  });

  protected readonly activeOperation = model<OperationHydrated | null>();
  protected readonly activeQuote = model<{
    fundingAmount: number | null;
    pro: { name: string | null } | null;
  }>();

  protected readonly ceeFileName = computed(() => {
    const operation = this.activeOperation();
    if (!operation?.location) {
      return null;
    }
    const location = Location.init(operation.location);

    if (!operation || !location) {
      return null;
    }
    // tricks to avoid type error
    operation.phase = "694365149";
    return (
      Operation.init(operation)?.getCeeFile(location.mainSector)?.name ?? null
    );
  });

  protected readonly groupedTemplates = [...PDF_TEMPLATES];

  protected readonly activeTemplate = model<PdfTemplate | null>();

  protected readonly templateSate = computed<{
    valid: boolean;
    data: unknown;
    errors?: string[];
    documentName?: string;
    action?: (args: any) => Promise<unknown>;
  }>(() => {
    const activeTemplate = this.activeTemplate();
    if (!activeTemplate) {
      return {
        valid: false,
        data: null,
      };
    }

    const selectedDate = this.selectedDate();

    const { data, error } = activeTemplate.requiredParams.safeParse({
      ...this.activeOperation(),
      ceeFile: this.ceeFileName(),
      sendingDate: selectedDate,
      expirationDate: selectedDate ? addMonth(selectedDate, 1) : null,
      pdfId: this.generatePdfId(activeTemplate.slug),
      amount:
        activeTemplate.slug === "provision-deposit"
          ? this.activeOperation()?.amountDownPaymentToBeInvoiced
          : this.activeOperation()?.amountBalanceToBeInvoiced,
      pro: this.activeQuote()?.pro ?? this.activeOperation()?.pro,
      quote: this.activeQuote() ?? this.activeOperation()?.quote,
    });

    const documentName = [
      activeTemplate.documentName,
      this.activeOperation()?.location?.name,
    ]
      .filter(isNotNullish)
      .join(" - ");

    return {
      ...formatZodError(error),
      data: data,
      documentName,
      action: "action" in activeTemplate ? activeTemplate.action : undefined,
    };
  });

  protected readonly today = new Date();
  protected readonly selectedDate = model<Date | null>(this.today);

  protected readonly templateDataValidators = pdfDataValidators;

  async runTemplateAction() {
    const template = this.templateSate();
    if (
      template &&
      "action" in template &&
      template["action"] !== undefined &&
      typeof template.data === "object"
    ) {
      const actionAttempted = "Mise à jour de l'opération";
      try {
        await template.action({
          uuid: this.activeOperation()?.uuid,
          ...template.data,
        });
        this.toastService.open(
          "success",
          actionAttempted,
          "Opération mise à jour avec succès",
        );
      } catch (error) {
        this.toastService.openError(actionAttempted, error);
      }
    }
  }

  private generatePdfId(slug: PdfTemplate["slug"]) {
    const id = this.activeOperation()?.id;
    if (!id) {
      return null;
    }
    switch (slug) {
      case "provision-deposit": {
        return id + Math.floor(Math.random() * 100);
      }
      case "provision-sdc": {
        return id + Math.floor(Math.random() * 100) + 1;
      }
      default: {
        return null;
      }
    }
  }
}
