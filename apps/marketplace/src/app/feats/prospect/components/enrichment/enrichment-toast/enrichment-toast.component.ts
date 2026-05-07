import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AssociationProExternalContactType } from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconBoltComponent,
  IconInfoComponent,
  IconSpinnerComponent,
} from "@optee/icons";
import { FakeProgressComponent } from "@optee/ui/components/atoms/fake-progress/fake-progress.component";
import { FullEnrichService } from "../../../../../services/fullenrich.service";
import { EnrichmentExplanationDialogComponent } from "../enrichment-explanation/enrichment-explanation-dialog.component";

@Component({
  selector: "mkp-enrichment-toast",
  host: {
    class: "absolute right-1 top-1 z-10 flex w-full max-w-md  flex-col gap-2",
  },
  template: `
    <!-- Toasts d'enrichissement de contacts -->
    @if (fullEnrichService.activeEnrichments().length > 0) {
      @let enrichments = fullEnrichService.activeEnrichments();
      @let showAll = fullEnrichService.showAllEnrichments();

      <section
        class="border-granite-200 text-granite-900 flex flex-col gap-2 rounded-lg border bg-white px-2 py-1 shadow-lg transition-all"
      >
        <div
          class="border-granite-200 flex items-center justify-between gap-2"
          [class.border-b]="showAll"
          [class.pb-2]="showAll"
        >
          <span
            class="text-granite-900 flex items-center gap-2 text-sm font-medium"
          >
            Enrichissement de contacts
            <button
              class="text-granite-400 hover:bg-granite-100 hover:text-granite-700 bg-granite-50 shrink-0 cursor-pointer rounded-full p-1 transition"
              (click)="openExplanationDialog()"
            >
              <icon-info class="size-3.5" />
            </button>
          </span>
          <button
            class="pister-link !py-1"
            (click)="fullEnrichService.showAllEnrichments.set(!showAll)"
          >
            {{ showAll ? "Masquer" : "Voir tous" }}
          </button>
        </div>

        <div
          class="-mx-1 flex !max-h-60 flex-col gap-4 p-1"
          [class.hidden]="!showAll"
          [class.scrollable-shadow-zone]="enrichments.length > 2"
        >
          @for (enrichment of enrichments; track enrichment.enrichmentId) {
            <section
              class="flex flex-col gap-1"
              (animationend)="
                fullEnrichService.clearActiveEnrichment(enrichment.enrichmentId)
              "
              [class.enrichment-toast--fade]="enrichment.status === 'done'"
            >
              @if (enrichment.legalEntityName) {
                <header
                  class="text-granite-700 flex flex-1 justify-between text-sm font-medium"
                >
                  {{ enrichment.legalEntityName }}
                </header>
              }

              <div
                class="text-granite-500 flex items-center justify-between gap-2 text-sm"
              >
                @let contactsCount = enrichment.contacts.length;
                @let enrichmentType = enrichment.contacts[0]?.type;
                @switch (enrichment.status) {
                  @case ("done") {
                    <div class="flex flex-col gap-1">
                      <span class="flex gap-2">
                        <icon-bolt class="size-4" />
                        <span class="font-medium">
                          Enrichissement terminé !
                        </span>
                      </span>
                      @if (enrichment.result) {
                        @let emailCount = enrichment.result.emailCount;
                        @let phoneCount = enrichment.result.phoneCount;
                        @if (emailCount + phoneCount > 0) {
                          <span class="text-xs">
                            {{ formatEnrichmentResult(emailCount, phoneCount) }}
                          </span>
                        } @else {
                          <span class="text-xs italic">
                            Aucune information n'a pu être enrichie. Aucun
                            crédit n'est débité.
                          </span>
                        }
                      }
                    </div>
                  }
                  @case ("timeout") {
                    <span class="italic">
                      L'enrichissement a pris trop de temps. Si le problème
                      persiste, merci de contacter le support.
                    </span>
                  }
                  @default {
                    <div class="flex items-center gap-2">
                      Enrichissement de {{ contactsCount }}
                      {{
                        getEnrichmentTypeLabel(enrichmentType, contactsCount)
                      }}
                    </div>
                    <div class="flex items-center gap-2">
                      <icon-spinner class="size-4 animate-spin" />
                      <oui-fake-progress />
                    </div>
                  }
                }
              </div>
            </section>
          }
        </div>
      </section>
    }
  `,
  imports: [
    IconBoltComponent,
    IconSpinnerComponent,
    FakeProgressComponent,
    IconInfoComponent,
  ],
  styles: [
    `
      .enrichment-toast--fade {
        animation: enrichmentToastFadeOut 400ms ease forwards;
        animation-delay: 3s;
        will-change: opacity, transform;
      }

      @keyframes enrichmentToastFadeOut {
        to {
          opacity: 0;
          transform: translateY(-6px);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrichmentToastComponent {
  protected readonly fullEnrichService = inject(FullEnrichService);
  protected readonly dialogService = inject(DialogService);

  protected openExplanationDialog() {
    this.dialogService.open(EnrichmentExplanationDialogComponent);
  }

  protected formatEnrichmentResult(
    emailCount: number,
    phoneCount: number,
  ): string {
    const parts: string[] = [];
    if (emailCount > 0) {
      parts.push(`${emailCount} email${emailCount > 1 ? "s" : ""}`);
    }
    if (phoneCount > 0) {
      parts.push(`${phoneCount} téléphone${phoneCount > 1 ? "s" : ""}`);
    }
    return `Résultat : ${parts.join(" et ")} enrichi${emailCount + phoneCount > 1 ? "s" : ""}.`;
  }

  getEnrichmentTypeLabel(
    type: AssociationProExternalContactType | null | undefined,
    count: number,
  ) {
    switch (type) {
      case AssociationProExternalContactType.PHONE:
        return "téléphone" + (count > 1 ? "s" : "");
      case AssociationProExternalContactType.MAIL:
        return "email" + (count > 1 ? "s" : "");
      default:
        return "contact" + (count > 1 ? "s" : "");
    }
  }
}
