import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { ButtonComponent } from "@optee/ui/components/atoms/button/button/button.component";

type ImpactedPro = {
  proUuid: string;
  proName: string | null;
  nbRelationsWithAffectedLocations: number;
  nbAffectedLocations: number;
  nbRelationsOnDeletedLocations: number;
  nbDeletedLocationsRelated: number;
};

type DeleteSuccessResult = {
  status: "deleted";
  legalEntity: {
    uuid: string;
    name: string | null;
  };
  cleanup: {
    affectedLocationsCount: number;
    removedLegalEntityLocationRelationsCount: number;
    deletedLocationsCount: number;
    retainedLocationsCount: number;
    removedProLocationRelationsCount: number;
    removedProLegalEntityRelationsCount: number;
    removedProLegalEntityProsCount: number;
  };
  impactedPros: ImpactedPro[];
};

type LegalEntityDeleteResultDialogData = DeleteSuccessResult;

@Component({
  selector: "mkp-legal-entity-delete-result-dialog",
  template: `
    <op-dialog-wrapper
      class="!max-h-[90vh] !max-w-3xl"
      (crossClick)="dialogRef.close(undefined)"
    >
      <op-dialog-heading heading="Suppression effectuée">
        <p class="text-sm text-slate-600">
          Personne morale :
          <strong>{{ data.legalEntity.name ?? "NC" }}</strong>
        </p>
      </op-dialog-heading>

      <div class="space-y-4">
        <section class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <article class="rounded-xl border border-slate-200 bg-white p-3">
            <p class="text-xs text-slate-500">Bâtiments impactés</p>
            <p class="text-lg font-semibold text-slate-900">
              {{ data.cleanup.affectedLocationsCount }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 bg-white p-3">
            <p class="text-xs text-slate-500">Relations PM/Bâtiments</p>
            <p class="text-lg font-semibold text-slate-900">
              {{ data.cleanup.removedLegalEntityLocationRelationsCount }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 bg-white p-3">
            <p class="text-xs text-slate-500">Relations Pro/PM supprimées</p>
            <p class="text-lg font-semibold text-slate-900">
              {{ data.cleanup.removedProLegalEntityRelationsCount }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{ data.cleanup.removedProLegalEntityProsCount }} pro(s)
            </p>
          </article>
          <article class="rounded-xl border border-red-200 bg-red-50 p-3">
            <p class="text-xs text-red-700">Bâtiments supprimés</p>
            <p class="text-lg font-semibold text-red-800">
              {{ data.cleanup.deletedLocationsCount }}
            </p>
          </article>
          <article
            class="rounded-xl border border-emerald-200 bg-emerald-50 p-3"
          >
            <p class="text-xs text-emerald-700">Bâtiments conservés</p>
            <p class="text-lg font-semibold text-emerald-800">
              {{ data.cleanup.retainedLocationsCount }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 bg-white p-3">
            <p class="text-xs text-slate-500">
              Relations Pro/Bâtiments supprimées
            </p>
            <p class="text-lg font-semibold text-slate-900">
              {{ data.cleanup.removedProLocationRelationsCount }}
            </p>
          </article>
          <article
            class="rounded-xl border border-slate-200 bg-white p-3 md:col-span-3"
          >
            <p class="text-xs text-slate-500">Pros concernés</p>
            <p class="text-lg font-semibold text-slate-900">
              {{ data.impactedPros.length }}
            </p>
          </article>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white">
          <header
            class="border-b border-slate-200 px-4 py-3 text-sm font-semibold"
          >
            Détail pros concernés
          </header>
          <div class="max-h-72 overflow-auto">
            @if (data.impactedPros.length === 0) {
              <p class="px-4 py-3 text-sm text-slate-500">
                Aucun pro concerné.
              </p>
            } @else {
              @for (pro of data.impactedPros; track pro.proUuid) {
                <div
                  class="grid grid-cols-1 gap-2 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 md:grid-cols-6"
                >
                  <div class="min-w-0 md:col-span-2">
                    <p class="truncate font-medium text-slate-900">
                      {{ pro.proName ?? "Pro inconnu" }}
                    </p>
                    <p class="truncate text-xs text-slate-500">
                      {{ pro.proUuid }}
                    </p>
                  </div>
                  <p class="text-slate-700">
                    Relations:
                    <strong>
                      {{ pro.nbRelationsWithAffectedLocations }}
                    </strong>
                  </p>
                  <p class="text-slate-700">
                    Bâtiments liés:
                    <strong>{{ pro.nbAffectedLocations }}</strong>
                  </p>
                  <p class="text-slate-700">
                    Relations supprimées:
                    <strong>{{ pro.nbRelationsOnDeletedLocations }}</strong>
                  </p>
                  <p class="text-slate-700">
                    Bâtiments supprimés liés:
                    <strong>{{ pro.nbDeletedLocationsRelated }}</strong>
                  </p>
                </div>
              }
            }
          </div>
        </section>
      </div>

      <footer class="mt-6 flex justify-center">
        <oui-button variant="primary" (click)="dialogRef.close(undefined)">
          Fermer
        </oui-button>
      </footer>
    </op-dialog-wrapper>
  `,
  imports: [ButtonComponent, DialogHeadingComponent, DialogWrapperComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalEntityDeleteResultDialogComponent extends StronglyTypedDialog<
  LegalEntityDeleteResultDialogData,
  void
> {}
