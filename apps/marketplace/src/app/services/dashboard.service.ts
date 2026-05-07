import { inject, Injectable } from "@angular/core";
import { QuoteStage } from "@optee/constants";
import { isNotNullish } from "@optee/utils";
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import trpcClient from "../../trpc-client";
import { OperationService } from "./operation.service";
import { ProService } from "./pro.service";
import { QuoteService } from "./quote.service";

@Injectable()
export class DashboardService {
  protected readonly proService = inject(ProService);
  protected readonly operationService = inject(OperationService);
  protected readonly quoteService = inject(QuoteService);

  private readonly refreshAll$ = new Subject<void>();

  refreshAll() {
    this.refreshAll$.next();
  }

  readonly subscription$ = this.proService.pro$.pipe(
    map((pro) => pro?.subscription),
    distinctUntilChanged(),
    shareReplay(1),
  );

  private readonly quotes$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => from(this.quoteService.getAllForPro())),
    shareReplay(1),
  );

  private readonly quotesCount$ = this.quotes$.pipe(
    map((quotes) => quotes.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  private readonly acceptedQuotesCount$ = this.quotes$.pipe(
    map((quotes) =>
      quotes.filter(
        (q) => q.stage === QuoteStage.DEVIS_SIGNE && q.operationUuid,
      ),
    ),
    map((quotes) => quotes.length),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly getOperationsStatisticsForPro$ = this.refreshAll$.pipe(
    startWith(""),
    switchMap(() => from(trpcClient.operations.getStatisticsForPro.query())),
    shareReplay(1),
  );

  readonly acceptedQuotesPercent$ = combineLatest([
    this.acceptedQuotesCount$,
    this.quotesCount$,
  ]).pipe(
    map(([acceptedQuotes, quotes]) => {
      if (quotes === 0) {
        return 0;
      }
      const percent = (acceptedQuotes / quotes) * 100;
      return Math.round(percent);
    }),
    filter(isNotNullish),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly isLoading$ = combineLatest([
    this.getOperationsStatisticsForPro$,
    this.acceptedQuotesPercent$,
  ]).pipe(
    map(() => false),
    startWith(true),
    distinctUntilChanged(),
    shareReplay(1),
  );
}
