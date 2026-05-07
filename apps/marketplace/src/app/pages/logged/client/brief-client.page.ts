import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  BRIEF_PAGE_SOURCE_QUERY_PARAM,
  CLIENT_TRACKING_EVENTS,
} from "@optee/constants";
import type { OperationUuid } from "@optee/models";
import { z } from "zod";
import { OperationBriefComponent } from "../../../components/operation/operation-brief/operation-brief.component";
import { TrackingService } from "../../../services/tracking.service";

@Component({
  selector: "mkp-brief-page",
  host: {
    class:
      "flex gap-6 2xl:gap-10 flex-col-reverse justify-center lg:flex-row p-4 xl:p-10",
  },
  template: `
    <mkp-operation-brief [access]="access" [operationUuid]="operationUuid()" />
  `,
  imports: [OperationBriefComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BriefPageComponent {
  operationUuid = input.required<OperationUuid>();
  access = "editable" as const;

  protected readonly route = inject(ActivatedRoute);
  protected readonly trackingService = inject(TrackingService);

  protected readonly trackingEffect = effect(() => {
    const sourceParam =
      this.route.snapshot.queryParams[BRIEF_PAGE_SOURCE_QUERY_PARAM] ??
      "Direct";

    const res = z
      .enum(CLIENT_TRACKING_EVENTS.brief_open.properties.source)
      .safeParse(sourceParam);

    if (res.success) {
      this.trackingService.trackClient("brief_open", {
        source: res.data,
      });
    }
  });
}
