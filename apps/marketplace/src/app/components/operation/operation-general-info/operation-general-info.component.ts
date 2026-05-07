import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import type { OperationFull, OperationRow } from "@optee/models";
import { TelephoneLinkPipe } from "@optee/ui/pipes/telephone-link.pipe";
import { AuthService } from "../../../services/auth.service";
import { OperationService } from "../../../services/operation.service";
import { ProService } from "../../../services/pro.service";
import { LocationBdnbComponent } from "../../location/location-bdnb/location-bdnb.component";
import { OperationSignatoryComponent } from "../operation-signatory/operation-signatory.component";

@Component({
  selector: "mkp-operations-general-info",
  host: {
    class: "flex flex-col gap-6",
  },
  template: `
    @let operationValue = operation();

    <!-- Global information about operation and client -->
    @if (operationService.isOperationFull(operationValue)) {
      <div class="bg-primary-100 grid gap-6 rounded-2xl p-4 font-medium">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <span class="col-span-3 text-sm font-normal text-gray-600">
              Statut
            </span>

            <button
              class="text-primary-700 col-span-5 w-fit cursor-pointer underline"
              type="button"
              (click)="redirectToQuote()"
            >
              {{ operationStatusLabel() }}
            </button>
          </div>
          <div class="flex flex-col">
            <span class="col-span-3 text-sm font-normal text-gray-600">
              Date d’ajout de l’opération
            </span>
            @if (operationValue.createdAt) {
              <span class="text-primary-900 text-base font-medium">
                {{ operationValue.createdAt | date }}
              </span>
            } @else {
              <span class="text-sm font-normal text-gray-600">--</span>
            }
          </div>

          <!-- Entreprise Prestataire -->
          @if (!authService.isLoggedAsPro() && operationValue.pro; as pro) {
            <div class="flex flex-col">
              <span class="col-span-3 text-sm font-normal text-gray-600">
                Entreprise prestataire
              </span>

              <span
                class="text-primary-900 col-span-5 col-start-4 text-base font-medium"
              >
                {{ pro.name }}
              </span>

              @if (pro.mailContact) {
                <a
                  class="text-primary-900 col-span-5 col-start-4 text-base font-medium hover:underline"
                  [href]="'mailto:' + pro.mailContact"
                >
                  {{ pro.mailContact }}
                </a>
              } @else {
                <span class="text-sm font-normal text-gray-600">--</span>
              }
            </div>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <span class="col-span-3 text-sm font-normal text-gray-600">
              Date de lancement
            </span>
            @if (operationValue.launchingDate) {
              <span class="text-primary-900 text-base font-medium">
                {{ operationValue.launchingDate | date }}
              </span>
            } @else {
              <span class="text-sm font-normal text-gray-600">--</span>
            }
          </div>
          <div class="flex flex-col">
            <span class="col-span-5 text-sm font-normal text-gray-600">
              Date prévue de fin de travaux
            </span>
            @if (operationValue.completionDate) {
              <span class="text-primary-900 text-base font-medium">
                {{ operationValue.completionDate | date }}
              </span>
            } @else {
              <span class="text-sm font-normal text-gray-600">--</span>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Signatory contact -->
          <div class="flex flex-col">
            <span class="col-span-3 text-sm font-normal text-gray-600">
              {{ authService.isLoggedAsPro() ? "Décisionnaire" : "Signataire" }}
            </span>
            @if (operationValue.status.category !== "upcoming") {
              <mkp-operation-signatory
                [operationUuid]="operationValue.uuid"
                [signatory]="operationValue.signatoryContact"
              />
            } @else {
              <span class="text-sm font-normal text-gray-600">--</span>
            }
          </div>

          <!-- Contact -->
          <div class="flex flex-col">
            <span class="col-span-3 text-sm font-normal text-gray-600">
              Contact sur place
            </span>
            @if (
              operationValue.location.nameContactOnSite ||
              operationValue.location.phoneContactOnSite
            ) {
              @if (operationValue.location.nameContactOnSite; as name) {
                <span class="text-primary-900 text-base font-medium">
                  {{ name }}
                </span>
              }
              @if (operationValue.location.phoneContactOnSite; as phone) {
                <a
                  class="text-primary-900 text-base font-medium underline"
                  [href]="phone | telephoneLink"
                >
                  {{ phone }}
                </a>
              }
            } @else {
              <span class="text-sm font-normal text-gray-600">--</span>
            }
          </div>
        </div>

        @if (operationValue.additionalInfo) {
          <div class="grid grid-cols-2 gap-4">
            <!-- Notes supplémentaire -->
            <div class="flex flex-col">
              <span class="col-span-3 text-sm font-normal text-gray-600">
                Notes supplémentaires
              </span>
              <span
                class="text-primary-900 col-span-5 col-start-4 text-base font-medium"
              >
                {{ operationValue.additionalInfo }}
              </span>
            </div>
          </div>
        }
      </div>
      <hr class="text-primary-200" />
    }

    @if (authService.isLoggedAsPro()) {
      <p class="text-lg font-medium text-gray-600">Données du bâtiment</p>
      <mkp-location-bdnb
        class="text-gray-600"
        hideAddress
        theme="light"
        [location]="operationValue.location"
      />
    } @else {
      <!-- Description / definition of the operation -->
      @if (
        authService.isLoggedAsClient() && operationValue.typeInfo.description;
        as description
      ) {
        <div class="flex max-w-prose flex-col gap-4">
          <div class="flex flex-col gap-1">
            <h4 class="leading-8">🔍 Définition</h4>
            <span class="text-gray-600">
              {{ description.definition }}
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <h4 class="leading-8">🏗️ Mise en œuvre / Méthodologie</h4>
            <span class="text-gray-600">
              {{ description.implementation }}
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <h4 class="leading-8">📝 Critères techniques ou réglementaires</h4>
            <ul class="list-inside list-disc space-y-1 pl-2 text-gray-600">
              @for (item of description.technical_criteria; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <h4 class="leading-8">🟢 Avantages</h4>
            <ul class="list-inside list-disc space-y-1 pl-2 text-gray-600">
              @for (item of description.advantages; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <h4 class="leading-8">⚠️ Points de vigilance</h4>

            <ul class="list-inside list-disc space-y-1 pl-2 text-gray-600">
              @for (item of description.vigilance_points; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </div>

          <div class="flex flex-col gap-1">
            <h4 class="leading-8">📍 À noter</h4>
            <span class="text-gray-600">
              {{ description.note }}
            </span>
          </div>
        </div>
      }
    }
  `,
  imports: [
    RouterModule,
    DatePipe,
    TelephoneLinkPipe,
    OperationSignatoryComponent,
    LocationBdnbComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsGeneralInfoComponent {
  readonly operation = input.required<OperationRow | OperationFull>();

  protected readonly operationService = inject(OperationService);
  protected readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  protected readonly proService = inject(ProService);

  protected readonly operationStatusLabel = computed(() =>
    this.operationService.getOperationStatusLabel({
      operation: this.operation(),
      loggedAsPro: this.authService.isLoggedAsPro(),
      currentProUuid: this.proService.currentProUuid(),
    }),
  );

  protected redirectToQuote() {
    if (!this.authService.isLoggedAsPro()) {
      this.router.navigate(["/client/quotes"]);
    } else {
      this.operationService.closePanel();
    }
  }
}
