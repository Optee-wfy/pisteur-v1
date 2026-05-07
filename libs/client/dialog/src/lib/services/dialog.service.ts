import { DIALOG_DATA } from "@angular/cdk/dialog";
import { Overlay } from "@angular/cdk/overlay";
import type { ComponentType } from "@angular/cdk/portal";
import { ComponentPortal } from "@angular/cdk/portal";
import { inject, Injectable, Injector } from "@angular/core";
import { firstValueFrom, take } from "rxjs";
import { CDKDialogRef } from "../components/cdk-dialog-ref/cdk-dialog-ref";
import { type StronglyTypedDialog } from "../directives/typed-dialog.directive";

@Injectable({ providedIn: "root" })
export class DialogService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  private dialogCount = 0;

  async open<DialogData, DialogResult>(
    component: ComponentType<StronglyTypedDialog<DialogData, DialogResult>>,
    config: {
      data?: DialogData;
      disableClose?: boolean;
      additionalClasses?: string[];
    } = {},
  ): Promise<{
    dialogRef: CDKDialogRef<DialogResult>;
    res: DialogResult | null;
  }> {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: "cdk-overlay-dark-backdrop",
      panelClass: [...(config.additionalClasses ?? []), "cdk-overlay-panel"],
      usePopover: false,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const dialogRef = new CDKDialogRef<DialogResult>(overlayRef);
    const injector = Injector.create({
      providers: [
        { provide: DIALOG_DATA, useValue: config.data },
        { provide: CDKDialogRef, useValue: dialogRef },
      ],
      parent: this.injector,
    });

    const portal = new ComponentPortal(component, null, injector);
    overlayRef.attach(portal);

    if (!config.disableClose) {
      overlayRef
        .backdropClick()
        .pipe(take(1))
        .subscribe(() => {
          dialogRef.close(null);
        });
    }

    this.dialogCount++;

    try {
      const res = await firstValueFrom(dialogRef.afterClosed$.pipe(take(1)));
      return { dialogRef, res };
    } finally {
      this.dialogCount--;
    }
  }

  getDialogCount() {
    return this.dialogCount;
  }

  isDialogOpen() {
    return this.dialogCount > 0;
  }
}
