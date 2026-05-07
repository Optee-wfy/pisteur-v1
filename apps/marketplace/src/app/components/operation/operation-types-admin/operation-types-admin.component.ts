import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { OPERATION_SUBTYPES, OPERATION_TYPES_ARR } from "@optee/constants";
import { MessageComponent } from "@optee/ui/components/molecules/message/message.component";
import { BobComponent } from "@optee/ui/components/organisms/bob/bob.component";
import { MultiSelect } from "primeng/multiselect";
import { from, map, shareReplay, startWith } from "rxjs";
import trpcClient from "../../../../trpc-client";
import { OperationTagComponent } from "../operation-tag/operation-tag.component";
import { OperationTypesRowComponent } from "../operation-types-row/operation-types-row.component";

const COLUMNS = [
  { id: "heating", label: "Chauffage", width: "140px" },
  { id: "sector", label: "Secteurs", width: "140px" },
  { id: "complexity", label: "Complexité", width: "100px" },
  { id: "ceeFile", label: "Fiche CEE", width: "250px" },
  { id: "kwhAmount", label: "Conso (Kwh)", width: "250px", default: true },
  { id: "impact", label: "Impact (%)", width: "250px", default: true },
  { id: "cost", label: "Coût", width: "250px", default: true },
  { id: "coefficient", label: "Coeff", width: "250px", default: true },
];

