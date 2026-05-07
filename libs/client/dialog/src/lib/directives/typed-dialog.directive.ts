import { DIALOG_DATA } from "@angular/cdk/dialog";
import { Directive, inject, signal } from "@angular/core";
import { CDKDialogRef } from "../components/cdk-dialog-ref/cdk-dialog-ref";

@Directive()
export abstract class StronglyTypedDialog<DialogData, DialogResult> {
  protected readonly data: DialogData = inject(DIALOG_DATA);
  protected readonly dialogRef: CDKDialogRef<DialogResult> =
    inject(CDKDialogRef);

  modalFadedOut = signal(false);
}
