import { AsyncPipe, CurrencyPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  getConnectionsBySubscription,
  getMaxConnections,
  ProSubscription,
} from "@optee/constants";
import { DialogService } from "@optee/dialog";
import {
  IconAuditComponent,
  IconLightHandshakeComponent,
  IconRefreshComponent,
} from "@optee/icons";
import { BubbleComponent } from "@optee/ui/components/atoms/bubble/bubble.component";
import { CirclePercentComponent } from "@optee/ui/components/atoms/circle-percent/circle-percent/circle-percent.component";
import { StockComponent } from "@optee/ui/components/molecules/stock/stock.component";
import { TitleTightComponent } from "@optee/ui/components/molecules/title-tight/title-tight.component";
import { EveComponent } from "@optee/ui/components/organisms/eve/eve.component";
import { ProgressBar } from "primeng/progressbar";
import { AppService } from "../../../services/app.service";
import { DashboardService } from "../../../services/dashboard.service";
import { MainNavIconComponent } from "../../layout/main-nav-icon.component";
import { LocationOperationSimulatorDialogComponent } from "../../pro/cyclope/contacts-tab/location-operation-simulator.dialog";

@Component({
  selector: "mkp-dashboard-portfolio-pro",
  host: {
    class: "flex flex-col lg:gap-10 gap-6",
  },
  template: `
    <oui-eve>
      @if (dashboardService.isLoading$ | async) {
        <div class="flex items-center gap-2">
          <icon-refresh class="size-4 animate-spin" />
          <p class="py-3 text-lg font-medium">Chargement en cours...</p>
        </div>
      } @else {
        <oui-title-tight class="mb-8">Mes projets</oui-title-tight>
        <div class="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-8">
          <oui-stock
            labelA="Opérations"
            labelB="disponibles"
            routerLink="/pro/marketplace/explore"
            [forceNewLine]="appService.isMobile$ | async"
            [value]="
              (dashboardService.getOperationsStatisticsForPro$ | async)
                ?.availableOperationsCount ?? 0
            "
          />

          <oui-stock
            labelA="Opérations"
            labelB="en négociation"
            routerLink="/pro/dashboard"
            [forceNewLine]="appService.isMobile$ | async"
            [value]="
              (dashboardService.getOperationsStatisticsForPro$ | async)
                ?.upcomingOperationsCount ?? 0
            "
          />

          <oui-stock
            labelA="Projets"
            labelB="signés"
            routerLink="/pro/dashboard"
            [forceNewLine]="appService.isMobile$ | async"
            [value]="
              (dashboardService.getOperationsStatisticsForPro$ | async)
                ?.signedOperationsCount ?? 0
            "
          />

          <oui-stock
            labelA="Chiffre d'affaires"
            labelB="signé"
            routerLink="/pro/dashboard"
            [forceNewLine]="appService.isMobile$ | async"
            [value]="
              (dashboardService.getOperationsStatisticsForPro$ | async)
                ?.operationsRevenue ?? 0 | currency: 'EUR' : 'symbol' : '1.0-0'
            "
          />

          <div
            class="col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:col-span-4 xl:gap-8"
          >
            <oui-bubble routerLink="/pro/marketplace/explore">
              <mkp-main-nav-icon class="size-5" headerIcon="lens" />
              <span>Projets disponibles</span>
            </oui-bubble>

            <oui-bubble (click)="simulate()">
              <mkp-main-nav-icon class="size-5" headerIcon="consultations" />
              Simuler une opération
            </oui-bubble>

            <oui-bubble routerLink="/pro/user">
              <mkp-main-nav-icon class="size-5" headerIcon="user" />
              Modifier mes informations
            </oui-bubble>
          </div>
        </div>
      }
    </oui-eve>

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-8">
      <div
        class="card card--blue col-span-2 flex flex-col justify-center gap-2 !p-6"
      >
        <div class="flex items-center gap-2">
          <icon-audit class="size-6" />
          <oui-title-tight>Taux de conversion</oui-title-tight>
        </div>
        <span>Pourcentage de devis acceptés depuis votre inscription</span>

        <div class="flex items-center gap-4">
          <p-progressbar
            class="flex-auto"
            styleClass="p-progressbar--dark"
            [showValue]="false"
            [value]="dashboardService.acceptedQuotesPercent$ | async"
          />

          <div class="font-semibold">
            {{ dashboardService.acceptedQuotesPercent$ | async }}%
          </div>
        </div>
      </div>
      @let sub = (subscription$ | async) ?? SubscriptionType.ESSENTIAL;
      @let connections = getConnectionsBySubscription(sub);
      <div
        class="card pointer-events-none col-span-2 flex items-center justify-between gap-6 bg-white !p-6"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <icon-light-handshake class="size-8" colorMode="colored" />

            <oui-title-tight>Mises en relation</oui-title-tight>
          </div>
          <div class="max-w-80">
            @if (sub === SubscriptionType.IMPACT) {
              Chaque mois, profitez de
              <b>
                {{ connections }} mise{{ connections > 1 ? "s" : "" }} en
                relation qualifiée{{ connections > 1 ? "s" : "" }}
              </b>
              avec {{ connections > 1 ? "des" : "un" }} client{{
                connections > 1 ? "s" : ""
              }}.
            } @else {
              <b>Passez au niveau supérieur</b>
              pour débloquer la mise en relation directe avec nos clients.
              Contactez Optee pour améliorer votre offre.
            }
          </div>
        </div>

        <oui-circle-percent
          class="size-32 bg-white"
          [maxValue]="getMaxConnections()"
          [value]="connections"
        />
      </div>
    </div>
  `,
  styles: `
    .card {
      @apply font-display shadow-o hover:shadow-o2 flex-1 cursor-pointer rounded-2xl p-4 transition-all hover:-translate-y-1;
    }

    .card--blue {
      @apply bg-primary-900 text-white;
    }
  `,
  imports: [
    AsyncPipe,
    TitleTightComponent,
    MainNavIconComponent,
    RouterModule,
    EveComponent,
    StockComponent,
    BubbleComponent,
    ProgressBar,
    CirclePercentComponent,
    IconAuditComponent,
    IconLightHandshakeComponent,
    CurrencyPipe,
    IconRefreshComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPortfolioProComponent {
  protected readonly dashboardService = inject(DashboardService);
  protected readonly appService = inject(AppService);
  private readonly dialogService = inject(DialogService);

  protected readonly SubscriptionType = ProSubscription;
  protected readonly getConnectionsBySubscription =
    getConnectionsBySubscription;

  protected readonly subscription$ = this.dashboardService.subscription$;

  protected readonly getMaxConnections = getMaxConnections;

  simulate() {
    this.dialogService.open(LocationOperationSimulatorDialogComponent);
  }
}