@Component({
  selector: "mkp-operation-types-admin",
  template: `
    <oui-bob class="flex-auto" heading="Type d'opérations">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4">
          <p-multiSelect
            emptyFilterMessage="Aucun résultat"
            placeholder="Opérations visibles"
            [formControl]="nameControl"
            [options]="OPERATION_TYPES_LABELS"
            [showClear]="true"
          />

          <p-multiSelect
            emptyFilterMessage="Aucun résultat"
            optionLabel="label"
            optionValue="id"
            placeholder="Colonnes visibles"
            [formControl]="columnControl"
            [options]="COLUMNS"
            [showClear]="true"
          />
        </div>

        <div class="flex gap-4">
          <!-- Hubspot operation -->
          @if (
            (missingHsOperationsTypes$ | async) ||
            (missingOperationTypes$ | async)
          ) {
            <div class="flex flex-1 flex-col gap-4">
              @if (
                missingHsOperationsTypes$ | async;
                as missingHsOperationsTypes
              ) {
                @if (missingHsOperationsTypes.length) {
                  <oui-message severity="warn">
                    Types d'opérations existants sur Hubspot mais absents de
                    l'application:
                    <strong>
                      {{ missingHsOperationsTypes }}
                    </strong>
                  </oui-message>
                }
              }

              @if (missingOperationTypes$ | async; as missingOperationTypes) {
                @if (missingOperationTypes.length) {
                  <oui-message severity="warn">
                    Types d'opérations existants sur l'application mais absents
                    de Hubspot:
                    <strong>
                      {{ missingOperationTypes }}
                    </strong>
                  </oui-message>
                }
              }
            </div>
          }

          <!-- Pro prestations -->
          <div class="flex flex-1 flex-col gap-4">
            @if (
              missingHsProsPrestationTypes$ | async;
              as missingHsProPrestationsTypes
            ) {
              @if (missingHsProPrestationsTypes.length > 0) {
                <oui-message severity="warn">
                  Types de prestations des professionnels existants sur Hubspot
                  mais absents de l'application:
                  <strong>
                    {{ missingHsProPrestationsTypes }}
                  </strong>
                </oui-message>
              }
            }

            @if (missingOperationTypes$ | async; as missingOperationTypes) {
              @if (missingOperationTypes.length) {
                <oui-message severity="warn">
                  Types d'opérations existants sur l'application mais absents de
                  Hubspot (au niveau des prestations de professionnels):
                  <strong>
                    {{ missingOperationTypes }}
                  </strong>
                </oui-message>
              }
            }
          </div>
        </div>

        @if (visibleColumns$ | async; as visibleColumns) {
          <table
            class="min-w-full table-fixed border-separate border-spacing-y-4"
          >
            <thead
              class="font-display bg-primary-50 shadow-o2 sticky -top-10 text-left text-sm"
            >
              <tr>
                <th class="text-primary-900 min-w-72 max-w-96 font-medium">
                  Nom
                </th>

                @for (col of visibleColumns; track col.id) {
                  <th
                    class="text-primary-900 font-medium"
                    [style.minWidth.px]="col.width"
                  >
                    {{ col.label }}
                  </th>
                }
              </tr>
            </thead>

            @for (
              operationType of operationsTypes$ | async;
              track operationType.label
            ) {
              <tr>
                <td
                  class="bg-primary-200"
                  [colSpan]="visibleColumns.length + 1"
                >
                  <div class="flex items-center gap-4">
                    <mkp-operation-tag
                      class="max-w-[240px]"
                      [operationType]="operationType"
                    />

                    <div
                      class="text-xs font-normal leading-none tracking-tight text-gray-600"
                    >
                      Type:
                      <strong>{{ operationType.type }}</strong>
                      , Label Hubspot:
                      <strong>{{ operationType.hsOperationCategory }}</strong>
                      , Filtre marketplace:
                      <strong>
                        {{
                          operationType.showAsMarketplaceFilter ? "Oui" : "Non"
                        }}
                      </strong>
                    </div>
                  </div>
                </td>
              </tr>

              <tbody class="overflow-auto">
                @for (
                  subType of operationType.subTypes;
                  track subType.hsPrestationId
                ) {
                  <mkp-operation-types-row
                    [subType]="subType"
                    [visibleColumnsIds]="(visibleColumnsIds$ | async) ?? []"
                  />
                }
              </tbody>
            }
          </table>
        }
      </div>
    </oui-bob>
  `,
  styles: `
    th,
    td {
      @apply p-4;
    }
  `,
  imports: [
    BobComponent,
    AsyncPipe,
    OperationTagComponent,
    MessageComponent,
    MultiSelect,
    OperationTypesRowComponent,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationTypesAdminComponent {
  OPERATION_TYPES_ARR = OPERATION_TYPES_ARR;
  OPERATION_TYPES_LABELS = OPERATION_SUBTYPES.map((subType) => subType.label);
  COLUMNS = COLUMNS;

  nameControl = new FormControl<string[]>([]);
  columnControl = new FormControl(
    COLUMNS.filter((column) => column.default).map((column) => column.id),
  );

  hsOperationsTypes$ = from(
    trpcClient.operations.getHubspotOperationTypes.query(),
  ).pipe(shareReplay(1));

  missingHsOperationsTypes$ = this.hsOperationsTypes$.pipe(
    map(this.concatInexistantsOperationType),
    shareReplay(1),
  );

  missingOperationTypes$ = this.hsOperationsTypes$.pipe(
    map((hsOperationsTypes) => {
      return OPERATION_SUBTYPES.filter(
        (operationType) =>
          !hsOperationsTypes.includes(operationType.hsPrestationId),
      );
    }),
    map((hsOperationsTypes) =>
      hsOperationsTypes.map((ot) => ot.hsPrestationId).join(", "),
    ),
    shareReplay(1),
  );

  hsProsPrestationTypes$ = from(
    trpcClient.pros.getHubspotPrestations.query(),
  ).pipe(shareReplay(1));

  missingHsProsPrestationTypes$ = this.hsProsPrestationTypes$.pipe(
    map(this.concatInexistantsOperationType),
    shareReplay(1),
  );

  missingProsPrestationTypes$ = this.hsProsPrestationTypes$.pipe(
    map((hsPrestation) => {
      return OPERATION_SUBTYPES.filter(
        (operationType) => !hsPrestation.includes(operationType.hsPrestationId),
      );
    }),
    map((hsOperationsTypes) =>
      hsOperationsTypes.map((ot) => ot.hsPrestationId).join(", "),
    ),
    shareReplay(1),
  );

  operationsTypes$ = this.nameControl.valueChanges
    .pipe(startWith(this.nameControl.value))
    .pipe(
      map((names) =>
        OPERATION_TYPES_ARR.map((operationType) => ({
          ...operationType,
          subTypes: operationType.subTypes.filter((subType) => {
            return !names || !names.length || names.includes(subType.label);
          }),
        })).filter((operationType) => operationType.subTypes.length > 0),
      ),
    );

  visibleColumns$ = this.columnControl.valueChanges.pipe(
    startWith(this.columnControl.value),
    map((columns) =>
      COLUMNS.filter(
        (column) => !columns || !columns.length || columns.includes(column.id),
      ),
    ),
  );

  visibleColumnsIds$ = this.visibleColumns$.pipe(
    map((columns) => columns.map((column) => column.id)),
  );

  private concatInexistantsOperationType(prestations: string[]) {
    const inexistants = prestations.filter(
      (prestation) =>
        !OPERATION_SUBTYPES.find(
          (operationType) => operationType.hsPrestationId === prestation,
        ),
    );
    return inexistants.join(", ");
  }
}
