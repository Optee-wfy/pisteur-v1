import type { ElementRef } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import type { YouSignEvent } from "@optee/constants";
import { youSignEventSchema } from "@optee/constants";
import {
  DialogHeadingComponent,
  DialogWrapperComponent,
  StronglyTypedDialog,
} from "@optee/dialog";
import { environment } from "@optee/env";
import { ToastService } from "@optee/ui/services/toast.service";
import { formatZodError, isNotNullish } from "@optee/utils";
import { bindCallback, filter, map, shareReplay, switchMap } from "rxjs";

declare let Yousign: new (options: {
  signatureLink: string;
  iframeContainerId: string;
  isSandbox: boolean;
  iFrameAttributes: Record<string, string>;
}) => { onError: () => void; onSignatureDone: () => void };

@Component({
  selector: "mkp-you-sign-signer",
  template: `
    <op-dialog-wrapper
      class="h-[95dvh] w-[90vw] max-w-[90vw]"
      (crossClick)="close()"
    >
      <op-dialog-heading heading="Signature du document" />

      <div class="h-full w-full" id="yousign-frame" #yousignEl></div>
    </op-dialog-wrapper>
  `,
  styles: [
    `
      ::ng-deep iframe {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  imports: [DialogWrapperComponent, DialogHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YousignSignerDialogComponent extends StronglyTypedDialog<
  {
    signatureLink: string;
  },
  null | YouSignEvent
> {
  private readonly divEl = viewChild<ElementRef>("yousignEl");

  private readonly signatureDone = signal<YouSignEvent | null>(null);

  private readonly toastService = inject(ToastService);

  private readonly yousign$ = toObservable(this.divEl).pipe(
    filter(isNotNullish),
    map(
      (el) =>
        new Yousign({
          signatureLink: this.data.signatureLink,
          iframeContainerId: el.nativeElement.id,
          isSandbox: environment.slug !== "production",
          iFrameAttributes: {
            referrerPolicy: "origin-when-cross-origin",
          },
        }),
    ),
    shareReplay(1),
  );

  private readonly subYouSignError = this.yousign$
    .pipe(
      switchMap((yousign) => bindCallback(yousign.onError.bind(yousign))()),
      takeUntilDestroyed(),
    )
    .subscribe((data) => {
      this.toastService.open(
        "error",
        "Signature du document",
        "Une erreur est survenue lors de la signature du document. Merci de contacter le support.",
      );
      const parsed = youSignEventSchema.safeParse(data);
      if (parsed.error) {
        console.error(
          "Format de retour de Yousign inattendu: ",
          formatZodError(parsed.error)?.errors?.join(", "),
        );
      }
      if (parsed.success) {
        this.dialogRef.close(parsed.data);
      }
    });

  private readonly subYouSignSignatureDone = this.yousign$
    .pipe(
      switchMap((yousign) =>
        bindCallback(yousign.onSignatureDone.bind(yousign))(),
      ),
      takeUntilDestroyed(),
    )
    .subscribe((data) => {
      const parsed = youSignEventSchema.safeParse(data);
      if (parsed.error) {
        console.error(
          "Format de retour de Yousign inattendu: ",
          formatZodError(parsed.error)?.errors?.join(", "),
        );
        return;
      }
      this.signatureDone.set(parsed.data);
    });

  close() {
    this.dialogRef.close(this.signatureDone());
  }
}
